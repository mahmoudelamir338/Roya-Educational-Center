import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { User, SystemLog } from '../models';
import { authenticate, logAuthEvent, authenticateAdminPassword } from '../middleware/auth';
import { AppError, createValidationError } from '../middleware/errorHandler';
import { isValidEgyptianPhone, validatePasswordStrength } from '../middleware/security';

const router = express.Router();

// حدود المعدل لمحاولات تسجيل الدخول
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات لكل نافذة
  message: {
    error: 'تم تجاوز حد محاولات تسجيل الدخول، يرجى المحاولة بعد 15 دقيقة'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// حدود المعدل للتسجيل
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 تسجيلات لكل ساعة من نفس IP
  message: {
    error: 'تم تجاوز حد التسجيل، يرجى المحاولة بعد ساعة'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// مسار تسجيل دخول المدير العام
router.post('/admin/login', [
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // التحقق من الأخطاء
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { password } = req.body;

    // التحقق من كلمة مرور المدير العام
    const isValidPassword = await authenticateAdminPassword(password);

    if (!isValidPassword) {
      await logAuthEvent(
        'ADMIN_LOGIN',
        'admin',
        'admin',
        'failure',
        { ip: req.ip, userAgent: req.get('User-Agent') }
      );

      throw new AppError('كلمة المرور غير صحيحة', 401, 'INVALID_CREDENTIALS');
    }

    // إنشاء رمز JWT للمدير العام
    const token = jwt.sign(
      {
        id: 'admin',
        role: 'admin',
        phone: 'admin'
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // تسجيل نجاح تسجيل الدخول
    await logAuthEvent(
      'ADMIN_LOGIN',
      'admin',
      'admin',
      'success',
      { ip: req.ip, userAgent: req.get('User-Agent') }
    );

    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        token,
        user: {
          id: 'admin',
          name: 'مدير عام',
          role: 'admin',
          isActive: true
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// مسار تسجيل دخول المستخدمين العاديين
router.post('/login', authLimiter, [
  body('phone')
    .notEmpty()
    .withMessage('رقم الهاتف مطلوب')
    .custom(isValidEgyptianPhone)
    .withMessage('رقم الهاتف غير صالح'),
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // التحقق من الأخطاء
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { phone, password } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      await logAuthEvent(
        'USER_LOGIN',
        phone,
        'unknown',
        'failure',
        { reason: 'user_not_found', ip: req.ip }
      );

      throw new AppError('رقم الهاتف أو كلمة المرور غير صحيحة', 401, 'INVALID_CREDENTIALS');
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await logAuthEvent(
        'USER_LOGIN',
        user._id.toString(),
        user.role,
        'failure',
        { reason: 'invalid_password', ip: req.ip }
      );

      throw new AppError('رقم الهاتف أو كلمة المرور غير صحيحة', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      await logAuthEvent(
        'USER_LOGIN',
        user._id.toString(),
        user.role,
        'failure',
        { reason: 'account_inactive', ip: req.ip }
      );

      throw new AppError('الحساب غير مفعل، يرجى التواصل مع الإدارة', 401, 'ACCOUNT_INACTIVE');
    }

    // إنشاء رمز JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        phone: user.phone
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // تسجيل نجاح تسجيل الدخول
    await logAuthEvent(
      'USER_LOGIN',
      user._id.toString(),
      user.role,
      'success',
      { ip: req.ip, userAgent: req.get('User-Agent') }
    );

    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// مسار تسجيل حساب جديد
router.post('/register', registerLimiter, [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('phone')
    .notEmpty()
    .withMessage('رقم الهاتف مطلوب')
    .custom(isValidEgyptianPhone)
    .withMessage('رقم الهاتف غير صالح'),
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
    .isLength({ min: 8 })
    .withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  body('role')
    .isIn(['student', 'teacher', 'guardian'])
    .withMessage('الدور غير صالح'),
  body('nationalID')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('الرقم القومي مطلوب للطلاب')
    .matches(/^[0-9]{14}$/)
    .withMessage('الرقم القومي يجب أن يكون 14 رقم')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // التحقق من الأخطاء
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { name, phone, password, role, nationalID } = req.body;

    // التحقق من قوة كلمة المرور
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw createValidationError('كلمة مرور ضعيفة', [
        { msg: passwordValidation.feedback.join(', ') }
      ]);
    }

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new AppError('رقم الهاتف مستخدم بالفعل', 409, 'PHONE_EXISTS');
    }

    // إنشاء المستخدم الجديد
    const user = await User.create({
      name,
      phone,
      password,
      role,
      isActive: false // الحساب غير مفعل حتى يوافق المدير العام
    });

    // إذا كان الدور طالب، حفظ الرقم القومي في نموذج الطالب
    if (role === 'student' && nationalID) {
      // سيتم إنشاء نموذج الطالب في ملف منفصل
      req.body.studentData = {
        userId: user._id,
        nationalID
      };
    }

    // إرسال إشعار للمدير العام بطلب تسجيل جديد
    await SystemLog.create({
      action: 'NEW_USER_REGISTRATION',
      entityType: 'user',
      entityId: user._id,
      actorId: user._id,
      actorRole: role,
      description: `طلب تسجيل حساب جديد لـ ${name}`,
      details: {
        phone,
        role,
        nationalID: role === 'student' ? nationalID : undefined,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      category: 'business',
      status: 'success',
      severity: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'تم إرسال طلب التسجيل بنجاح، سيتم مراجعته من قبل الإدارة',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// مسار التحقق من صحة الرمز
router.get('/verify', authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      message: 'الرمز صالح',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
});

// مسار تسجيل الخروج
router.post('/logout', authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // تسجيل تسجيل الخروج
    await logAuthEvent(
      'USER_LOGOUT',
      req.user!.id,
      req.user!.role,
      'success',
      { ip: req.ip, userAgent: req.get('User-Agent') }
    );

    res.status(200).json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error) {
    next(error);
  }
});

// مسار تغيير كلمة المرور
router.post('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('كلمة المرور الحالية مطلوبة'),
  body('newPassword')
    .notEmpty()
    .withMessage('كلمة المرور الجديدة مطلوبة')
    .isLength({ min: 8 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // التحقق من الأخطاء
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { currentPassword, newPassword } = req.body;

    // التحقق من قوة كلمة المرور الجديدة
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw createValidationError('كلمة مرور ضعيفة', [
        { msg: passwordValidation.feedback.join(', ') }
      ]);
    }

    // جلب المستخدم مع كلمة المرور
    const user = await User.findById(req.user!.id).select('+password');
    if (!user) {
      throw new AppError('المستخدم غير موجود', 404, 'USER_NOT_FOUND');
    }

    // التحقق من كلمة المرور الحالية
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('كلمة المرور الحالية غير صحيحة', 401, 'INVALID_CURRENT_PASSWORD');
    }

    // تحديث كلمة المرور
    user.password = newPassword;
    await user.save();

    // تسجيل تغيير كلمة المرور
    await logAuthEvent(
      'PASSWORD_CHANGED',
      user._id.toString(),
      user.role,
      'success',
      { ip: req.ip, userAgent: req.get('User-Agent') }
    );

    res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    next(error);
  }
});

// مسار استرجاع كلمة المرور (سيتم تطويره لاحقاً مع نظام SMS)
router.post('/forgot-password', [
  body('phone')
    .notEmpty()
    .withMessage('رقم الهاتف مطلوب')
    .custom(isValidEgyptianPhone)
    .withMessage('رقم الهاتف غير صالح')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // التحقق من الأخطاء
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError('بيانات غير صالحة', errors.array());
    }

    const { phone } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ phone });
    if (!user) {
      // لا نرسل رسالة خطأ حقيقية لأسباب أمنية
      res.status(200).json({
        success: true,
        message: 'إذا كان رقم الهاتف موجود في النظام، ستتلقى رسالة نصية برمز التحقق'
      });
      return;
    }

    // هنا سيتم إرسال رمز التحقق عبر SMS
    // سيتم تطوير هذا الجزء لاحقاً

    res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق إلى رقم هاتفك'
    });

  } catch (error) {
    next(error);
  }
});

export default router;