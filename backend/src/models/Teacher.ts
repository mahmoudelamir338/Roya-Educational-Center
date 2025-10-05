import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string[];
  qualification: string;
  experience: number; // سنوات الخبرة
  salary: number;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    classId: mongoose.Types.ObjectId;
  }[];
  bio?: string;
  specializations?: string[];
  languages: string[];
  rating?: number;
  totalSessions: number;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: Date;
  contractEndDate?: Date;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const teacherSchema = new Schema<ITeacher>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف المستخدم مطلوب'],
    unique: true
  },
  subject: [{
    type: String,
    required: [true, 'التخصص مطلوب'],
    enum: {
      values: [
        'الرياضيات',
        'الفيزياء',
        'الكيمياء',
        'الأحياء',
        'العربية',
        'الإنجليزية',
        'الفرنسية',
        'التاريخ',
        'الجغرافيا',
        'الفلسفة',
        'العلوم',
        'الحاسب الآلي',
        'التربية الدينية',
        'التربية الفنية',
        'التربية الموسيقية',
        'التربية البدنية'
      ],
      message: 'التخصص غير صالح'
    }
  }],
  qualification: {
    type: String,
    required: [true, 'المؤهل الدراسي مطلوب'],
    enum: {
      values: [
        'بكالوريوس',
        'ماجستير',
        'دكتوراه',
        'دبلوم',
        'شهادة مهنية'
      ],
      message: 'المؤهل الدراسي غير صالح'
    }
  },
  experience: {
    type: Number,
    required: [true, 'سنوات الخبرة مطلوبة'],
    min: [0, 'سنوات الخبرة لا يمكن أن تكون سالبة'],
    max: [50, 'سنوات الخبرة لا يمكن أن تزيد عن 50 سنة']
  },
  salary: {
    type: Number,
    required: [true, 'الراتب مطلوب'],
    min: [0, 'الراتب لا يمكن أن يكون سالب']
  },
  schedule: [{
    day: {
      type: String,
      required: true,
      enum: {
        values: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        message: 'يوم غير صالح'
      }
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صالحة']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صالحة']
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    }
  }],
  bio: {
    type: String,
    maxlength: [1000, 'السيرة الذاتية لا يجب أن تزيد عن 1000 حرف']
  },
  specializations: [{
    type: String,
    maxlength: [50, 'التخصص لا يجب أن يزيد عن 50 حرف']
  }],
  languages: [{
    type: String,
    required: [true, 'اللغات مطلوبة'],
    enum: {
      values: ['العربية', 'الإنجليزية', 'الفرنسية', 'الألمانية', 'الإسبانية'],
      message: 'اللغة غير مدعومة'
    }
  }],
  rating: {
    type: Number,
    min: [0, 'التقييم لا يمكن أن يكون أقل من 0'],
    max: [5, 'التقييم لا يمكن أن يزيد عن 5'],
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0,
    min: [0, 'عدد الحصص لا يمكن أن يكون سالب']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  contractEndDate: {
    type: Date
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// مؤشرات للبحث السريع
teacherSchema.index({ subject: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ languages: 1 });
teacherSchema.index({ rating: -1 });

// Virtual للحصول على اسم المدرس من المستخدم
teacherSchema.virtual('teacherName').get(function() {
  return this.userId ? undefined : 'غير محدد';
});

// Virtual لحساب متوسط التقييم
teacherSchema.virtual('averageRating').get(function() {
  return this.rating || 0;
});

// دالة لحساب إجمالي ساعات العمل الأسبوعية
teacherSchema.methods.getWeeklyHours = function(): number {
  return this.schedule.reduce((total: number, slot: any) => {
    const start = new Date(`1970-01-01T${slot.startTime}:00`);
    const end = new Date(`1970-01-01T${slot.endTime}:00`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + hours;
  }, 0);
};

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);