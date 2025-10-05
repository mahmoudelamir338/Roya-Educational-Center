import { Request, Response, NextFunction } from 'express';
import { SystemLog } from '../models';

interface CustomRequest extends Request {
  startTime?: number;
  user?: {
    id: string;
    role: string;
    name: string;
  };
}

export const requestLogger = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // حفظ وقت بداية الطلب
  req.startTime = Date.now();

  // تسجيل الطلب عند الانتهاء
  const originalSend = res.send;
  res.send = function(data) {
    // حساب مدة الطلب
    const duration = req.startTime ? Date.now() - req.startTime : 0;

    // تحديد مستوى الخطورة بناءً على حالة الاستجابة
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (res.statusCode >= 500) severity = 'critical';
    else if (res.statusCode >= 400) severity = 'high';
    else if (res.statusCode >= 300) severity = 'medium';

    // تحديد الفئة بناءً على المسار
    let category: 'authentication' | 'authorization' | 'data' | 'system' | 'security' | 'business' = 'data';
    if (req.path.includes('/auth')) category = 'authentication';
    else if (req.path.includes('/admin')) category = 'authorization';
    else if (req.path.includes('/payment')) category = 'business';
    else if (req.path.includes('/attendance')) category = 'business';

    // تسجيل الطلب في قاعدة البيانات (فقط للطلبات المهمة)
    if (shouldLogRequest(req, res.statusCode)) {
      SystemLog.create({
        action: `${req.method}_${req.path.replace(/[\/-]/g, '_').toUpperCase()}`,
        entityType: 'system',
        actorId: req.user?.id || null,
        actorRole: req.user?.role || 'guest',
        description: `${req.method} ${req.originalUrl} - ${res.statusCode}`,
        details: {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          body: sanitizeBody(req.body),
          query: req.query,
          params: req.params,
          user: req.user ? {
            id: req.user.id,
            role: req.user.role,
            name: req.user.name
          } : null
        },
        category,
        status: res.statusCode >= 400 ? 'failure' : 'success',
        severity,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        duration
      }).catch(err => {
        console.error('فشل في تسجيل الطلب:', err);
      });
    }

    // إضافة معلومات الطلب في رأس الاستجابة
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Request-ID', req.get('X-Request-ID') || generateRequestId());

    return originalSend.call(this, data);
  };

  next();
};

// دالة لتحديد ما إذا كان يجب تسجيل الطلب
function shouldLogRequest(req: Request, statusCode: number): boolean {
  // لا تسجل طلبات الصحة والملفات الثابتة
  if (req.path === '/api/health') return false;
  if (req.path.startsWith('/static')) return false;
  if (req.path.startsWith('/favicon')) return false;

  // سجل جميع الطلبات في بيئة التطوير
  if (process.env.NODE_ENV === 'development') return true;

  // في بيئة الإنتاج، سجل فقط الطلبات المهمة
  return statusCode >= 400 || req.path.includes('/admin') || req.method !== 'GET';
}

// دالة لتنظيف بيانات الطلب من المعلومات الحساسة
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***محتوى محمي***';
    }
  }

  return sanitized;
}

// دالة لإنشاء معرف فريد للطلب
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}