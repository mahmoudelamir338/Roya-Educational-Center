import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireTeacher } from '../middleware/auth';
import { createValidationError } from '../middleware/errorHandler';
import { Teacher, Class, Attendance, Student, Notification, Payment } from '../models';

const router = express.Router();

// تطبيق middleware المدرس على جميع المسارات
router.use(requireTeacher);

// لوحة تحكم المدرس
router.get('/dashboard', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user?.id })
      .populate('userId', 'name phone');

    if (!teacher) {
      throw new Error('ملف المدرس غير موجود');
    }

    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(startOfWeek.getDate() + 6));

    // إحصائيات المدرس
    const [
      totalClasses,
      todayClasses,
      weeklySessions,
      totalStudents,
      pendingAttendance
    ] = await Promise.all([
      Class.countDocuments({ teacherId: teacher._id }),
      Class.countDocuments({
        teacherId: teacher._id,
        'schedule.day': ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'][new Date().getDay()]
      }),
      Attendance.countDocuments({
        teacherId: teacher._id,
        date: { $gte: startOfWeek, $lte: endOfWeek }
      }),
      Student.countDocuments({ enrolledClasses: { $in: await Class.find({ teacherId: teacher._id }).distinct('_id') } }),
      Attendance.countDocuments({
        teacherId: teacher._id,
        date: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
        status: { $in: ['pending', 'sent'] }
      })
    ]);

    // الفصول اليومية
    const todaySchedule = await Class.find({
      teacherId: teacher._id,
      'schedule.day': ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'][new Date().getDay()]
    }).populate('students', 'userId');

    res.status(200).json({
      success: true,
      data: {
        teacher: {
          id: teacher._id,
          name: teacher.userId?.name,
          subject: teacher.subject,
          totalClasses,
          totalStudents,
          rating: teacher.rating,
          salary: teacher.salary
        },
        today: {
          classes: todayClasses,
          schedule: todaySchedule,
          pendingAttendance
        },
        weekly: {
          sessions: weeklySessions
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// فصول المدرس
router.get('/classes', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user?.id });
    if (!teacher) {
      throw new Error('ملف المدرس غير موجود');
    }

    const classes = await Class.find({ teacherId: teacher._id })
      .populate('students', 'userId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { classes }
    });

  } catch (error) {
    next(error);
  }
});

