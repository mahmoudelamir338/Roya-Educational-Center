import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, SystemLog } from '../models';
import { AppError, createUnauthorizedError } from './errorHandler';

interface JwtPayload {
  id: string;
  role: string;
  phone: string;
  iat?: number;
  exp?: number;
}

// توسيع واجهة Request لإضافة خاصية user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        phone: string;
        role: 'admin' | 'teacher' | 'student' | 'guardian';
        isActive: boolean;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    phone: string;
    role: 'admin' | 'teacher' | 'student' | 'guardian';
    isActive: boolean;
  };
}

// مصادقة JWT الأساسية
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw createUnauthorizedError('رمز المصادقة مطلوب');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw createUnauthorizedError('المستخدم غير موجود');
    }

    if (!user.isActive) {
      throw createUnauthorizedError('الحساب غير مفعل');
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      role: user.role as 'admin' | 'teacher' | 'student' | 'guardian',
      isActive: user.isActive
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createUnauthorizedError('رمز المصادقة غير صالح'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createUnauthorizedError('انتهت صلاحية رمز المصادقة'));
    } else {
      next(error);
    }
  }
};

// التحقق من صلاحيات المدير العام
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw createUnauthorizedError('يجب تسجيل الدخول أولاً');
  }

  if (req.user.role !== 'admin') {
    throw new AppError('غير مصرح لك بالوصول - صلاحيات مدير عام مطلوبة', 403, 'FORBIDDEN');
  }

  next();
};

// التحقق من صلاحيات المدرس
export const requireTeacher = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw createUnauthorizedError('يجب تسجيل الدخول أولاً');
  }

  if (req.user.role !== 'teacher') {
    throw new AppError('غير مصرح لك بالوصول - صلاحيات مدرس مطلوبة', 403, 'FORBIDDEN');
  }

  next();
};

// التحقق من صلاحيات الطالب
export const requireStudent = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw createUnauthorizedError('يجب تسجيل الدخول أولاً');
  }

  if (req.user.role !== 'student') {
    throw new AppError('غير مصرح لك بالوصول - صلاحيات طالب مطلوبة', 403, 'FORBIDDEN');
  }

  next();
};

// التحقق من صلاحيات ولي الأمر
export const requireGuardian = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw createUnauthorizedError('يجب تسجيل الدخول أولاً');
  }

  if (req.user.role !== 'guardian') {
    throw new AppError('غير مصرح لك بالوصول - صلاحيات ولي أمر مطلوبة', 403, 'FORBIDDEN');
  }

  next();
};

// التحقق من صلاحيات متعددة
export const requireRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('يجب تسجيل الدخول أولاً');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(`غير مصرح لك بالوصول - إحدى الصلاحيات التالية مطلوبة: ${roles.join(', ')}`, 403, 'FORBIDDEN');
    }

    next();
  };
};

// التحقق من امتلاك المورد (نفسه أو أبناؤه لولي الأمر)
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw createUnauthorizedError('يجب تسجيل الدخول أولاً');
    }

    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField] || req.query[resourceUserIdField];

    if (!resourceUserId) {
      throw new AppError('معرف المستخدم للمورد غير محدد', 400, 'VALIDATION_ERROR');
    }

    // المدير العام يمكنه الوصول لكل شيء
    if (req.user.role === 'admin') {
      return next();
    }

    // المدرس يمكنه الوصول لموارده الخاصة
    if (req.user.role === 'teacher') {
      if (resourceUserId !== req.user.id) {
        throw new AppError('غير مصرح لك بالوصول لهذا المورد', 403, 'FORBIDDEN');
      }
      return next();
    }

    // الطالب يمكنه الوصول لموارده الخاصة فقط
    if (req.user.role === 'student') {
      if (resourceUserId !== req.user.id) {
        throw new AppError('غير مصرح لك بالوصول لهذا المورد', 403, 'FORBIDDEN');
      }
      return next();
    }

    // ولي الأمر يمكنه الوصول لموارده وموارد أبنائه
    if (req.user.role === 'guardian') {
      // يمكنه الوصول لموارده الخاصة
      if (resourceUserId === req.user.id) {
        return next();
      }

      // التحقق من أن المورد يعود لأحد أبنائه
      // هذا سيتم تنفيذه في الكونترولر بعد جلب بيانات ولي الأمر
      req.body.guardianCheckRequired = true;
      req.body.guardianId = req.user.id;
      return next();
    }

    throw new AppError('دور مستخدم غير مدعوم', 400, 'VALIDATION_ERROR');
  };
};

// دالة لاستخراج الرمز من الطلب
function extractToken(req: Request): string | null {
  // البحث في رأس Authorization
  const authHeader = req.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // البحث في معاملات الطلب
  if (req.query.token) {
    return req.query.token as string;
  }

  // البحث في الجسم للطلبات غير GET
  if (req.body && req.body.token) {
    return req.body.token;
  }

  return null;
}

// دالة لتسجيل عمليات المصادقة
export const logAuthEvent = async (
  action: string,
  userId: string,
  role: string,
  status: 'success' | 'failure',
  details?: any
): Promise<void> => {
  try {
    await SystemLog.create({
      action,
      entityType: 'user',
      entityId: userId,
      actorId: userId,
      actorRole: role,
      description: `محاولة ${action} للحساب`,
      details,
      category: 'authentication',
      status,
      severity: status === 'failure' ? 'high' : 'low'
    });
  } catch (error) {
    console.error('فشل في تسجيل حدث المصادقة:', error);
  }
};

// دالة للتحقق من كلمة مرور المدير العام الخاصة
export const authenticateAdminPassword = async (
  password: string
): Promise<boolean> => {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new AppError('كلمة مرور المدير العام غير محددة في النظام', 500, 'INTERNAL_SERVER_ERROR');
  }

  // في الإنتاج، يجب تشفير كلمة المرور في متغيرات البيئة
  return password === adminPassword;
};