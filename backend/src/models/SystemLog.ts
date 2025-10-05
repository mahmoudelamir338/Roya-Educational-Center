import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemLog extends Document {
  action: string;
  entityType: 'user' | 'student' | 'teacher' | 'guardian' | 'class' | 'attendance' | 'payment' | 'notification' | 'system';
  entityId?: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorRole: 'admin' | 'teacher' | 'student' | 'guardian' | 'system';
  description: string;
  details?: {
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    metadata?: Record<string, any>;
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data' | 'system' | 'security' | 'business';
  status: 'success' | 'failure' | 'warning';
  errorCode?: string;
  errorMessage?: string;
  duration?: number; // مدة العملية بالميلي ثانية
  location?: string;
  tags?: string[];
  expiresAt?: Date;
}

const systemLogSchema = new Schema<ISystemLog>({
  action: {
    type: String,
    required: [true, 'نوع العملية مطلوب'],
    maxlength: [100, 'نوع العملية لا يجب أن يزيد عن 100 حرف']
  },
  entityType: {
    type: String,
    enum: {
      values: ['user', 'student', 'teacher', 'guardian', 'class', 'attendance', 'payment', 'notification', 'system'],
      message: 'نوع الكيان غير صالح'
    },
    required: [true, 'نوع الكيان مطلوب']
  },
  entityId: {
    type: Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  actorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف المستخدم مطلوب']
  },
  actorRole: {
    type: String,
    enum: {
      values: ['admin', 'teacher', 'student', 'guardian', 'system'],
      message: 'دور المستخدم غير صالح'
    },
    required: [true, 'دور المستخدم مطلوب']
  },
  description: {
    type: String,
    required: [true, 'وصف العملية مطلوب'],
    maxlength: [500, 'الوصف لا يجب أن يزيد عن 500 حرف']
  },
  details: {
    oldValues: {
      type: Schema.Types.Mixed
    },
    newValues: {
      type: Schema.Types.Mixed
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  ipAddress: {
    type: String,
    maxlength: [45, 'عنوان IP لا يجب أن يزيد عن 45 حرف']
  },
  userAgent: {
    type: String,
    maxlength: [500, 'معرف المتصفح لا يجب أن يزيد عن 500 حرف']
  },
  sessionId: {
    type: String,
    maxlength: [100, 'معرف الجلسة لا يجب أن يزيد عن 100 حرف']
  },
  severity: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'مستوى الخطورة غير صالح'
    },
    default: 'low'
  },
  category: {
    type: String,
    enum: {
      values: ['authentication', 'authorization', 'data', 'system', 'security', 'business'],
      message: 'الفئة غير صالحة'
    },
    required: [true, 'الفئة مطلوبة']
  },
  status: {
    type: String,
    enum: {
      values: ['success', 'failure', 'warning'],
      message: 'حالة العملية غير صالحة'
    },
    required: [true, 'حالة العملية مطلوبة']
  },
  errorCode: {
    type: String,
    maxlength: [50, 'كود الخطأ لا يجب أن يزيد عن 50 حرف']
  },
  errorMessage: {
    type: String,
    maxlength: [1000, 'رسالة الخطأ لا يجب أن تزيد عن 1000 حرف']
  },
  duration: {
    type: Number,
    min: [0, 'المدة لا يمكن أن تكون سالبة']
  },
  location: {
    type: String,
    maxlength: [200, 'الموقع لا يجب أن يزيد عن 200 حرف']
  },
  tags: [{
    type: String,
    maxlength: [50, 'العلامة لا يجب أن تزيد عن 50 حرف']
  }],
  expiresAt: {
    type: Date,
    default: function() {
      // السجلات تنتهي صلاحيتها بعد 90 يوم
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// مؤشرات للبحث السريع والفعال
systemLogSchema.index({ entityType: 1, entityId: 1 });
systemLogSchema.index({ actorId: 1, createdAt: -1 });
systemLogSchema.index({ actorRole: 1, createdAt: -1 });
systemLogSchema.index({ category: 1, severity: 1 });
systemLogSchema.index({ status: 1, createdAt: -1 });
systemLogSchema.index({ action: 1, createdAt: -1 });
systemLogSchema.index({ ipAddress: 1 });
systemLogSchema.index({ sessionId: 1 });
systemLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// مؤشر مركب للبحث المتقدم
systemLogSchema.index({
  entityType: 1,
  category: 1,
  status: 1,
  createdAt: -1
});

// Virtual للحصول على اسم الكيان
systemLogSchema.virtual('entityName').get(function() {
  return this.entityId ? `${this.entityType}:${this.entityId}` : this.entityType;
});

// دالة لإنشاء سجل نجاح
systemLogSchema.statics.logSuccess = function(
  action: string,
  entityType: string,
  entityId: mongoose.Types.ObjectId | undefined,
  actorId: mongoose.Types.ObjectId,
  actorRole: string,
  description: string,
  details?: any
): Promise<ISystemLog> {
  return this.create({
    action,
    entityType,
    entityId,
    actorId,
    actorRole,
    description,
    details,
    status: 'success',
    severity: 'low'
  });
};

// دالة لإنشاء سجل فشل
systemLogSchema.statics.logFailure = function(
  action: string,
  entityType: string,
  entityId: mongoose.Types.ObjectId | undefined,
  actorId: mongoose.Types.ObjectId,
  actorRole: string,
  description: string,
  errorCode?: string,
  errorMessage?: string,
  details?: any
): Promise<ISystemLog> {
  return this.create({
    action,
    entityType,
    entityId,
    actorId,
    actorRole,
    description,
    errorCode,
    errorMessage,
    details,
    status: 'failure',
    severity: errorCode ? 'high' : 'medium'
  });
};

// دالة لإنشاء سجل تحذير
systemLogSchema.statics.logWarning = function(
  action: string,
  entityType: string,
  entityId: mongoose.Types.ObjectId | undefined,
  actorId: mongoose.Types.ObjectId,
  actorRole: string,
  description: string,
  details?: any
): Promise<ISystemLog> {
  return this.create({
    action,
    entityType,
    entityId,
    actorId,
    actorRole,
    description,
    details,
    status: 'warning',
    severity: 'medium'
  });
};

// دالة لإنشاء سجل أمان حرج
systemLogSchema.statics.logSecurity = function(
  action: string,
  actorId: mongoose.Types.ObjectId,
  actorRole: string,
  description: string,
  ipAddress?: string,
  userAgent?: string,
  details?: any
): Promise<ISystemLog> {
  return this.create({
    action,
    entityType: 'system',
    actorId,
    actorRole,
    description,
    ipAddress,
    userAgent,
    details,
    category: 'security',
    status: 'warning',
    severity: 'critical'
  });
};

// دالة للحصول على السجلات حسب التاريخ
systemLogSchema.statics.getLogsByDateRange = function(
  startDate: Date,
  endDate: Date,
  filters?: {
    entityType?: string;
    actorId?: mongoose.Types.ObjectId;
    category?: string;
    severity?: string;
    status?: string;
  }
) {
  const query: any = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (filters?.entityType) query.entityType = filters.entityType;
  if (filters?.actorId) query.actorId = filters.actorId;
  if (filters?.category) query.category = filters.category;
  if (filters?.severity) query.severity = filters.severity;
  if (filters?.status) query.status = filters.status;

  return this.find(query).sort({ createdAt: -1 });
};

// دالة للحصول على إحصائيات السجلات
systemLogSchema.statics.getLogStats = function(
  startDate: Date,
  endDate: Date
) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
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
};

export const SystemLog = mongoose.model<ISystemLog>('SystemLog', systemLogSchema);