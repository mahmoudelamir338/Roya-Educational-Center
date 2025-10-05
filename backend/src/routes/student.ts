import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireStudent } from '../middleware/auth';
import { createValidationError } from '../middleware/errorHandler';
import { Student, Class, Attendance, Payment, Notification } from '../models';

const router = express.Router();

// تطبيق middleware الطالب على جميع المسارات
router.use(requireStudent);

// لوحة تحكم الطالب
router.get('/dashboard', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user?.id })
      .populate('userId', 'name phone')
      .populate('guardianId', 'userId')
      .populate('enrolledClasses', 'name subject teacherId schedule');

    if (!student) {
      throw new Error('ملف الطالب غير موجود');
    }

    const today = new Date();

    // إحصائيات الحضور الشهرية
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const attendance = await Attendance.find({
      studentId: student._id,
      date: { $gte: startOfMonth }
    });

    const attendanceStats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    // الفصول اليومية
    const todayClasses = await Class.find({
      _id: { $in: student.enrolledClasses },
      'schedule.day': ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'][today.getDay()]
    }).populate('teacherId', 'userId');

    // المدفوعات المعلقة
    const pendingPayments = await Payment.find({
      studentId: student._id,
      status: { $in: ['pending', 'overdue'] }
    }).sort({ dueDate: 1 });

    // الإشعارات الجديدة
    const unreadNotifications = await Notification.countDocuments({
      recipientId: req.user?.id,
      status: { $ne: 'read' }
    });

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.userId?.name,
          grade: student.grade,
          balance: student.balance,
          status: student.status
        },
        attendance: {
          ...attendanceStats,
          rate: attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0
        },
        todaySchedule: todayClasses,
        pendingPayments,
        unreadNotifications
      }
    });

  } catch (error) {
    next(error);
  }
});

// فصول الطالب
router.get('/classes', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      throw new Error('ملف الطالب غير موجود');
    }

    const classes = await Class.find({ _id: { $in: student.enrolledClasses } })
      .populate('teacherId', 'userId')
      .sort({ 'schedule.day': 1, 'schedule.startTime': 1 });

    res.status(200).json({
      success: true,
      data: { classes }
    });

  } catch (error) {
    next(error);
  }
});

// سجل الحضور الشخصي
router.get('/attendance', [
  query('startDate').optional().isISO8601().withMessage('تاريخ البداية غير صالح'),
  query('endDate').optional().isISO8601().withMessage('تاريخ النهاية غير صالح'),
  query('classId').optional().isMongoId().withMessage('معرف الفصل غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معلمات البحث غير صالحة', errors.array());
    }

    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      throw new Error('ملف الطالب غير موجود');
    }

    const { startDate, endDate, classId } = req.query;
    const filter: any = { studentId: student._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (classId) filter.classId = classId;

    const attendance = await Attendance.find(filter)
      .populate('classId', 'name subject')
      .populate('teacherId', 'userId')
      .sort({ date: -1, sessionNumber: -1 });

    // حساب الإحصائيات
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length,
      rate: 0
    };

    stats.rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        attendance,
        statistics: stats
      }
    });

  } catch (error) {
    next(error);
  }
});

// المدفوعات والفواتير
router.get('/payments', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      throw new Error('ملف الطالب غير موجود');
    }

    const payments = await Payment.find({ studentId: student._id })
      .populate('classIds', 'name subject')
      .sort({ createdAt: -1 });

    const summary = {
      totalPaid: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      totalOverdue: payments.filter(p => p.status === 'pending' && p.dueDate < new Date()).reduce((sum, p) => sum + p.amount, 0),
      balance: student.balance
    };

    res.status(200).json({
      success: true,
      data: {
        payments,
        summary
      }
    });

  } catch (error) {
    next(error);
  }
});