// تسجيل الحضور
router.post('/attendance', [
  body('classId').isMongoId().withMessage('معرف الفصل غير صالح'),
  body('attendanceData').isArray().withMessage('بيانات الحضور مطلوبة كمصفوفة'),
  body('attendanceData.*.studentId').isMongoId().withMessage('معرف الطالب غير صالح'),
  body('attendanceData.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('حالة الحضور غير صالحة'),
  body('attendanceData.*.note').optional().isLength({ max: 500 }).withMessage('الملاحظة طويلة جداً')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { classId, attendanceData, sessionNumber } = req.body;

    // التحقق من وجود الفصل والمدرس
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new Error('الفصل غير موجود');
    }

    const teacher = await Teacher.findOne({ userId: req.user?.id });
    if (!teacher || !classData.teacherId.equals(teacher._id)) {
      throw new Error('غير مصرح لك بتسجيل حضور هذا الفصل');
    }

    // تسجيل الحضور لكل طالب
    const attendanceRecords = [];
    for (const record of attendanceData) {
      const attendance = await Attendance.create({
        classId,
        studentId: record.studentId,
        teacherId: teacher._id,
        date: new Date(),
        status: record.status,
        note: record.note,
        sessionNumber: sessionNumber || 1,
        academicYear: classData.academicYear,
        semester: classData.semester,
        createdBy: req.user?.id
      });

      attendanceRecords.push(attendance);

      // إرسال إشعار للطالب وولي الأمره
      if (record.status === 'absent' || record.status === 'late') {
        const student = await Student.findById(record.studentId).populate('userId');
        if (student) {
          await Notification.create({
            title: `إشعار حضور - ${classData.name}`,
            message: `الطالب ${student.userId?.name} مسجل كـ ${record.status === 'absent' ? 'غائب' : 'متأخر'} في حصة ${classData.subject}`,
            type: 'attendance',
            priority: record.status === 'absent' ? 'high' : 'medium',
            recipientType: 'student',
            recipientId: student.userId?._id,
            senderId: req.user?.id,
            senderName: teacher.userId?.name,
            data: {
              studentId: student._id,
              classId: classData._id,
              attendanceId: attendance._id
            }
          });

          // إشعار لولي الأمر
          if (student.guardianId) {
            await Notification.create({
              title: `إشعار حضور - ${student.userId?.name}`,
              message: `ابنك ${student.userId?.name} مسجل كـ ${record.status === 'absent' ? 'غائب' : 'متأخر'} في حصة ${classData.subject}`,
              type: 'attendance',
              priority: 'high',
              recipientType: 'guardian',
              recipientId: student.guardianId,
              senderId: req.user?.id,
              senderName: teacher.userId?.name,
              data: {
                studentId: student._id,
                classId: classData._id,
                attendanceId: attendance._id
              }
            });
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'تم تسجيل الحضور بنجاح',
      data: { attendance: attendanceRecords }
    });

  } catch (error) {
    next(error);
  }
});

// عرض سجل الحضور لفصل معين
router.get('/attendance/:classId', [
  param('classId').isMongoId().withMessage('معرف الفصل غير صالح'),
  query('startDate').optional().isISO8601().withMessage('تاريخ البداية غير صالح'),
  query('endDate').optional().isISO8601().withMessage('تاريخ النهاية غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معلمات البحث غير صالحة', errors.array());
    }

    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    // التحقق من صلاحية المدرس للفصل
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new Error('الفصل غير موجود');
    }

    const teacher = await Teacher.findOne({ userId: req.user?.id });
    if (!teacher || !classData.teacherId.equals(teacher._id)) {
      throw new Error('غير مصرح لك بعرض حضور هذا الفصل');
    }

    const filter: any = { classId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'userId')
      .sort({ date: -1, sessionNumber: -1 });

    // تجميع الحضور حسب الطالب
    const studentAttendance = attendance.reduce((acc: any, record: any) => {
      const studentId = record.studentId._id.toString();
      if (!acc[studentId]) {
        acc[studentId] = {
          student: record.studentId,
          records: []
        };
      }
      acc[studentId].records.push(record);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        attendance: Object.values(studentAttendance),
        summary: {
          total: attendance.length,
          present: attendance.filter((a: any) => a.status === 'present').length,
          absent: attendance.filter((a: any) => a.status === 'absent').length,
          late: attendance.filter((a: any) => a.status === 'late').length,
          excused: attendance.filter((a: any) => a.status === 'excused').length
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// إرسال إشعار للطلاب
router.post('/notifications', [
  body('title').trim().notEmpty().withMessage('عنوان الإشعار مطلوب'),
  body('message').trim().notEmpty().withMessage('نص الإشعار مطلوب'),
  body('classId').optional().isMongoId().withMessage('معرف الفصل غير صالح'),
  body('studentIds').optional().isArray().withMessage('معرفات الطلاب يجب أن تكون مصفوفة'),
  body('type').isIn(['announcement', 'reminder', 'grade']).withMessage('نوع الإشعار غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { title, message, classId, studentIds, type } = req.body;

    const teacher = await Teacher.findOne({ userId: req.user?.id });
    if (!teacher) {
      throw new Error('ملف المدرس غير موجود');
    }

    let recipients = [];

    if (classId) {
      // إرسال لجميع طلاب الفصل
      const classData = await Class.findById(classId);
      if (!classData || !classData.teacherId.equals(teacher._id)) {
        throw new Error('الفصل غير موجود أو غير مصرح لك بالوصول إليه');
      }
      recipients = classData.students;
    } else if (studentIds) {
      // إرسال لطلاب محددين
      recipients = studentIds;
    }

    // إنشاء الإشعارات
    const notifications = [];
    for (const studentId of recipients) {
      const notification = await Notification.create({
        title,
        message,
        type,
        priority: 'medium',
        recipientType: 'student',
        recipientId: studentId,
        senderId: req.user?.id,
        senderName: teacher.userId?.name,
        data: { classId }
      });
      notifications.push(notification);
    }

    res.status(201).json({
      success: true,
      message: 'تم إرسال الإشعار بنجاح',
      data: { notifications }
    });

  } catch (error) {
    next(error);
  }
});

// عرض الطلاب في فصول المدرس
router.get('/students', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user?.id });
    if (!teacher) {
      throw new Error('ملف المدرس غير موجود');
    }

    const classes = await Class.find({ teacherId: teacher._id });
    const classIds = classes.map(c => c._id);

    const students = await Student.find({
      enrolledClasses: { $in: classIds }
    })
    .populate('userId', 'name phone')
    .populate('guardianId', 'userId')
    .sort({ 'userId.name': 1 });

    res.status(200).json({
      success: true,
      data: { students }
    });

  } catch (error) {
    next(error);
  }
});

// تحديث ملف المدرس الشخصي
router.patch('/profile', [
  body('bio').optional().isLength({ max: 1000 }).withMessage('السيرة الذاتية طويلة جداً'),
  body('specializations').optional().isArray().withMessage('التخصصات يجب أن تكون مصفوفة'),
  body('languages').optional().isArray().withMessage('اللغات يجب أن تكون مصفوفة')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const teacher = await Teacher.findOne({ userId: req.user?.id });
    if (!teacher) {
      throw new Error('ملف المدرس غير موجود');
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        (teacher as any)[key] = updates[key];
      }
    });

    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: { teacher }
    });

  } catch (error) {
    next(error);
  }
});

// عرض التقارير الشخصية للمدرس
router.get('/reports/attendance', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('classId').optional().isMongoId()
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { startDate, endDate, classId } = req.query;

    const teacher = await Teacher.findOne({ userId: req.user?.id });
    if (!teacher) {
      throw new Error('ملف المدرس غير موجود');
    }

    const filter: any = { teacherId: teacher._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (classId) filter.classId = classId;

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'userId')
      .populate('classId', 'name subject')
      .sort({ date: -1 });

    // حساب الإحصائيات
    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { classId: '$classId', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        attendance,
        statistics: stats,
        summary: {
          totalSessions: attendance.length,
          classes: [...new Set(attendance.map(a => a.classId._id.toString()))].length
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;