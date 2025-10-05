import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireRoles } from '../middleware/auth';
import { createValidationError } from '../middleware/errorHandler';
import { Attendance, Class, Student, Teacher } from '../models';

const router = express.Router();

// مسارات الحضور متاحة للمدرسين والمديرين فقط
router.use(requireRoles(['admin', 'teacher']));

// تسجيل حضور متعدد لفصل واحد
router.post('/', [
  body('classId').isMongoId().withMessage('معرف الفصل غير صالح'),
  body('attendanceData').isArray({ min: 1 }).withMessage('بيانات الحضور مطلوبة'),
  body('attendanceData.*.studentId').isMongoId().withMessage('معرف الطالب غير صالح'),
  body('attendanceData.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('حالة الحضور غير صالحة'),
  body('sessionNumber').optional().isInt({ min: 1 }).withMessage('رقم الحصة يجب أن يكون رقم صحيح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { classId, attendanceData, sessionNumber = 1 } = req.body;

    // التحقق من وجود الفصل
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new Error('الفصل غير موجود');
    }

    // التحقق من صلاحية المدرس (إذا كان المستخدم مدرس)
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher || !classData.teacherId.equals(teacher._id)) {
        throw new Error('غير مصرح لك بتسجيل حضور هذا الفصل');
      }
    }

    const attendanceRecords = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const record of attendanceData) {
      // التحقق من عدم وجود سجل حضر سابق لهذا الطالب في نفس اليوم والحصة
      const existingAttendance = await Attendance.findOne({
        classId,
        studentId: record.studentId,
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        sessionNumber
      });

      if (existingAttendance) {
        // تحديث السجل الموجود
        existingAttendance.status = record.status;
        existingAttendance.note = record.note;
        existingAttendance.modifiedBy = req.user?.id;
        await existingAttendance.save();
        attendanceRecords.push(existingAttendance);
      } else {
        // إنشاء سجل حضر جديد
        const newAttendance = await Attendance.create({
          classId,
          studentId: record.studentId,
          teacherId: classData.teacherId,
          date: new Date(),
          status: record.status,
          note: record.note,
          sessionNumber,
          academicYear: classData.academicYear,
          semester: classData.semester,
          createdBy: req.user?.id
        });
        attendanceRecords.push(newAttendance);
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

// عرض سجل الحضور لفصل محدد
router.get('/class/:classId', [
  param('classId').isMongoId().withMessage('معرف الفصل غير صالح'),
  query('startDate').optional().isISO8601().withMessage('تاريخ البداية غير صالح'),
  query('endDate').optional().isISO8601().withMessage('تاريخ النهاية غير صالح'),
  query('studentId').optional().isMongoId().withMessage('معرف الطالب غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معلمات البحث غير صالحة', errors.array());
    }

    const { classId } = req.params;
    const { startDate, endDate, studentId } = req.query;

    // التحقق من وجود الفصل
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new Error('الفصل غير موجود');
    }

    // التحقق من صلاحية الوصول
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher || !classData.teacherId.equals(teacher._id)) {
        throw new Error('غير مصرح لك بعرض حضور هذا الفصل');
      }
    }

    const filter: any = { classId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (studentId) filter.studentId = studentId;

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'userId')
      .populate('teacherId', 'userId')
      .sort({ date: -1, sessionNumber: -1 });

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

// تحديث سجل حضر محدد
router.patch('/:attendanceId', [
  param('attendanceId').isMongoId().withMessage('معرف سجل الحضور غير صالح'),
  body('status').optional().isIn(['present', 'absent', 'late', 'excused']).withMessage('حالة الحضور غير صالحة'),
  body('note').optional().isLength({ max: 500 }).withMessage('الملاحظة طويلة جداً')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { attendanceId } = req.params;
    const { status, note } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      throw new Error('سجل الحضور غير موجود');
    }

    // التحقق من صلاحية التعديل
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher || !attendance.teacherId.equals(teacher._id)) {
        throw new Error('غير مصرح لك بتعديل هذا السجل');
      }
    }

    // تحديث البيانات
    if (status) attendance.status = status;
    if (note !== undefined) attendance.note = note;
    attendance.modifiedBy = req.user?.id;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث سجل الحضور بنجاح',
      data: { attendance }
    });

  } catch (error) {
    next(error);
  }
});

// حذف سجل حضر
router.delete('/:attendanceId', [
  param('attendanceId').isMongoId().withMessage('معرف سجل الحضور غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معرف سجل الحضور غير صالح', errors.array());
    }

    const { attendanceId } = req.params;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      throw new Error('سجل الحضور غير موجود');
    }

    // التحقق من صلاحية الحذف (فقط المدير العام أو المدرس المعني)
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher || !attendance.teacherId.equals(teacher._id)) {
        throw new Error('غير مصرح لك بحذف هذا السجل');
      }
    }

    await Attendance.findByIdAndDelete(attendanceId);

    res.status(200).json({
      success: true,
      message: 'تم حذف سجل الحضور بنجاح'
    });

  } catch (error) {
    next(error);
  }
});

// تقرير الحضور اليومي لجميع الفصول
router.get('/daily-report', [
  query('date').optional().isISO8601().withMessage('التاريخ غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate('classId', 'name subject')
    .populate('studentId', 'userId')
    .populate('teacherId', 'userId')
    .sort({ 'classId.name': 1, 'studentId.userId.name': 1 });

    // تجميع البيانات حسب الفصل
    const classReport = attendance.reduce((acc: any, record: any) => {
      const classId = record.classId._id.toString();
      if (!acc[classId]) {
        acc[classId] = {
          class: record.classId,
          teacher: record.teacherId,
          attendance: []
        };
      }
      acc[classId].attendance.push(record);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        report: Object.values(classReport)
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;