import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireAdmin } from '../middleware/auth';
import { createValidationError } from '../middleware/errorHandler';
import { User, Student, Teacher, Guardian, Class, Attendance, Payment, Notification, SystemLog } from '../models';

const router = express.Router();

// تطبيق middleware المدير العام على جميع المسارات
router.use(requireAdmin);

// لوحة تحكم المدير العام
router.get('/dashboard', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // إحصائيات عامة
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalGuardians,
      totalClasses,
      pendingUsers,
      todayAttendance,
      monthlyPayments,
      pendingNotifications
    ] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Teacher.countDocuments(),
      Guardian.countDocuments(),
      Class.countDocuments(),
      User.countDocuments({ isActive: false }),
      Attendance.countDocuments({ date: { $gte: new Date(today.setHours(0, 0, 0, 0)) } }),
      Payment.countDocuments({ status: 'completed', paidDate: { $gte: startOfMonth } }),
      Notification.countDocuments({ status: { $in: ['sent', 'delivered'] } })
    ]);

    // إحصائيات الحضور اليومي
    const attendanceStats = await Attendance.aggregate([
      { $match: { date: { $gte: new Date(today.setHours(0, 0, 0, 0)) } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // إحصائيات المدفوعات الشهرية
    const paymentStats = await Payment.aggregate([
      { $match: { status: 'completed', paidDate: { $gte: startOfMonth } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalGuardians,
          totalClasses,
          pendingUsers,
          todayAttendance,
          monthlyPayments,
          pendingNotifications
        },
        attendance: {
          present: attendanceStats.find(s => s._id === 'present')?.count || 0,
          absent: attendanceStats.find(s => s._id === 'absent')?.count || 0,
          late: attendanceStats.find(s => s._id === 'late')?.count || 0,
          excused: attendanceStats.find(s => s._id === 'excused')?.count || 0
        },
        payments: paymentStats,
        recentActivity: await SystemLog.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('actorId', 'name')
      }
    });

  } catch (error) {
    next(error);
  }
});

// إدارة المستخدمين
router.get('/users', [
  query('role').optional().isIn(['student', 'teacher', 'guardian', 'admin']),
  query('isActive').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معلمات البحث غير صالحة', errors.array());
    }

    const { role, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (role) filter.role = role;
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-password'),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
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

// تفعيل/إلغاء تفعيل مستخدم
router.patch('/users/:userId/toggle-status', [
  param('userId').isMongoId().withMessage('معرف المستخدم غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معرف المستخدم غير صالح', errors.array());
    }

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    user.isActive = !user.isActive;
    await user.save();

    // إرسال إشعار للمستخدم
    await Notification.create({
      title: `حسابك ${user.isActive ? 'مفعل' : 'معطل'}`,
      message: `تم ${user.isActive ? 'تفعيل' : 'إلغاء تفعيل'} حسابك بواسطة المدير العام`,
      type: 'system',
      priority: 'high',
      recipientType: user.role === 'student' ? 'student' : user.role === 'teacher' ? 'teacher' : 'guardian',
      recipientId: user._id,
      senderId: req.user?.id,
      senderName: 'المدير العام'
    });

    res.status(200).json({
      success: true,
      message: `تم ${user.isActive ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`,
      data: { user }
    });

  } catch (error) {
    next(error);
  }
});

// إدارة الطلاب
router.get('/students', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { grade, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (grade) filter.grade = grade;
    if (status) filter.status = status;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('userId', 'name phone')
        .populate('guardianId', 'userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Student.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        students,
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

// إضافة طالب جديد
router.post('/students', [
  body('name').trim().notEmpty().withMessage('اسم الطالب مطلوب'),
  body('phone').notEmpty().withMessage('رقم الهاتف مطلوب'),
  body('nationalID').matches(/^[0-9]{14}$/).withMessage('الرقم القومي يجب أن يكون 14 رقم'),
  body('grade').notEmpty().withMessage('المرحلة الدراسية مطلوبة'),
  body('guardianPhone').optional().notEmpty().withMessage('رقم هاتف ولي الأمر مطلوب إذا تم تحديده')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { name, phone, nationalID, grade, guardianPhone } = req.body;

    // إنشاء مستخدم الطالب
    const user = await User.create({
      name,
      phone,
      password: nationalID, // كلمة مرور مؤقتة
      role: 'student',
      isActive: true
    });

    // إنشاء سجل الطالب
    const student = await Student.create({
      userId: user._id,
      nationalID,
      grade
    });

    // ربط الطالب بولي الأمر إذا تم تحديد رقم الهاتف
    if (guardianPhone) {
      const guardian = await Guardian.findOne({ 'userId.phone': guardianPhone });
      if (guardian) {
        guardian.children.push(student._id);
        await guardian.save();
        student.guardianId = guardian._id;
        await student.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'تم إضافة الطالب بنجاح',
      data: { student, user }
    });

  } catch (error) {
    next(error);
  }
});

// إدارة المدرسين
router.get('/teachers', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { subject, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (subject) filter.subject = subject;
    if (status) filter.status = status;

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .populate('userId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Teacher.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        teachers,
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

// إضافة مدرس جديد
router.post('/teachers', [
  body('name').trim().notEmpty().withMessage('اسم المدرس مطلوب'),
  body('phone').notEmpty().withMessage('رقم الهاتف مطلوب'),
  body('subject').isArray().withMessage('التخصص مطلوب كمصفوفة'),
  body('qualification').notEmpty().withMessage('المؤهل الدراسي مطلوب'),
  body('experience').isInt({ min: 0 }).withMessage('سنوات الخبرة يجب أن تكون رقم صحيح'),
  body('salary').isFloat({ min: 0 }).withMessage('الراتب يجب أن يكون رقم صحيح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { name, phone, subject, qualification, experience, salary } = req.body;

    // إنشاء مستخدم المدرس
    const user = await User.create({
      name,
      phone,
      password: 'temp123456', // كلمة مرور مؤقتة
      role: 'teacher',
      isActive: true
    });

    // إنشاء سجل المدرس
    const teacher = await Teacher.create({
      userId: user._id,
      subject,
      qualification,
      experience,
      salary
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة المدرس بنجاح',
      data: { teacher, user }
    });

  } catch (error) {
    next(error);
  }
});

// إدارة الفصول
router.get('/classes', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { subject, grade, teacherId, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (teacherId) filter.teacherId = teacherId;
    if (status) filter.status = status;

    const [classes, total] = await Promise.all([
      Class.find(filter)
        .populate('teacherId', 'userId')
        .populate('students', 'userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Class.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        classes,
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

// إنشاء فصل جديد
router.post('/classes', [
  body('name').trim().notEmpty().withMessage('اسم الفصل مطلوب'),
  body('subject').notEmpty().withMessage('المادة مطلوبة'),
  body('teacherId').isMongoId().withMessage('معرف المدرس غير صالح'),
  body('maxStudents').isInt({ min: 1, max: 50 }).withMessage('الحد الأقصى للطلاب يجب أن يكون بين 1 و 50'),
  body('price').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقم صحيح'),
  body('grade').notEmpty().withMessage('المرحلة الدراسية مطلوبة'),
  body('academicYear').matches(/^\d{4}\/\d{4}$/).withMessage('صيغة السنة الدراسية يجب أن تكون سنة/سنة'),
  body('semester').isIn(['الأول', 'الثاني']).withMessage('الفصل الدراسي يجب أن يكون الأول أو الثاني')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { name, subject, teacherId, maxStudents, price, grade, academicYear, semester, schedule } = req.body;

    // التحقق من وجود المدرس
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new Error('المدرس غير موجود');
    }

    // إنشاء الفصل
    const classData = await Class.create({
      name,
      subject,
      teacherId,
      maxStudents,
      price,
      grade,
      academicYear,
      semester,
      schedule: schedule || []
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الفصل بنجاح',
      data: { class: classData }
    });

  } catch (error) {
    next(error);
  }
});

// تقارير شاملة
router.get('/reports/attendance', [
  query('startDate').optional().isISO8601().withMessage('تاريخ البداية غير صالح'),
  query('endDate').optional().isISO8601().withMessage('تاريخ النهاية غير صالح'),
  query('classId').optional().isMongoId().withMessage('معرف الفصل غير صالح'),
  query('studentId').optional().isMongoId().withMessage('معرف الطالب غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معلمات البحث غير صالحة', errors.array());
    }

    const { startDate, endDate, classId, studentId } = req.query;
    const filter: any = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'userId')
      .populate('classId', 'name subject')
      .populate('teacherId', 'userId')
      .sort({ date: -1 });

    // حساب الإحصائيات
    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        attendance,
        statistics: {
          total: attendance.length,
          present: stats.find(s => s._id === 'present')?.count || 0,
          absent: stats.find(s => s._id === 'absent')?.count || 0,
          late: stats.find(s => s._id === 'late')?.count || 0,
          excused: stats.find(s => s._id === 'excused')?.count || 0
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// تقرير مالي
router.get('/reports/financial', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('type').optional().isIn(['tuition', 'registration', 'material', 'transport', 'other'])
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { startDate, endDate, type } = req.query;
    const filter: any = { status: 'completed' };

    if (startDate || endDate) {
      filter.paidDate = {};
      if (startDate) filter.paidDate.$gte = new Date(startDate as string);
      if (endDate) filter.paidDate.$lte = new Date(endDate as string);
    }

    if (type) filter.type = type;

    const payments = await Payment.find(filter)
      .populate('studentId', 'userId')
      .sort({ paidDate: -1 });

    // حساب الإحصائيات المالية
    const financialStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        payments,
        statistics: {
          totalRevenue,
          totalTransactions: payments.length,
          breakdown: financialStats
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// إرسال إشعار عام
router.post('/notifications/broadcast', [
  body('title').trim().notEmpty().withMessage('عنوان الإشعار مطلوب'),
  body('message').trim().notEmpty().withMessage('نص الإشعار مطلوب'),
  body('type').isIn(['attendance', 'payment', 'announcement', 'grade', 'system', 'reminder']).withMessage('نوع الإشعار غير صالح'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('مستوى الأولوية غير صالح'),
  body('recipientType').isIn(['student', 'teacher', 'guardian', 'admin', 'all']).withMessage('نوع المستلم غير صالح'),
  body('channels.sms').optional().isBoolean(),
  body('channels.email').optional().isBoolean(),
  body('channels.push').optional().isBoolean()
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { title, message, type, priority, recipientType, channels, scheduledFor } = req.body;

    // إنشاء الإشعار
    const notification = await Notification.create({
      title,
      message,
      type,
      priority,
      recipientType,
      senderId: req.user?.id,
      senderName: 'المدير العام',
      channels: {
        sms: channels?.sms || false,
        email: channels?.email || false,
        push: channels?.push !== false, // افتراضياً مفعل
        inApp: true
      },
      scheduledFor,
      status: scheduledFor ? 'sent' : 'sent'
    });

    res.status(201).json({
      success: true,
      message: 'تم إرسال الإشعار بنجاح',
      data: { notification }
    });

  } catch (error) {
    next(error);
  }
});

// سجل العمليات
router.get('/activity-logs', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('category').optional().isIn(['authentication', 'authorization', 'data', 'system', 'security', 'business']),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { startDate, endDate, category, severity, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    if (category) filter.category = category;
    if (severity) filter.severity = severity;

    const [logs, total] = await Promise.all([
      SystemLog.find(filter)
        .populate('actorId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SystemLog.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
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

export default router;