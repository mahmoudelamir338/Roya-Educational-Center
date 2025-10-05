import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireRoles } from '../middleware/auth';
import { createValidationError } from '../middleware/errorHandler';
import { Notification, User, Student, Teacher, Guardian } from '../models';

const router = express.Router();

// مسارات الإشعارات متاحة لجميع المستخدمين حسب صلاحياتهم
router.use(requireRoles(['admin', 'teacher', 'student', 'guardian']));

// إرسال إشعار جديد (للمديرين والمدرسين فقط)
router.post('/', requireRoles(['admin', 'teacher']), [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('عنوان الإشعار مطلوب ويجب أن يكون أقل من 200 حرف'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('نص الإشعار مطلوب ويجب أن يكون أقل من 1000 حرف'),
  body('type').isIn(['info', 'warning', 'success', 'error', 'announcement', 'reminder', 'payment', 'attendance']).withMessage('نوع الإشعار غير صالح'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('أولوية الإشعار غير صالحة'),
  body('target').isIn(['all', 'students', 'teachers', 'guardians', 'specific', 'class']).withMessage('هدف الإشعار غير صالح'),
  body('targetIds').optional().isArray().withMessage('معرفات الهدف يجب أن تكون مصفوفة'),
  body('targetIds.*').optional().isMongoId().withMessage('معرف الهدف غير صالح'),
  body('classId').optional().isMongoId().withMessage('معرف الفصل غير صالح'),
  body('scheduledAt').optional().isISO8601().withMessage('تاريخ الجدولة غير صالح'),
  body('expiresAt').optional().isISO8601().withMessage('تاريخ انتهاء الصلاحية غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات الإشعار غير صالحة', errors.array());
    }

    const {
      title,
      message,
      type,
      priority = 'medium',
      target,
      targetIds = [],
      classId,
      scheduledAt,
      expiresAt
    } = req.body;

    // التحقق من صحة الهدف والمعرفات
    if (target === 'specific' && targetIds.length === 0) {
      throw createValidationError('يجب تحديد معرفات المستلمين عند اختيار هدف محدد');
    }

    if (target === 'class' && !classId) {
      throw createValidationError('يجب تحديد معرف الفصل عند اختيار هدف الفصل');
    }

    // بناء قائمة المستلمين حسب الهدف
    let recipients: string[] = [];

    if (target === 'all') {
      const users = await User.find({ role: { $in: ['student', 'teacher', 'guardian'] } }, '_id');
      recipients = users.map(u => u._id.toString());
    } else if (target === 'students') {
      const students = await Student.find({}, 'userId');
      recipients = students.map(s => s.userId.toString());
    } else if (target === 'teachers') {
      const teachers = await Teacher.find({}, 'userId');
      recipients = teachers.map(t => t.userId.toString());
    } else if (target === 'guardians') {
      const guardians = await Guardian.find({}, 'userId');
      recipients = guardians.map(g => g.userId.toString());
    } else if (target === 'specific') {
      recipients = targetIds;
    } else if (target === 'class' && classId) {
      const classData = await require('../models/Class').findById(classId).populate('students');
      if (classData) {
        recipients = classData.students.map((s: any) => s.userId.toString());
      }
    }

    if (recipients.length === 0) {
      throw createValidationError('لم يتم العثور على مستلمين للإشعار');
    }

    // إنشاء الإشعارات لكل مستلم
    const notifications = recipients.map(recipientId => ({
      recipientId,
      senderId: req.user.id,
      title,
      message,
      type,
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: scheduledAt && new Date(scheduledAt) > new Date() ? 'scheduled' : 'sent'
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // إرسال إشعار فوري عبر Socket.IO إذا لم يكن مجدول
    if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
      const io = req.app.get('io');
      if (io) {
        recipients.forEach(recipientId => {
          io.to(`user_${recipientId}`).emit('new_notification', {
            id: createdNotifications.find(n => n.recipientId.toString() === recipientId)?._id,
            title,
            message,
            type,
            priority,
            createdAt: new Date()
          });
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'تم إرسال الإشعار بنجاح',
      data: {
        notificationCount: createdNotifications.length,
        recipients: recipients.length,
        scheduled: scheduledAt && new Date(scheduledAt) > new Date()
      }
    });

  } catch (error) {
    next(error);
  }
});

// الحصول على إشعارات المستخدم الحالي
router.get('/my', [
  query('status').optional().isIn(['sent', 'read', 'scheduled', 'expired']).withMessage('حالة الإشعار غير صالحة'),
  query('type').optional().isIn(['info', 'warning', 'success', 'error', 'announcement', 'reminder', 'payment', 'attendance']).withMessage('نوع الإشعار غير صالح'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('أولوية الإشعار غير صالحة'),
  query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة غير صالح'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('حد العرض غير صالح'),
  query('unreadOnly').optional().isBoolean().withMessage('قيمة قراءة الإشعارات فقط غير صالحة')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معلمات البحث غير صالحة', errors.array());
    }

    const { status, type, priority, page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { recipientId: req.user.id };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (unreadOnly === true) filter.readAt = { $exists: false };

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('senderId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(filter)
    ]);

    // حساب إحصائيات الإشعارات
    const stats = await Notification.aggregate([
      { $match: { recipientId: req.user.id } },
      {
        $group: {
          _id: {
            status: '$status',
            type: '$type',
            priority: '$priority',
            read: { $cond: ['$readAt', true, false] }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        statistics: stats,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
          limit: Number(limit)
        },
        unreadCount: await Notification.countDocuments({
          recipientId: req.user.id,
          readAt: { $exists: false }
        })
      }
    });

  } catch (error) {
    next(error);
  }
});

// تحديد إشعار كمقروء
router.patch('/:id/read', [
  param('id').isMongoId().withMessage('معرف الإشعار غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معرف الإشعار غير صالح', errors.array());
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: req.user.id
      },
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw createValidationError('الإشعار غير موجود أو ليس لديك صلاحية للوصول إليه');
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديد الإشعار كمقروء',
      data: notification
    });

  } catch (error) {
    next(error);
  }
});

