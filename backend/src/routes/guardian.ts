import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireGuardian } from '../middleware/auth';
import { createValidationError } from '../middleware/errorHandler';
import { Guardian, Student, Attendance, Payment, Notification, Class } from '../models';

const router = express.Router();

// تطبيق middleware ولي الأمر على جميع المسارات
router.use(requireGuardian);

// لوحة تحكم ولي الأمر
router.get('/dashboard', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const guardian = await Guardian.findOne({ userId: req.user?.id })
      .populate('userId', 'name phone')
      .populate('children', 'userId grade status');

    if (!guardian) {
      throw new Error('ملف ولي الأمر غير موجود');
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // إحصائيات الأبناء
    const childrenIds = guardian.children.map(child => child._id);

    const [
      todayAttendance,
      monthlyAttendance,
      pendingPayments,
      unreadNotifications
    ] = await Promise.all([
      Attendance.countDocuments({
        studentId: { $in: childrenIds },
        date: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
      }),
      Attendance.countDocuments({
        studentId: { $in: childrenIds },
        date: { $gte: startOfMonth }
      }),
      Payment.countDocuments({
        studentId: { $in: childrenIds },
        status: 'pending'
      }),
      Notification.countDocuments({
        recipientId: req.user?.id,
        status: { $ne: 'read' }
      })
    ]);

    // إحصائيات الحضور لكل طفل
    const childrenAttendance = await Attendance.aggregate([
      { $match: { studentId: { $in: childrenIds } } },
      {
        $group: {
          _id: '$studentId',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        guardian: {
          name: guardian.userId?.name,
          childrenCount: guardian.children.length,
          relationship: guardian.relationship
        },
        children: guardian.children,
        attendance: {
          today: todayAttendance,
          monthly: monthlyAttendance,
          childrenStats: childrenAttendance
        },
        payments: {
          pending: pendingPayments
        },
        notifications: {
          unread: unreadNotifications
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// أبناء ولي الأمر
router.get('/children', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const guardian = await Guardian.findOne({ userId: req.user?.id });
    if (!guardian) {
      throw new Error('ملف ولي الأمر غير موجود');
    }

    const children = await Student.find({ _id: { $in: guardian.children } })
      .populate('userId', 'name phone')
      .populate('enrolledClasses', 'name subject teacherId');

    res.status(200).json({
      success: true,
      data: { children }
    });

  } catch (error) {
    next(error);
  }
});

// متابعة طفل محدد
router.get('/children/:studentId', [
  param('studentId').isMongoId().withMessage('معرف الطالب غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معرف الطالب غير صالح', errors.array());
    }

    const guardian = await Guardian.findOne({ userId: req.user?.id });
    if (!guardian) {
      throw new Error('ملف ولي الأمر غير موجود');
    }

    const { studentId } = req.params;

    // التحقق من أن الطالب من أبناء ولي الأمر
    if (!guardian.children.some(child => child._id.toString() === studentId)) {
      throw new Error('غير مصرح لك بعرض بيانات هذا الطالب');
    }

    const student = await Student.findById(studentId)
      .populate('userId', 'name phone')
      .populate('enrolledClasses', 'name subject teacherId schedule');

    if (!student) {
      throw new Error('الطالب غير موجود');
    }

    // حضور الطالب اليومي والشهري
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayAttendance, monthlyAttendance] = await Promise.all([
      Attendance.find({
        studentId,
        date: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
      }).populate('classId', 'name subject'),
      Attendance.find({
        studentId,
        date: { $gte: startOfMonth }
      }).populate('classId', 'name subject')
    ]);

    // فصول الطالب اليومية
    const todayClasses = await Class.find({
      _id: { $in: student.enrolledClasses },
      'schedule.day': ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'][today.getDay()]
    }).populate('teacherId', 'userId');

    res.status(200).json({
      success: true,
      data: {
        student,
        attendance: {
          today: todayAttendance,
          monthly: monthlyAttendance,
          rate: monthlyAttendance.length > 0 ?
            Math.round((monthlyAttendance.filter(a => a.status === 'present').length / monthlyAttendance.length) * 100) : 0
        },
        todaySchedule: todayClasses
      }
    });

  } catch (error) {
    next(error);
  }
});

// سجل حضور طفل محدد
router.get('/children/:studentId/attendance', [
  param('studentId').isMongoId().withMessage('معرف الطالب غير صالح'),
  query('startDate').optional().isISO8601().withMessage('تاريخ البداية غير صالح'),
  query('endDate').optional().isISO8601().withMessage('تاريخ النهاية غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معلمات البحث غير صالحة', errors.array());
    }

    const guardian = await Guardian.findOne({ userId: req.user?.id });
    if (!guardian) {
      throw new Error('ملف ولي الأمر غير موجود');
    }

    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // التحقق من صلاحية الوصول
    if (!guardian.children.some(child => child._id.toString() === studentId)) {
      throw new Error('غير مصرح لك بعرض بيانات هذا الطالب');
    }

    const filter: any = { studentId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const attendance = await Attendance.find(filter)
      .populate('classId', 'name subject')
      .populate('teacherId', 'userId')
      .sort({ date: -1 });

    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length,
      rate: attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0
    };

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

// فواتير أبناء ولي الأمر
router.get('/payments', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const guardian = await Guardian.findOne({ userId: req.user?.id });
    if (!guardian) {
      throw new Error('ملف ولي الأمر غير موجود');
    }

    const childrenIds = guardian.children.map(child => child._id);

    const payments = await Payment.find({ studentId: { $in: childrenIds } })
      .populate('studentId', 'userId')
      .populate('classIds', 'name subject')
      .sort({ dueDate: 1 });

    const summary = {
      totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      totalOverdue: payments.filter(p => p.status === 'pending' && p.dueDate < new Date()).reduce((sum, p) => sum + p.amount, 0),
      totalPaid: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      count: payments.length
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

// دفع فاتورة لطفل
router.post('/payments/:paymentId/pay', [
  param('paymentId').isMongoId().withMessage('معرف الفاتورة غير صالح'),
  body('method').isIn(['cash', 'card', 'bank_transfer']).withMessage('طريقة الدفع غير صالحة')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const guardian = await Guardian.findOne({ userId: req.user?.id });
    if (!guardian) {
      throw new Error('ملف ولي الأمر غير موجود');
    }

    const { paymentId } = req.params;
    const { method } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('الفاتورة غير موجودة');
    }

    // التحقق من أن الفاتورة لأحد أبناء ولي الأمر
    if (!guardian.children.some(child => child._id.equals(payment.studentId))) {
      throw new Error('غير مصرح لك بدفع هذه الفاتورة');
    }

    if (payment.status !== 'pending') {
      throw new Error('هذه الفاتورة تم دفعها بالفعل أو تم إلغاؤها');
    }

    // معالجة الدفع
    payment.status = 'completed';
    payment.method = method;
    payment.paidDate = new Date();
    payment.processedBy = req.user?.id;

    await payment.save();

    // تحديث رصيد الطالب
    const student = await Student.findById(payment.studentId);
    if (student) {
      student.balance = Math.max(0, student.balance - payment.amount);
      await student.save();
    }

    // إرسال إشعار تأكيد الدفع
    await Notification.create({
      title: 'تأكيد الدفع',
      message: `تم تأكيد دفع فاتورة ${payment.invoiceNumber} لطفلك`,
      type: 'payment',
      priority: 'medium',
      recipientType: 'guardian',
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

// الإشعارات الخاصة بولي الأمر
router.get('/notifications', [
  query('status').optional().isIn(['sent', 'delivered', 'read']),
  query('type').optional().isIn(['attendance', 'payment', 'announcement']),
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
  body('occupation').optional().isLength({ max: 100 }).withMessage('المهنة طويلة جداً'),
  body('workPhone').optional().matches(/^(\+20|0)?1[0-2,5]\d{8}$/).withMessage('رقم الهاتف غير صالح'),
  body('preferredContactMethod').optional().isIn(['phone', 'email', 'sms', 'app']),
  body('notificationSettings').optional().isObject(),
  body('address').optional().isObject(),
  body('address.street').if(body('address').exists()).notEmpty().withMessage('اسم الشارع مطلوب'),
  body('address.city').if(body('address').exists()).notEmpty().withMessage('اسم المدينة مطلوب'),
  body('address.governorate').if(body('address').exists()).notEmpty().withMessage('اسم المحافظة مطلوب')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const guardian = await Guardian.findOne({ userId: req.user?.id });
    if (!guardian) {
      throw new Error('ملف ولي الأمر غير موجود');
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        (guardian as any)[key] = updates[key];
      }
    });

    await guardian.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: { guardian }
    });

  } catch (error) {
    next(error);
  }
});

// تقرير شامل عن جميع الأبناء
router.get('/reports/children-performance', [
  query('academicYear').optional().matches(/^\d{4}\/\d{4}$/),
  query('semester').optional().isIn(['الأول', 'الثاني'])
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const guardian = await Guardian.findOne({ userId: req.user?.id });
    if (!guardian) {
      throw new Error('ملف ولي الأمر غير موجود');
    }

    const { academicYear, semester } = req.query;
    const childrenIds = guardian.children.map(child => child._id);

    const filter: any = { studentId: { $in: childrenIds } };

    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'userId')
      .populate('classId', 'name subject');

    // تجميع البيانات حسب الطالب
    const childrenPerformance = attendance.reduce((acc: any, record: any) => {
      const studentId = record.studentId._id.toString();
      if (!acc[studentId]) {
        acc[studentId] = {
          student: record.studentId,
          attendance: [],
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }

      acc[studentId].attendance.push(record);
      acc[studentId].total++;
      acc[studentId][record.status]++;

      return acc;
    }, {});

    const performanceData = Object.values(childrenPerformance).map((child: any) => ({
      ...child,
      attendanceRate: Math.round((child.present / child.total) * 100)
    }));

    res.status(200).json({
      success: true,
      data: {
        childrenPerformance: performanceData,
        summary: {
          totalChildren: guardian.children.length,
          totalSessions: attendance.length
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;