// دفع فاتورة
router.post('/payments/:paymentId/pay', [
  param('paymentId').isMongoId().withMessage('معرف الفاتورة غير صالح'),
  body('method').isIn(['cash', 'card', 'bank_transfer']).withMessage('طريقة الدفع غير صالحة'),
  body('transactionId').optional().isLength({ max: 200 }).withMessage('رقم المعاملة طويل جداً')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      throw new Error('ملف الطالب غير موجود');
    }

    const { paymentId } = req.params;
    const { method, transactionId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment || !payment.studentId.equals(student._id)) {
      throw new Error('الفاتورة غير موجودة أو غير مرتبطة بحسابك');
    }

    if (payment.status !== 'pending') {
      throw new Error('هذه الفاتورة تم دفعها بالفعل أو تم إلغاؤها');
    }

    // معالجة الدفع (هنا يمكن إضافة تكامل مع بوابات الدفع)
    payment.status = 'completed';
    payment.method = method;
    payment.paidDate = new Date();
    payment.transactionId = transactionId;
    payment.processedBy = req.user?.id;

    await payment.save();

    // تحديث رصيد الطالب
    student.balance = Math.max(0, student.balance - payment.amount);
    await student.save();

    // إرسال إشعار تأكيد الدفع
    await Notification.create({
      title: 'تأكيد الدفع',
      message: `تم تأكيد دفع فاتورة ${payment.invoiceNumber} بمبلغ ${payment.amount} جنيه`,
      type: 'payment',
      priority: 'medium',
      recipientType: 'student',
      recipientId: req.user?.id,
      senderId: req.user?.id,
      senderName: 'النظام',
      data: { paymentId: payment._id }
    });

    res.status(200).json({
      success: true,
      message: 'تم دفع الفاتورة بنجاح',
      data: { payment }
    });

  } catch (error) {
    next(error);
  }
});

// الإشعارات الخاصة بالطالب
router.get('/notifications', [
  query('status').optional().isIn(['sent', 'delivered', 'read']),
  query('type').optional().isIn(['attendance', 'payment', 'announcement', 'grade', 'system', 'reminder']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { recipientId: req.user?.id };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
          limit: Number(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// تحديد إشعار كمقروء
router.patch('/notifications/:notificationId/read', [
  param('notificationId').isMongoId().withMessage('معرف الإشعار غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معرف الإشعار غير صالح', errors.array());
    }

    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification || !notification.recipientId.equals(req.user?.id)) {
      throw new Error('الإشعار غير موجود أو غير مرتبط بحسابك');
    }

    notification.markAsRead();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديد الإشعار كمقروء'
    });

  } catch (error) {
    next(error);
  }
});

// تحديث الملف الشخصي
router.patch('/profile', [
  body('emergencyContact').optional().isObject(),
  body('emergencyContact.name').if(body('emergencyContact').exists()).notEmpty().withMessage('اسم جهة الاتصال مطلوب'),
  body('emergencyContact.phone').if(body('emergencyContact').exists()).matches(/^(\+20|0)?1[0-2,5]\d{8}$/).withMessage('رقم الهاتف غير صالح'),
  body('medicalInfo').optional().isObject()
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      throw new Error('ملف الطالب غير موجود');
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        (student as any)[key] = updates[key];
      }
    });

    await student.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: { student }
    });

  } catch (error) {
    next(error);
  }
});

// مواد دراسية للفصول المسجل بها الطالب
router.get('/materials', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      throw new Error('ملف الطالب غير موجود');
    }

    const classes = await Class.find({ _id: { $in: student.enrolledClasses } })
      .populate('teacherId', 'userId')
      .select('name subject materials teacherId');

    res.status(200).json({
      success: true,
      data: { classes }
    });

  } catch (error) {
    next(error);
  }
});

// تقرير الأداء الشخصي
router.get('/performance', [
  query('academicYear').optional().matches(/^\d{4}\/\d{4}$/),
  query('semester').optional().isIn(['الأول', 'الثاني'])
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      throw new Error('ملف الطالب غير موجود');
    }

    const { academicYear, semester } = req.query;

    const filter: any = { studentId: student._id };

    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const attendance = await Attendance.find(filter)
      .populate('classId', 'name subject')
      .sort({ date: -1 });

    // حساب المعدل لكل مادة
    const subjectPerformance = attendance.reduce((acc: any, record: any) => {
      const subject = record.classId.subject;
      if (!acc[subject]) {
        acc[subject] = {
          subject,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }

      acc[subject].total++;
      acc[subject][record.status]++;

      return acc;
    }, {});

    const performanceData = Object.values(subjectPerformance).map((subject: any) => ({
      ...subject,
      attendanceRate: Math.round((subject.present / subject.total) * 100)
    }));

    res.status(200).json({
      success: true,
      data: {
        performance: performanceData,
        overall: {
          totalSessions: attendance.length,
          attendanceRate: attendance.length > 0 ?
            Math.round((attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100) : 0
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;