// حذف إشعار
router.delete('/:id', [
  param('id').isMongoId().withMessage('معرف الإشعار غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معرف الإشعار غير صالح', errors.array());
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user.id
    });

    if (!notification) {
      throw createValidationError('الإشعار غير موجود أو ليس لديك صلاحية لحذفه');
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف الإشعار بنجاح'
    });

  } catch (error) {
    next(error);
  }
});

// الحصول على إحصائيات الإشعارات (للمديرين فقط)
router.get('/admin/stats', requireRoles(['admin']), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: {
            status: '$status',
            type: '$type',
            priority: '$priority',
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': -1 }
      }
    ]);

    const summary = await Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: ['$status', 1, 0] } },
          read: { $sum: { $cond: ['$readAt', 1, 0] } },
          scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
          expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyStats: stats,
        summary: summary[0] || {
          total: 0,
          sent: 0,
          read: 0,
          scheduled: 0,
          expired: 0
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// إرسال إشعار تذكير بالمدفوعات (للمديرين فقط)
router.post('/payment-reminders', requireRoles(['admin']), [
  body('daysUntilDue').isInt({ min: 1, max: 30 }).withMessage('عدد الأيام قبل الاستحقاق يجب أن يكون بين 1 و 30'),
  body('message').optional().trim().isLength({ min: 1, max: 500 }).withMessage('نص التذكير يجب أن يكون أقل من 500 حرف')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات التذكير غير صالحة', errors.array());
    }

    const { daysUntilDue, message = 'تذكير: يرجى دفع الرسوم المستحقة خلال الأيام القليلة القادمة' } = req.body;

    // العثور على المدفوعات المستحقة خلال الأيام المحددة
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysUntilDue);

    const pendingPayments = await require('../models/Payment').find({
      status: 'pending',
      dueDate: { $lte: dueDate }
    }).populate('studentId', 'userId');

    if (pendingPayments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'لا توجد مدفوعات مستحقة في الفترة المحددة',
        data: { remindersSent: 0 }
      });
    }

    // إنشاء إشعارات التذكير
    const notifications = pendingPayments.map(payment => ({
      recipientId: payment.studentId.userId,
      senderId: req.user.id,
      title: 'تذكير بالمدفوعات',
      message: `${message}\nالمبلغ المستحق: ${payment.amount} جنيه\nتاريخ الاستحقاق: ${payment.dueDate.toLocaleDateString('ar-EG')}`,
      type: 'payment',
      priority: 'high',
      status: 'sent'
    }));

    await Notification.insertMany(notifications);

    // إرسال الإشعارات عبر Socket.IO
    const io = req.app.get('io');
    if (io) {
      notifications.forEach(notification => {
        io.to(`user_${notification.recipientId}`).emit('new_notification', {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          createdAt: new Date()
        });
      });
    }

    res.status(201).json({
      success: true,
      message: `تم إرسال ${notifications.length} تذكير بالمدفوعات`,
      data: {
        remindersSent: notifications.length,
        daysUntilDue
      }
    });

  } catch (error) {
    next(error);
  }
});

// إرسال إشعار تذكير بالحضور (للمدرسين فقط)
router.post('/attendance-reminders', requireRoles(['teacher']), [
  body('classId').isMongoId().withMessage('معرف الفصل مطلوب'),
  body('date').isISO8601().withMessage('تاريخ الغياب مطلوب'),
  body('message').optional().trim().isLength({ min: 1, max: 500 }).withMessage('نص التذكير يجب أن يكون أقل من 500 حرف')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات التذكير غير صالحة', errors.array());
    }

    const { classId, date, message = 'تذكير: تم تسجيل غياب لطفلك في الفصل اليوم' } = req.body;

    // العثور على الطلاب الغائبين في التاريخ المحدد
    const absentStudents = await require('../models/Attendance').find({
      classId,
      date: new Date(date),
      status: 'absent'
    }).populate('studentId', 'userId');

    if (absentStudents.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'لا يوجد غياب مسجل في التاريخ المحدد',
        data: { remindersSent: 0 }
      });
    }

    // إنشاء إشعارات التذكير لأولياء الأمور
    const notifications = [];
    for (const attendance of absentStudents) {
      const student = await require('../models/Student').findById(attendance.studentId).populate('guardianId');
      if (student && student.guardianId) {
        notifications.push({
          recipientId: student.guardianId.userId,
          senderId: req.user.id,
          title: 'تذكير بالحضور',
          message: `${message}\nالطالب: ${student.userId.name}\nالتاريخ: ${new Date(date).toLocaleDateString('ar-EG')}`,
          type: 'attendance',
          priority: 'medium',
          status: 'sent'
        });
      }
    }

    if (notifications.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'لم يتم العثور على أولياء أمور لإرسال التذكيرات',
        data: { remindersSent: 0 }
      });
    }

    await Notification.insertMany(notifications);

    // إرسال الإشعارات عبر Socket.IO
    const io = req.app.get('io');
    if (io) {
      notifications.forEach(notification => {
        io.to(`user_${notification.recipientId}`).emit('new_notification', {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          createdAt: new Date()
        });
      });
    }

    res.status(201).json({
      success: true,
      message: `تم إرسال ${notifications.length} تذكير بالحضور`,
      data: {
        remindersSent: notifications.length,
        absentStudents: absentStudents.length
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;