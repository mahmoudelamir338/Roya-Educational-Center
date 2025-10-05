import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireRoles } from '../middleware/auth';
import { createValidationError } from '../middleware/errorHandler';
import { Payment, Student, Class } from '../models';

const router = express.Router();

// مسارات المدفوعات متاحة للمديرين والطلاب وأولياء الأمور
router.use(requireRoles(['admin', 'student', 'guardian']));

// إنشاء فاتورة جديدة (للمدير العام فقط)
router.post('/', [
  body('studentId').isMongoId().withMessage('معرف الطالب غير صالح'),
  body('amount').isFloat({ min: 0 }).withMessage('المبلغ يجب أن يكون رقم صحيح'),
  body('type').isIn(['tuition', 'registration', 'material', 'transport', 'other']).withMessage('نوع الدفع غير صالح'),
  body('dueDate').isISO8601().withMessage('تاريخ الاستحقاق غير صالح'),
  body('classIds').optional().isArray().withMessage('معرفات الفصول يجب أن تكون مصفوفة'),
  body('classIds.*').optional().isMongoId().withMessage('معرف الفصل غير صالح'),
  body('description').optional().isLength({ max: 500 }).withMessage('الوصف طويل جداً')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { studentId, amount, type, dueDate, classIds, description } = req.body;

    // التحقق من وجود الطالب
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('الطالب غير موجود');
    }

    // التحقق من وجود الفصول (إذا تم تحديدها)
    if (classIds && classIds.length > 0) {
      const classes = await Class.find({ _id: { $in: classIds } });
      if (classes.length !== classIds.length) {
        throw new Error('بعض الفصول المحددة غير موجودة');
      }
    }

    // إنشاء رقم فاتورة فريد
    const invoiceNumber = `INV-${Date.now()}`;

    const payment = await Payment.create({
      studentId,
      amount,
      type,
      dueDate: new Date(dueDate),
      classIds: classIds || [],
      description,
      invoiceNumber,
      createdBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الفاتورة بنجاح',
      data: { payment }
    });

  } catch (error) {
    next(error);
  }
});

// عرض فواتير طالب محدد
router.get('/student/:studentId', [
  param('studentId').isMongoId().withMessage('معرف الطالب غير صالح'),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled', 'refunded']),
  query('type').optional().isIn(['tuition', 'registration', 'material', 'transport', 'other'])
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معلمات البحث غير صالحة', errors.array());
    }

    const { studentId } = req.params;
    const { status, type } = req.query;

    // التحقق من صلاحية الوصول
    if (req.user?.role === 'student' && req.user.id !== studentId) {
      throw new Error('غير مصرح لك بعرض فواتير طالب آخر');
    }

    if (req.user?.role === 'guardian') {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('الطالب غير موجود');
      }
      // هنا يجب التحقق من أن الطالب من أبناء ولي الأمر
      // سيتم تطوير هذا الجزء لاحقاً
    }

    const filter: any = { studentId };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const payments = await Payment.find(filter)
      .populate('studentId', 'userId')
      .populate('classIds', 'name subject')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { payments }
    });

  } catch (error) {
    next(error);
  }
});

// دفع فاتورة
router.post('/:paymentId/pay', [
  param('paymentId').isMongoId().withMessage('معرف الفاتورة غير صالح'),
  body('method').isIn(['cash', 'card', 'bank_transfer', 'online']).withMessage('طريقة الدفع غير صالحة'),
  body('transactionId').optional().isLength({ max: 200 }).withMessage('رقم المعاملة طويل جداً')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { paymentId } = req.params;
    const { method, transactionId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('الفاتورة غير موجودة');
    }

    // التحقق من صلاحية الدفع
    if (req.user?.role === 'student' && payment.studentId.toString() !== req.user.id) {
      throw new Error('غير مصرح لك بدفع هذه الفاتورة');
    }

    if (req.user?.role === 'guardian') {
      const student = await Student.findById(payment.studentId);
      if (!student) {
        throw new Error('الطالب غير موجود');
      }
      // التحقق من أن الطالب من أبناء ولي الأمر
      // سيتم تطوير هذا الجزء لاحقاً
    }

    if (payment.status !== 'pending') {
      throw new Error('هذه الفاتورة تم دفعها بالفعل أو تم إلغاؤها');
    }

    // معالجة الدفع
    payment.status = 'completed';
    payment.method = method;
    payment.paidDate = new Date();
    payment.transactionId = transactionId;
    payment.processedBy = req.user?.id;

    await payment.save();

    // تحديث رصيد الطالب
    const student = await Student.findById(payment.studentId);
    if (student) {
      student.balance = Math.max(0, student.balance - payment.amount);
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'تم دفع الفاتورة بنجاح',
      data: { payment }
    });

  } catch (error) {
    next(error);
  }
});

