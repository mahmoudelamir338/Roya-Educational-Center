import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'attendance' | 'payment' | 'announcement' | 'grade' | 'system' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipientType: 'student' | 'teacher' | 'guardian' | 'admin' | 'all';
  recipientId?: mongoose.Types.ObjectId;
  recipientRole?: string;
  senderId?: mongoose.Types.ObjectId;
  senderName?: string;
  data?: {
    studentId?: mongoose.Types.ObjectId;
    classId?: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId;
    attendanceId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  channels: {
    sms: boolean;
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  status: 'sent' | 'delivered' | 'read' | 'failed';
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  tags?: string[];
  expiresAt?: Date;
  metadata?: {
    smsSid?: string;
    emailId?: string;
    pushToken?: string;
    [key: string]: any;
  };
}

const notificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: [true, 'عنوان الإشعار مطلوب'],
    trim: true,
    maxlength: [200, 'العنوان لا يجب أن يزيد عن 200 حرف']
  },
  message: {
    type: String,
    required: [true, 'نص الإشعار مطلوب'],
    maxlength: [1000, 'النص لا يجب أن يزيد عن 1000 حرف']
  },
  type: {
    type: String,
    enum: {
      values: ['attendance', 'payment', 'announcement', 'grade', 'system', 'reminder'],
      message: 'نوع الإشعار غير صالح'
    },
    required: [true, 'نوع الإشعار مطلوب']
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'مستوى الأولوية غير صالح'
    },
    default: 'medium'
  },
  recipientType: {
    type: String,
    enum: {
      values: ['student', 'teacher', 'guardian', 'admin', 'all'],
      message: 'نوع المستلم غير صالح'
    },
    required: [true, 'نوع المستلم مطلوب']
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    refPath: 'recipientType'
  },
  recipientRole: {
    type: String,
    enum: ['student', 'teacher', 'guardian', 'admin']
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  senderName: {
    type: String,
    maxlength: [100, 'اسم المرسل لا يجب أن يزيد عن 100 حرف']
  },
  data: {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student'
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class'
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment'
    },
    attendanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Attendance'
    }
  },
  channels: {
    sms: {
      type: Boolean,
      default: false
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: {
      values: ['sent', 'delivered', 'read', 'failed'],
      message: 'حالة الإشعار غير صالحة'
    },
    default: 'sent'
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  failureReason: {
    type: String,
    maxlength: [500, 'سبب الفشل لا يجب أن يزيد عن 500 حرف']
  },
  retryCount: {
    type: Number,
    default: 0,
    min: [0, 'عدد المحاولات لا يمكن أن يكون سالب']
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: [0, 'الحد الأقصى للمحاولات لا يمكن أن يكون سالب']
  },
  tags: [{
    type: String,
    maxlength: [50, 'العلامة لا يجب أن تزيد عن 50 حرف']
  }],
  expiresAt: {
    type: Date,
    default: function() {
      // الإشعارات تنتهي صلاحيتها بعد 30 يوم
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  metadata: {
    smsSid: {
      type: String,
      maxlength: [100, 'معرف SMS لا يجب أن يزيد عن 100 حرف']
    },
    emailId: {
      type: String,
      maxlength: [100, 'معرف البريد الإلكتروني لا يجب أن يزيد عن 100 حرف']
    },
    pushToken: {
      type: String,
      maxlength: [200, 'رمز الإشعار لا يجب أن يزيد عن 200 حرف']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// مؤشرات للبحث السريع
notificationSchema.index({ recipientId: 1, status: 1 });
notificationSchema.index({ recipientType: 1, status: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// مؤشر نصي للبحث في العنوان والرسالة
notificationSchema.index({
  title: 'text',
  message: 'text'
});

// Virtual للتحقق من قراءة الإشعار
notificationSchema.virtual('isRead').get(function() {
  return this.status === 'read';
});

// Virtual للتحقق من تسليم الإشعار
notificationSchema.virtual('isDelivered').get(function() {
  return ['delivered', 'read'].includes(this.status);
});

// Virtual للتحقق من فشل الإشعار
notificationSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

// دالة لتحديث حالة الإشعار إلى مقروء
notificationSchema.methods.markAsRead = function(): void {
  this.status = 'read';
  this.readAt = new Date();
};

// دالة لتحديث حالة الإشعار إلى مسلم
notificationSchema.methods.markAsDelivered = function(): void {
  this.status = 'delivered';
  this.deliveredAt = new Date();
};

// دالة لتحديث حالة الإشعار إلى فاشل
notificationSchema.methods.markAsFailed = function(reason: string): void {
  this.status = 'failed';
  this.failureReason = reason;
  this.retryCount += 1;
};

// دالة للتحقق من إمكانية إعادة المحاولة
notificationSchema.methods.canRetry = function(): boolean {
  return this.retryCount < this.maxRetries && this.status === 'failed';
};

// دالة لإعادة إرسال الإشعار
notificationSchema.methods.retry = function(): void {
  if (this.canRetry()) {
    this.status = 'sent';
    this.sentAt = undefined;
    this.deliveredAt = undefined;
    this.readAt = undefined;
    this.failureReason = undefined;
    this.retryCount += 1;
  }
};

// دالة للحصول على بيانات المستلم
notificationSchema.methods.getRecipientInfo = function() {
  return {
    type: this.recipientType,
    id: this.recipientId,
    role: this.recipientRole
  };
};

// دالة للتحقق من انتهاء صلاحية الإشعار
notificationSchema.methods.isExpired = function(): boolean {
  return this.expiresAt ? this.expiresAt < new Date() : false;
};

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);