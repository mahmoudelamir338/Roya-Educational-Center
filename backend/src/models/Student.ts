import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  nationalID: string;
  grade: string;
  guardianId?: mongoose.Types.ObjectId;
  enrolledClasses: mongoose.Types.ObjectId[];
  balance: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo?: {
    allergies?: string;
    medications?: string;
    emergencyContact?: string;
  };
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  notes?: string;
}

const studentSchema = new Schema<IStudent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف المستخدم مطلوب'],
    unique: true
  },
  nationalID: {
    type: String,
    required: [true, 'الرقم القومي مطلوب'],
    unique: true,
    match: [/^[0-9]{14}$/, 'الرقم القومي يجب أن يكون 14 رقم']
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
  guardianId: {
    type: Schema.Types.ObjectId,
    ref: 'Guardian'
  },
  enrolledClasses: [{
    type: Schema.Types.ObjectId,
    ref: 'Class'
  }],
  balance: {
    type: Number,
    default: 0,
    min: [0, 'الرصيد لا يمكن أن يكون سالب']
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
  medicalInfo: {
    allergies: String,
    medications: String,
    emergencyContact: String
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'transferred'],
    default: 'active'
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
studentSchema.index({ nationalID: 1 });
studentSchema.index({ grade: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ guardianId: 1 });

// Virtual للحصول على اسم الطالب من المستخدم
studentSchema.virtual('studentName').get(function() {
  return this.userId ? undefined : 'غير محدد';
});

// Virtual للحصول على نسبة الحضور
studentSchema.virtual('attendanceRate').get(async function() {
  // سيتم حسابها من سجلات الحضور
  return 0;
});

export const Student = mongoose.model<IStudent>('Student', studentSchema);