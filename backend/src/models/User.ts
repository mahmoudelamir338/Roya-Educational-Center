import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  phone: string;
  password: string;
  role: 'student' | 'teacher' | 'guardian' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    maxlength: [50, 'الاسم لا يجب أن يزيد عن 50 حرف']
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true,
    match: [/^(\+20|0)?1[0-2,5]\d{8}$/, 'رقم الهاتف غير صالح']
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'guardian', 'admin'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// إنشاء مؤشر للبحث السريع برقم الهاتف
userSchema.index({ phone: 1 });

export const User = mongoose.model<IUser>('User', userSchema);