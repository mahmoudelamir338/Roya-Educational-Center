import { Request, Response, NextFunction } from 'express';
import { SystemLog } from '../models';

interface CustomError extends Error {
  statusCode?: number;
  errors?: any[];
  code?: string;
  keyValue?: Record<string, any>;
  keyPattern?: Record<string, any>;
}

export const errorHandler = async (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let error = { ...err };
  error.message = err.message;

  // تسجيل الخطأ في سجلات النظام
  try {
    await SystemLog.create({
      action: 'ERROR_OCCURRED',
      entityType: 'system',
      actorId: req.user?.id || null,
      actorRole: req.user?.role || 'system',
      description: `خطأ في ${req.method} ${req.originalUrl}`,
      details: {
        error: err.message,
        stack: err.stack,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      category: 'system',
      status: 'failure',
      severity: 'high',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  } catch (logError) {
    console.error('فشل في تسجيل الخطأ:', logError);
  }

  // خطأ في قاعدة البيانات - معرف مكرر
  if (err.code === 11000) {
    const message = 'حقل مكرر في قاعدة البيانات';
    error = { ...error, message, statusCode: 400 };
  }

  // خطأ في التحقق من البيانات
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message).join(', ');
    error = { ...error, message, statusCode: 400 };
  }

  // خطأ في كائن معرف غير صالح
  if (err.name === 'CastError') {
    const message = 'معرف غير صالح';
    error = { ...error, message, statusCode: 400 };
  }

  // خطأ في JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'رمز غير صالح';
    error = { ...error, message, statusCode: 401 };
  }

  // خطأ في انتهاء صلاحية JWT
  if (err.name === 'TokenExpiredError') {
    const message = 'انتهت صلاحية الرمز';
    error = { ...error, message, statusCode: 401 };
  }

  // خطأ في البيانات المرسلة
  if (err.code === 'INVALID_DATA') {
    error = { ...error, statusCode: 400 };
  }

  // خطأ في عدم وجود الصلاحية
  if (err.code === 'UNAUTHORIZED') {
    error = { ...error, statusCode: 403 };
  }

  // خطأ في عدم وجود المورد
  if (err.code === 'NOT_FOUND') {
    error = { ...error, statusCode: 404 };
  }

  // خطأ في الخادم الداخلي (افتراضي)
  const statusCode = error.statusCode || 500;
  const message = error.message || 'خطأ في الخادم الداخلي';

  // في بيئة التطوير، أرسل تفاصيل الخطأ
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      error: message,
      stack: err.stack,
      details: error.errors,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    // في بيئة الإنتاج، لا ترسل تفاصيل الخطأ للأمان
    res.status(statusCode).json({
      success: false,
      error: statusCode === 500 ? 'خطأ في الخادم الداخلي' : message,
      timestamp: new Date().toISOString()
    });
  }
};

// دالة لإنشاء أخطاء مخصصة
export class AppError extends Error {
  statusCode: number;
  code?: string;
  errors?: any[];

  constructor(message: string, statusCode: number = 500, code?: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// أخطاء شائعة مسبقة التعريف
export const createValidationError = (message: string, errors?: any[]) => {
  return new AppError(message, 400, 'VALIDATION_ERROR', errors);
};

export const createUnauthorizedError = (message: string = 'غير مصرح لك بالوصول') => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

export const createForbiddenError = (message: string = 'ليس لديك صلاحية للوصول لهذا المورد') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

export const createNotFoundError = (resource: string = 'المورد') => {
  return new AppError(`${resource} غير موجود`, 404, 'NOT_FOUND');
};

export const createConflictError = (message: string) => {
  return new AppError(message, 409, 'CONFLICT');
};

export const createTooManyRequestsError = (message: string = 'تم تجاوز حد الطلبات المسموح به') => {
  return new AppError(message, 429, 'TOO_MANY_REQUESTS');
};

export const createInternalServerError = (message: string = 'خطأ في الخادم الداخلي') => {
  return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
};