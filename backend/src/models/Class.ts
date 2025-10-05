import mongoose, { Document, Schema } from 'mongoose';

export interface IClass extends Document {
  name: string;
  subject: string;
  teacherId: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  maxStudents: number;
  currentStudents: number;
  price: number;
  currency: string;
  duration: number; // مدة الحصة بالدقائق
  description?: string;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  room?: string;
  materials?: string[];
  prerequisites?: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  grade: string;
  academicYear: string;
  semester: 'الأول' | 'الثاني';
  notes?: string;
}

const classSchema = new Schema<IClass>({
  name: {
    type: String,
    required: [true, 'اسم الفصل مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الفصل لا يجب أن يزيد عن 100 حرف']
  },
  subject: {
    type: String,
    required: [true, 'المادة مطلوبة'],
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
      message: 'المادة غير صالحة'
    }
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'معرف المدرس مطلوب']
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }],
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
    room: {
      type: String,
      trim: true,
      maxlength: [50, 'اسم القاعة لا يجب أن يزيد عن 50 حرف']
    }
  }],
  maxStudents: {
    type: Number,
    required: [true, 'الحد الأقصى لعدد الطلاب مطلوب'],
    min: [1, 'الحد الأقصى يجب أن يكون طالب واحد على الأقل'],
    max: [50, 'الحد الأقصى لا يمكن أن يزيد عن 50 طالب']
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: [0, 'عدد الطلاب الحالي لا يمكن أن يكون سالب']
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: [0, 'السعر لا يمكن أن يكون سالب']
  },
  currency: {
    type: String,
    default: 'EGP',
    enum: {
      values: ['EGP', 'USD', 'EUR'],
      message: 'العملة غير مدعومة'
    }
  },
  duration: {
    type: Number,
    required: [true, 'مدة الحصة مطلوبة'],
    min: [30, 'مدة الحصة يجب أن تكون 30 دقيقة على الأقل'],
    max: [240, 'مدة الحصة لا يمكن أن تزيد عن 4 ساعات']
  },
  description: {
    type: String,
    maxlength: [1000, 'الوصف لا يجب أن يزيد عن 1000 حرف']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: [true, 'تاريخ البداية مطلوب']
  },
  endDate: {
    type: Date
  },
  room: {
    type: String,
    trim: true,
    maxlength: [50, 'اسم القاعة لا يجب أن يزيد عن 50 حرف']
  },
  materials: [{
    type: String,
    maxlength: [200, 'اسم المادة لا يجب أن يزيد عن 200 حرف']
  }],
  prerequisites: [{
    type: String,
    maxlength: [200, 'المتطلب المسبق لا يجب أن يزيد عن 200 حرف']
  }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  grade: {
    type: String,
    required: [true, 'المرحلة الدراسية مطلوبة'],
    enum: {
      values: [
        'الصف الأول الابتدائي',
        'الصف الثاني الابتدائي',
        'الصف الثالث الابتدائي',
        'الصف الرابع الابتدائي',
        'الصف الخامس الابتدائي',
        'الصف السادس الابتدائي',
        'الصف الأول الإعدادي',
        'الصف الثاني الإعدادي',
        'الصف الثالث الإعدادي',
        'الصف الأول الثانوي',
        'الصف الثاني الثانوي',
        'الصف الثالث الثانوي'
      ],
      message: 'المرحلة الدراسية غير صالحة'
    }
  },
  academicYear: {
    type: String,
    required: [true, 'السنة الدراسية مطلوبة'],
    match: [/^\d{4}\/\d{4}$/, 'صيغة السنة الدراسية يجب أن تكون سنة/سنة']
  },
  semester: {
    type: String,
    enum: ['الأول', 'الثاني'],
    required: [true, 'الفصل الدراسي مطلوب']
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
classSchema.index({ subject: 1 });
classSchema.index({ teacherId: 1 });
classSchema.index({ status: 1 });
classSchema.index({ grade: 1 });
classSchema.index({ academicYear: 1 });
classSchema.index({ semester: 1 });

// Virtual لحساب نسبة الإشغال
classSchema.virtual('occupancyRate').get(function() {
  return this.maxStudents > 0 ? (this.currentStudents / this.maxStudents) * 100 : 0;
});

// Virtual للتحقق من وجود أماكن متاحة
classSchema.virtual('hasAvailableSpots').get(function() {
  return this.currentStudents < this.maxStudents;
});

// Virtual لحساب إجمالي عدد الحصص في الأسبوع
classSchema.virtual('weeklySessions').get(function() {
  return this.schedule ? this.schedule.length : 0;
});

// دالة لإضافة طالب للفصل
classSchema.methods.addStudent = function(studentId: mongoose.Types.ObjectId): boolean {
  if (this.students.includes(studentId) || this.currentStudents >= this.maxStudents) {
    return false;
  }

  this.students.push(studentId);
  this.currentStudents += 1;
  return true;
};

// دالة لإزالة طالب من الفصل
classSchema.methods.removeStudent = function(studentId: mongoose.Types.ObjectId): boolean {
  const index = this.students.indexOf(studentId);
  if (index === -1) {
    return false;
  }

  this.students.splice(index, 1);
  this.currentStudents = Math.max(0, this.currentStudents - 1);
  return true;
};

// دالة للتحقق من توفر المكان
classSchema.methods.hasAvailableSpot = function(): boolean {
  return this.currentStudents < this.maxStudents;
};

// دالة لحساب إجمالي الإيرادات المتوقعة
classSchema.methods.getExpectedRevenue = function(): number {
  return this.price * this.currentStudents;
};

export const Class = mongoose.model<IClass>('Class', classSchema);