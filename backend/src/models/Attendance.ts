import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  classId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  checkOutTime?: string;
  note?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  method: 'manual' | 'qr_code' | 'biometric' | 'app';
  sessionNumber: number;
  academicYear: string;
  semester: 'الأول' | 'الثاني';
  createdBy: mongoose.Types.ObjectId;
  modifiedBy?: mongoose.Types.ObjectId;
  justification?: {
    reason: string;
    document?: string;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    status: 'pending' | 'approved' | 'rejected';
  };
}

const attendanceSchema = new Schema<IAttendance>({
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'معرف الفصل مطلوب']
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'معرف الطالب مطلوب']
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'معرف المدرس مطلوب']
  },
  date: {
    type: Date,
    required: [true, 'التاريخ مطلوب'],
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['present', 'absent', 'late', 'excused'],
      message: 'حالة الحضور غير صالحة'
    },
    required: [true, 'حالة الحضور مطلوبة']
  },
  checkInTime: {
    type: String,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صالحة']
  },
  checkOutTime: {
    type: String,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صالحة']
  },
  note: {
    type: String,
    maxlength: [500, 'الملاحظة لا يجب أن تزيد عن 500 حرف']
  },
  location: {
    latitude: {
      type: Number,
      min: [-90, 'خط العرض يجب أن يكون بين -90 و 90'],
      max: [90, 'خط العرض يجب أن يكون بين -90 و 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'خط الطول يجب أن يكون بين -180 و 180'],
      max: [180, 'خط الطول يجب أن يكون بين -180 و 180']
    },
    address: {
      type: String,
      maxlength: [200, 'العنوان لا يجب أن يزيد عن 200 حرف']
    }
  },
  method: {
    type: String,
    enum: {
      values: ['manual', 'qr_code', 'biometric', 'app'],
      message: 'طريقة التسجيل غير صالحة'
    },
    default: 'manual'
  },
  sessionNumber: {
    type: Number,
    required: [true, 'رقم الحصة مطلوب'],
    min: [1, 'رقم الحصة يجب أن يكون أكبر من 0']
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
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف من قام بالتسجيل مطلوب']
  },
  modifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  justification: {
    reason: {
      type: String,
      maxlength: [300, 'سبب الغياب لا يجب أن يزيد عن 300 حرف']
    },
    document: {
      type: String, // رابط الملف
      maxlength: [500, 'رابط الملف لا يجب أن يزيد عن 500 حرف']
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// مؤشرات مركبة للبحث السريع
attendanceSchema.index({ classId: 1, date: -1 });
attendanceSchema.index({ studentId: 1, date: -1 });
attendanceSchema.index({ teacherId: 1, date: -1 });
attendanceSchema.index({ date: -1, status: 1 });
attendanceSchema.index({ academicYear: 1, semester: 1 });
attendanceSchema.index({ classId: 1, studentId: 1, date: -1 });

// مؤشر فريد لمنع التكرار
attendanceSchema.index(
  { classId: 1, studentId: 1, date: 1, sessionNumber: 1 },
  { unique: true, message: 'سجل الحضور موجود بالفعل لهذا الطالب في هذه الحصة' }
);

// Virtual للحصول على اسم الطالب
attendanceSchema.virtual('studentName').get(function() {
  return this.studentId ? undefined : 'غير محدد';
});

// Virtual للحصول على اسم المدرس
attendanceSchema.virtual('teacherName').get(function() {
  return this.teacherId ? undefined : 'غير محدد';
});

// Virtual للحصول على اسم الفصل
attendanceSchema.virtual('className').get(function() {
  return this.classId ? undefined : 'غير محدد';
});

// دالة للتحقق من التأخير
attendanceSchema.methods.isLate = function(): boolean {
  return this.status === 'late';
};

// دالة للتحقق من الغياب
attendanceSchema.methods.isAbsent = function(): boolean {
  return this.status === 'absent';
};

// دالة للتحقق من الحضور
attendanceSchema.methods.isPresent = function(): boolean {
  return this.status === 'present';
};

// دالة لحساب مدة الحضور بالدقائق
attendanceSchema.methods.getAttendanceDuration = function(): number {
  if (!this.checkInTime || !this.checkOutTime) {
    return 0;
  }

  const checkIn = new Date(`1970-01-01T${this.checkInTime}:00`);
  const checkOut = new Date(`1970-01-01T${this.checkOutTime}:00`);

  return (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
};

// دالة لتحديث حالة التبرير
attendanceSchema.methods.approveJustification = function(approvedBy: mongoose.Types.ObjectId): void {
  if (this.justification) {
    this.justification.status = 'approved';
    this.justification.approvedBy = approvedBy;
    this.justification.approvedAt = new Date();
    this.status = 'excused';
  }
};

// دالة لرفض التبرير
attendanceSchema.methods.rejectJustification = function(): void {
  if (this.justification) {
    this.justification.status = 'rejected';
  }
};

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);