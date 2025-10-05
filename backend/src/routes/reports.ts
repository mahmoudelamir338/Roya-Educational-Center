import express from 'express';
import { query, validationResult } from 'express-validator';
import { requireRoles } from '../middleware/auth';
import { createValidationError } from '../middleware/errorHandler';
import { Attendance, Payment, Student, Teacher, Class, SystemLog } from '../models';

const router = express.Router();

// مسارات التقارير متاحة للمديرين والمدرسين
router.use(requireRoles(['admin', 'teacher']));

// تقرير الحضور الشامل
router.get('/attendance', [
  query('startDate').optional().isISO8601().withMessage('تاريخ البداية غير صالح'),
  query('endDate').optional().isISO8601().withMessage('تاريخ النهاية غير صالح'),
  query('classId').optional().isMongoId().withMessage('معرف الفصل غير صالح'),
  query('studentId').optional().isMongoId().withMessage('معرف الطالب غير صالح'),
  query('teacherId').optional().isMongoId().withMessage('معرف المدرس غير صالح'),
  query('groupBy').optional().isIn(['day', 'week', 'month', 'class', 'student']).withMessage('طريقة التجميع غير صالحة')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معلمات البحث غير صالحة', errors.array());
    }

    const { startDate, endDate, classId, studentId, teacherId, groupBy = 'day' } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;
    if (teacherId) filter.teacherId = teacherId;

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'userId')
      .populate('classId', 'name subject')
      .populate('teacherId', 'userId')
      .sort({ date: -1 });

    // تجميع البيانات حسب الطريقة المطلوبة
    let groupedData: any = {};

    if (groupBy === 'day') {
      groupedData = attendance.reduce((acc: any, record: any) => {
        const day = record.date.toISOString().split('T')[0];
        if (!acc[day]) {
          acc[day] = {
            date: day,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            records: []
          };
        }
        acc[day].total++;
        acc[day][record.status]++;
        acc[day].records.push(record);
        return acc;
      }, {});
    } else if (groupBy === 'class') {
      groupedData = attendance.reduce((acc: any, record: any) => {
        const classId = record.classId._id.toString();
        if (!acc[classId]) {
          acc[classId] = {
            class: record.classId,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            records: []
          };
        }
        acc[classId].total++;
        acc[classId][record.status]++;
        acc[classId].records.push(record);
        return acc;
      }, {});
    } else if (groupBy === 'student') {
      groupedData = attendance.reduce((acc: any, record: any) => {
        const studentId = record.studentId._id.toString();
        if (!acc[studentId]) {
          acc[studentId] = {
            student: record.studentId,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            records: []
          };
        }
        acc[studentId].total++;
        acc[studentId][record.status]++;
        acc[studentId].records.push(record);
        return acc;
      }, {});
    }

    // حساب الإحصائيات العامة
    const overallStats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length,
      attendanceRate: attendance.length > 0 ?
        Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        report: Object.values(groupedData),
        statistics: overallStats,
        filters: {
          startDate,
          endDate,
          classId,
          studentId,
          teacherId,
          groupBy
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// تقرير الأداء الأكاديمي
router.get('/performance', [
  query('academicYear').optional().matches(/^\d{4}\/\d{4}$/),
  query('semester').optional().isIn(['الأول', 'الثاني']),
  query('classId').optional().isMongoId(),
  query('studentId').optional().isMongoId()
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { academicYear, semester, classId, studentId } = req.query;

    const filter: any = {};

    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'userId')
      .populate('classId', 'name subject')
      .populate('teacherId', 'userId');

    // حساب معدل الحضور لكل طالب
    const studentPerformance = attendance.reduce((acc: any, record: any) => {
      const studentId = record.studentId._id.toString();
      if (!acc[studentId]) {
        acc[studentId] = {
          student: record.studentId,
          classes: {},
          totalSessions: 0,
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
          totalExcused: 0
        };
      }

      const classId = record.classId._id.toString();
      if (!acc[studentId].classes[classId]) {
        acc[studentId].classes[classId] = {
          class: record.classId,
          sessions: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }

      acc[studentId].classes[classId].sessions++;
      acc[studentId].classes[classId][record.status]++;
      acc[studentId].totalSessions++;
      acc[studentId][`total${record.status.charAt(0).toUpperCase() + record.status.slice(1)}`]++;

      return acc;
    }, {});

    // حساب المعدلات لكل طالب
    const performanceData = Object.values(studentPerformance).map((student: any) => ({
      ...student,
      overallAttendanceRate: Math.round((student.totalPresent / student.totalSessions) * 100),
      classPerformance: Object.values(student.classes).map((classData: any) => ({
        ...classData,
        attendanceRate: Math.round((classData.present / classData.sessions) * 100)
      }))
    }));

    res.status(200).json({
      success: true,
      data: {
        performance: performanceData,
        summary: {
          totalStudents: performanceData.length,
          averageAttendanceRate: performanceData.length > 0 ?
            Math.round(performanceData.reduce((sum: number, student: any) => sum + student.overallAttendanceRate, 0) / performanceData.length) : 0
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// تقرير مالي مفصل
router.get('/financial', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('type').optional().isIn(['tuition', 'registration', 'material', 'transport', 'other']),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled', 'refunded']),
  query('groupBy').optional().isIn(['day', 'week', 'month', 'type', 'status']).withMessage('طريقة التجميع غير صالحة')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { startDate, endDate, type, status, groupBy = 'month' } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    if (type) filter.type = type;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('studentId', 'userId')
      .populate('classIds', 'name subject')
      .sort({ createdAt: -1 });

    // تجميع البيانات حسب الطريقة المطلوبة
    let groupedData: any = {};

    if (groupBy === 'month') {
      groupedData = payments.reduce((acc: any, payment: any) => {
        const month = payment.createdAt.toISOString().substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = {
            period: month,
            total: 0,
            count: 0,
            completed: 0,
            pending: 0,
            payments: []
          };
        }
        acc[month].total += payment.amount;
        acc[month].count++;
        acc[month][payment.status]++;
        acc[month].payments.push(payment);
        return acc;
      }, {});
    } else if (groupBy === 'type') {
      groupedData = payments.reduce((acc: any, payment: any) => {
        const type = payment.type;
        if (!acc[type]) {
          acc[type] = {
            type,
            total: 0,
            count: 0,
            payments: []
          };
        }
        acc[type].total += payment.amount;
        acc[type].count++;
        acc[type].payments.push(payment);
        return acc;
      }, {});
    }

    // حساب الإحصائيات العامة
    const summary = {
      totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      totalRefunded: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.refund?.amount || 0), 0),
      totalTransactions: payments.length,
      averagePayment: payments.length > 0 ? Math.round(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        report: Object.values(groupedData),
        summary,
        filters: {
          startDate,
          endDate,
          type,
          status,
          groupBy
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// تقرير أداء المدرسين
router.get('/teachers-performance', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('teacherId').optional().isMongoId()
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { startDate, endDate, teacherId } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (teacherId) filter.teacherId = teacherId;

    const attendance = await Attendance.find(filter)
      .populate('teacherId', 'userId')
      .populate('classId', 'name subject')
      .populate('studentId', 'userId');

    // تجميع البيانات حسب المدرس
    const teacherPerformance = attendance.reduce((acc: any, record: any) => {
      const teacherId = record.teacherId._id.toString();
      if (!acc[teacherId]) {
        acc[teacherId] = {
          teacher: record.teacherId,
          classes: {},
          totalSessions: 0,
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
          totalExcused: 0
        };
      }

      const classId = record.classId._id.toString();
      if (!acc[teacherId].classes[classId]) {
        acc[teacherId].classes[classId] = {
          class: record.classId,
          sessions: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }

      acc[teacherId].classes[classId].sessions++;
      acc[teacherId].classes[classId][record.status]++;
      acc[teacherId].totalSessions++;
      acc[teacherId][`total${record.status.charAt(0).toUpperCase() + record.status.slice(1)}`]++;

      return acc;
    }, {});

    // حساب المعدلات لكل مدرس
    const performanceData = Object.values(teacherPerformance).map((teacher: any) => ({
      ...teacher,
      overallAttendanceRate: Math.round((teacher.totalPresent / teacher.totalSessions) * 100),
      classPerformance: Object.values(teacher.classes).map((classData: any) => ({
        ...classData,
        attendanceRate: Math.round((classData.present / classData.sessions) * 100)
      }))
    }));

    res.status(200).json({
      success: true,
      data: {
        performance: performanceData,
        summary: {
          totalTeachers: performanceData.length,
          averageAttendanceRate: performanceData.length > 0 ?
            Math.round(performanceData.reduce((sum: number, teacher: any) => sum + teacher.overallAttendanceRate, 0) / performanceData.length) : 0
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// تقرير الفصول والمواعيد
router.get('/classes-status', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const classes = await Class.find({})
      .populate('teacherId', 'userId')
      .populate('students', 'userId')
      .sort({ createdAt: -1 });

    const report = classes.map(classData => ({
      class: classData,
      status: {
        totalStudents: classData.students.length,
        capacity: classData.maxStudents,
        occupancyRate: Math.round((classData.students.length / classData.maxStudents) * 100),
        isFull: classData.students.length >= classData.maxStudents,
        weeklySessions: classData.schedule.length
      }
    }));

    const summary = {
      totalClasses: classes.length,
      activeClasses: classes.filter(c => c.status === 'active').length,
      totalCapacity: classes.reduce((sum, c) => sum + c.maxStudents, 0),
      totalEnrolled: classes.reduce((sum, c) => sum + c.students.length, 0),
      averageOccupancy: classes.length > 0 ?
        Math.round(classes.reduce((sum, c) => sum + (c.students.length / c.maxStudents), 0) / classes.length * 100) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        report,
        summary
      }
    });

  } catch (error) {
    next(error);
  }
});

// تقرير سجل العمليات
router.get('/activity-logs', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('category').optional().isIn(['authentication', 'authorization', 'data', 'system', 'security', 'business']),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('status').optional().isIn(['success', 'failure', 'warning']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { startDate, endDate, category, severity, status, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const [logs, total] = await Promise.all([
      SystemLog.find(filter)
        .populate('actorId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SystemLog.countDocuments(filter)
    ]);

    // حساب إحصائيات السجلات
    const logStats = await SystemLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            category: '$category',
            status: '$status',
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        statistics: logStats,
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