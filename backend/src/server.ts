import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// استيراد الإعدادات والأدوات
import { testConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/requestLogger';
import { securityMiddleware } from './middleware/security';

// استيراد المسارات
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import teacherRoutes from './routes/teacher';
import studentRoutes from './routes/student';
import guardianRoutes from './routes/guardian';
import attendanceRoutes from './routes/attendance';
import paymentRoutes from './routes/payment';
import notificationRoutes from './routes/notification';
import reportRoutes from './routes/reports';

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء تطبيق Express
const app = express();
const server = createServer(app);

// إعداد Socket.IO للإشعارات اللحظية
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// اختبار الاتصال بقاعدة البيانات
testConnection();

// إعدادات الأمان والحماية
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// إعداد CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('غير مسموح بـ CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// ضغط الاستجابات
app.use(compression());

// تحليل البيانات
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// سجلات الطلبات
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// سجلات الطلبات المخصصة
app.use(requestLogger);

// حدود المعدل لمنع الهجمات
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 دقيقة
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // حد لكل نافذة
  message: {
    error: 'تم تجاوز حد الطلبات المسموح به، يرجى المحاولة لاحقًا',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'تم تجاوز حد الطلبات المسموح به',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000 / 60)
    });
  }
});

app.use('/api/', limiter);

// إعدادات الأمان الإضافية
app.use(securityMiddleware);

// مسارات API الأساسية
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'مركز رؤية التعليمي يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// مسارات المصادقة (يجب أن تكون قبل المسار المحمي)
app.use('/api/auth', authRoutes);

// مسارات النظام المحمية
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/guardian', guardianRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// معالجة المسارات غير الموجودة
app.use(notFound);

// معالجة الأخطاء العامة
app.use(errorHandler);

// متغيرات الخادم
const PORT = parseInt(process.env.PORT || '5000');
const NODE_ENV = process.env.NODE_ENV || 'development';

// تشغيل الخادم
server.listen(PORT, () => {
  console.log(`
🚀 خادم مركز رؤية التعليمي يعمل على: http://localhost:${PORT}
📝 البيئة: ${NODE_ENV}
🔒 الأمان: مفعل
📱 Socket.IO: مفعل
⚡ الحالة: جاهز للاستخدام
  `);
});

// معالجة إيقاف الخادم بناءً على الإشارات
process.on('SIGTERM', () => {
  console.log('🔄 تم استلام إشارة SIGTERM، يتم إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادم بنجاح');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 تم استلام إشارة SIGINT، يتم إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادم بنجاح');
    process.exit(0);
  });
});

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  console.error('❌ خطأ غير متوقع:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ رفض غير معالج في:', promise, 'السبب:', reason);
  process.exit(1);
});

export default app;