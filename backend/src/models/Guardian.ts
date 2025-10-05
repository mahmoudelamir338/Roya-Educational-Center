import mongoose, { Document, Schema } from 'mongoose';

export interface IGuardian extends Document {
  userId: mongoose.Types.ObjectId;
  children: mongoose.Types.ObjectId[];
  relationship: string;
  occupation?: string;
  workPhone?: string;
  preferredContactMethod: 'phone' | 'email' | 'sms' | 'app';
  notificationSettings: {
    attendance: boolean;
    payments: boolean;
    grades: boolean;
    announcements: boolean;
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  address?: {
    street: string;
    city: string;
    governorate: string;
    postalCode?: string;
  };
  status: 'active' | 'inactive';
  registrationDate: Date;
  lastLogin?: Date;
  notes?: string;
}

const guardianSchema = new Schema<IGuardian>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف المستخدم مطلوب'],
    unique: true
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'يجب إضافة طالب واحد على الأقل']
  }],
  relationship: {
    type: String,
    required: [true, 'صلة القرابة مطلوبة'],
    enum: {
      values: [
        'الأب',
        'الأم',
        'الجد',
        'الجدة',
        'العم',
        'الخال',
        'الوصي القانوني',
        'أخرى'
      ],
      message: 'صلة القرابة غير صالحة'
    }
  },
  occupation: {
    type: String,
    maxlength: [100, 'المهنة لا يجب أن تزيد عن 100 حرف']
  },
  workPhone: {
    type: String,
    match: [/^(\+20|0)?1[0-2,5]\d{8}$/, 'رقم الهاتف غير صالح']
  },
  preferredContactMethod: {
    type: String,
    enum: ['phone', 'email', 'sms', 'app'],
    default: 'app'
  },
  notificationSettings: {
    attendance: {
      type: Boolean,
      default: true
    },
    payments: {
      type: Boolean,
      default: true
    },
    grades: {
      type: Boolean,
      default: true
    },
    announcements: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: function() {
        return !!this.emergencyContact;
      }
    },
    phone: {
      type: String,
      required: function() {
        return !!this.emergencyContact;
      },
      match: [/^(\+20|0)?1[0-2,5]\d{8}$/, 'رقم الهاتف غير صالح']
    },
    relationship: {
      type: String,
      required: function() {
        return !!this.emergencyContact;
      }
    }
  },
  address: {
    street: {
      type: String,
      required: function() {
        return !!this.address;
      }
    },
    city: {
      type: String,
      required: function() {
        return !!this.address;
      }
    },
    governorate: {
      type: String,
      required: function() {
        return !!this.address;
      }
    },
    postalCode: {
      type: String,
      match: [/^[0-9]{5}$/, 'الرمز البريدي يجب أن يكون 5 أرقام']
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'الملاحظات لا يجب أن تزيد عن 500 حرف']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// مؤشرات للبحث السريع
guardianSchema.index({ children: 1 });
guardianSchema.index({ status: 1 });
guardianSchema.index({ preferredContactMethod: 1 });

// Virtual للحصول على اسم ولي الأمر من المستخدم
guardianSchema.virtual('guardianName').get(function() {
  return this.userId ? undefined : 'غير محدد';
});

// Virtual للحصول على عدد الأبناء
guardianSchema.virtual('childrenCount').get(function() {
  return this.children ? this.children.length : 0;
});

// دالة لإضافة طالب جديد
guardianSchema.methods.addChild = function(studentId: mongoose.Types.ObjectId): void {
  if (!this.children.includes(studentId)) {
    this.children.push(studentId);
  }
};

// دالة لإزالة طالب
guardianSchema.methods.removeChild = function(studentId: mongoose.Types.ObjectId): void {
  this.children = this.children.filter((id: mongoose.Types.ObjectId) => !id.equals(studentId));
};

// دالة للتحقق من صلاحية الإشعارات
guardianSchema.methods.shouldReceiveNotification = function(type: string): boolean {
  const settings = this.notificationSettings;
  switch (type) {
    case 'attendance':
      return settings.attendance && (settings.sms || settings.email || settings.push);
    case 'payments':
      return settings.payments && (settings.sms || settings.email || settings.push);
    case 'grades':
      return settings.grades && (settings.sms || settings.email || settings.push);
    case 'announcements':
      return settings.announcements && (settings.sms || settings.email || settings.push);
    default:
      return false;
  }
};

export const Guardian = mongoose.model<IGuardian>('Guardian', guardianSchema);