// إلغاء فاتورة (للمدير العام فقط)
router.patch('/:paymentId/cancel', [
  param('paymentId').isMongoId().withMessage('معرف الفاتورة غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('معرف الفاتورة غير صالح', errors.array());
    }

    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('الفاتورة غير موجودة');
    }

    if (req.user?.role !== 'admin') {
      throw new Error('غير مصرح لك بإلغاء الفواتير');
    }

    if (payment.status === 'completed') {
      throw new Error('لا يمكن إلغاء فاتورة مدفوعة');
    }

    payment.status = 'cancelled';
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'تم إلغاء الفاتورة بنجاح',
      data: { payment }
    });

  } catch (error) {
    next(error);
  }
});

// استرداد مبلغ فاتورة (للمدير العام فقط)
router.post('/:paymentId/refund', [
  param('paymentId').isMongoId().withMessage('معرف الفاتورة غير صالح'),
  body('amount').isFloat({ min: 0 }).withMessage('مبلغ الاسترداد يجب أن يكون رقم صحيح'),
  body('reason').notEmpty().withMessage('سبب الاسترداد مطلوب')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('الفاتورة غير موجودة');
    }

    if (req.user?.role !== 'admin') {
      throw new Error('غير مصرح لك باسترداد المبالغ');
    }

    if (payment.status !== 'completed') {
      throw new Error('لا يمكن استرداد مبلغ فاتورة غير مدفوعة');
    }

    const refundAmount = Math.min(amount, payment.amount);

    payment.refund = {
      amount: refundAmount,
      reason,
      date: new Date(),
      processedBy: req.user.id
    };

    payment.status = 'refunded';
    await payment.save();

    // تحديث رصيد الطالب
    const student = await Student.findById(payment.studentId);
    if (student) {
      student.balance += refundAmount;
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'تم استرداد المبلغ بنجاح',
      data: { payment }
    });

  } catch (error) {
    next(error);
  }
});

// تقرير مالي شامل
router.get('/reports/financial', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('type').optional().isIn(['tuition', 'registration', 'material', 'transport', 'other']),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled', 'refunded'])
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { startDate, endDate, type, status } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      if (status === 'completed') {
        filter.paidDate = {};
        if (startDate) filter.paidDate.$gte = new Date(startDate as string);
        if (endDate) filter.paidDate.$lte = new Date(endDate as string);
      } else {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }
    }

    if (type) filter.type = type;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('studentId', 'userId')
      .populate('classIds', 'name subject')
      .sort({ createdAt: -1 });

    // حساب الإحصائيات المالية
    const financialStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            status: '$status',
            type: '$type'
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    const summary = {
      totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      totalRefunded: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.refund?.amount || 0), 0),
      totalTransactions: payments.length,
      breakdown: financialStats
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

// فواتير المستخدم الحالي
router.get('/my-payments', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let studentIds: string[] = [];

    if (req.user?.role === 'student') {
      studentIds = [req.user.id];
    } else if (req.user?.role === 'guardian') {
      // جلب أبناء ولي الأمر
      const guardian = await require('../models/Guardian').findOne({ userId: req.user.id });
      if (guardian) {
        studentIds = guardian.children.map(child => child._id.toString());
      }
    }

    if (studentIds.length === 0) {
      throw new Error('لا توجد فواتير مرتبطة بحسابك');
    }

    const payments = await Payment.find({ studentId: { $in: studentIds } })
      .populate('studentId', 'userId')
      .populate('classIds', 'name subject')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: { payments }
    });

  } catch (error) {
    next(error);
  }
});

export default router;