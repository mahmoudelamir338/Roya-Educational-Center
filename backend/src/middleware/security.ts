import { Request, Response, NextFunction } from 'express';

export const securityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // منع الوصول إلى مسارات حساسة
  if (req.path.includes('..') || req.path.includes('~')) {
    res.status(400).json({
      success: false,
      error: 'مسار غير صالح'
    });
    return;
  }

  // إضافة رأس X-Request-ID لتتبع الطلبات
  if (!req.get('X-Request-ID')) {
    req.headers['x-request-id'] = generateRequestId();
  }

  // منع تخزين الاستجابات الحساسة في الكاش
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // إضافة رؤوس أمان إضافية
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // التحقق من حجم البيانات المرسلة
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    res.status(413).json({
      success: false,
      error: 'حجم البيانات المرسلة كبير جداً'
    });
    return;
  }

  // التحقق من نوع المحتوى للطلبات التي تحتوي على بيانات
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type') || '';

    if (!contentType.includes('application/json') &&
        !contentType.includes('multipart/form-data') &&
        !contentType.includes('application/x-www-form-urlencoded')) {
      // السماح لبعض المسارات الخاصة
      if (!req.path.includes('/webhook') && !req.path.includes('/upload')) {
        res.status(400).json({
          success: false,
          error: 'نوع المحتوى غير مدعوم'
        });
        return;
      }
    }
  }

  // التحقق من المتصفح والنظام
  const userAgent = req.get('User-Agent') || '';
  if (userAgent && isSuspiciousUserAgent(userAgent)) {
    console.warn('متصفح مشبوه:', userAgent, 'من IP:', req.ip);
  }

  next();
};

// دالة لإنشاء معرف فريد للطلب
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// دالة للتحقق من المتصفحات المشبوهة
function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /sqlmap/i,
    /nmap/i,
    /masscan/i,
    /nikto/i,
    /dirbuster/i,
    /gobuster/i,
    /wpscan/i,
    /joomlavs/i,
    /drupalgeddon/i,
    /shellshock/i,
    /heartbleed/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

// دالة للتحقق من عناوين IP المشبوهة
export function isSuspiciousIP(ip: string): boolean {
  // قائمة بعناوين IP المشبوهة المعروفة
  const suspiciousIPs = [
    '127.0.0.1', // localhost
    '0.0.0.0',
    '169.254.169.254', // AWS metadata
  ];

  // التحقق من عناوين IP خاصة
  const privateIPRanges = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // 127.0.0.0/8
    /^169\.254\./, // 169.254.0.0/16
    /^::1$/, // IPv6 localhost
    /^::$/, // IPv6 unspecified
    /^fe80:/, // IPv6 link-local
    /^fc00:/, // IPv6 private
  ];

  return suspiciousIPs.includes(ip) ||
         privateIPRanges.some(range => range.test(ip));
}

// دالة للتحقق من صحة البريد الإلكتروني
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// دالة للتحقق من صحة رقم الهاتف المصري
export function isValidEgyptianPhone(phone: string): boolean {
  // تنظيف رقم الهاتف من أي رموز إضافية
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // التحقق من صيغة رقم الهاتف المصري
  const egyptianPhoneRegex = /^(\+20|0020|0)?1[0-2,5]\d{8}$/;
  return egyptianPhoneRegex.test(cleanPhone);
}

// دالة للتحقق من صحة الرقم القومي المصري
export function isValidNationalID(nationalId: string): boolean {
  // الرقم القومي المصري يتكون من 14 رقم
  if (!/^[0-9]{14}$/.test(nationalId)) {
    return false;
  }

  // التحقق من صحة الرقم القومي باستخدام خوارزمية التحقق المصرية
  const digits = nationalId.split('').map(Number);

  // حساب رقم التحقق
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 2);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[13];
}

// دالة لتنظيف النصوص من الرموز الضارة
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // إزالة رموز HTML
    .replace(/javascript:/gi, '') // إزالة JavaScript
    .replace(/on\w+=/gi, '') // إزالة event handlers
    .trim()
    .substring(0, 1000); // تحديد الحد الأقصى للطول
}

// دالة للتحقق من قوة كلمة المرور
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل');
  } else {
    score += 1;
  }

  return {
    isValid: score >= 3,
    score,
    feedback
  };
}