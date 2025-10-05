// نماذج قاعدة البيانات الرئيسية لنظام مركز رؤية التعليمي
export { User, IUser } from './User';
export { Student, IStudent } from './Student';
export { Teacher, ITeacher } from './Teacher';
export { Guardian, IGuardian } from './Guardian';
export { Class, IClass } from './Class';
export { Attendance, IAttendance } from './Attendance';
export { Payment, IPayment } from './Payment';
export { Notification, INotification } from './Notification';
export { SystemLog, ISystemLog } from './SystemLog';

// إعادة تصدير جميع النماذج كنوع واحد للواجهات
import { IUser } from './User';
import { IStudent } from './Student';
import { ITeacher } from './Teacher';
import { IGuardian } from './Guardian';
import { IClass } from './Class';
import { IAttendance } from './Attendance';
import { IPayment } from './Payment';
import { INotification } from './Notification';
import { ISystemLog } from './SystemLog';

// أنواع عامة للنظام
export type UserRoles = 'admin' | 'teacher' | 'student' | 'guardian';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type ClassStatus = 'active' | 'inactive' | 'completed' | 'cancelled';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';

// واجهات مساعدة للاستعلامات والتقارير
export interface IAttendanceReport {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface IPaymentReport {
  studentId: string;
  studentName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  paymentCount: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface IClassReport {
  classId: string;
  className: string;
  teacherName: string;
  subject: string;
  totalStudents: number;
  activeStudents: number;
  attendanceRate: number;
  revenue: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ITeacherReport {
  teacherId: string;
  teacherName: string;
  subject: string[];
  totalClasses: number;
  totalStudents: number;
  totalSessions: number;
  attendanceRate: number;
  rating: number;
  revenue: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

// أدوات مساعدة للعمل مع النماذج
export class ModelUtils {
  // دالة للحصول على اسم النموذج باللغة العربية
  static getModelNameArabic(modelName: string): string {
    const names: Record<string, string> = {
      User: 'المستخدم',
      Student: 'الطالب',
      Teacher: 'المدرس',
      Guardian: 'ولي الأمر',
      Class: 'الفصل',
      Attendance: 'الحضور',
      Payment: 'الدفع',
      Notification: 'الإشعار',
      SystemLog: 'سجل النظام'
    };
    return names[modelName] || modelName;
  }

  // دالة للحصول على أيقونة النموذج
  static getModelIcon(modelName: string): string {
    const icons: Record<string, string> = {
      User: '👤',
      Student: '🎓',
      Teacher: '👨‍🏫',
      Guardian: '👨‍👩‍👧‍👦',
      Class: '🏫',
      Attendance: '📋',
      Payment: '💰',
      Notification: '🔔',
      SystemLog: '📝'
    };
    return icons[modelName] || '📄';
  }

  // دالة للتحقق من صحة معرف MongoDB
  static isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  // دالة لتنسيق التاريخ باللغة العربية
  static formatDateArabic(date: Date): string {
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // دالة لحساب النسبة المئوية
  static calculatePercentage(part: number, total: number): number {
    return total > 0 ? Math.round((part / total) * 100 * 100) / 100 : 0;
  }
}