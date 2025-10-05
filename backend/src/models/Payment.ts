import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  type: 'tuition' | 'registration' | 'material' | 'transport' | 'other';
  method: 'cash' | 'card' | 'bank_transfer' | 'online' | 'check';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  dueDate: Date;
  paidDate?: Date;
  description?: string;
  invoiceNumber: string;
  classIds?: mongoose.Types.ObjectId[];
  discount?: {
    amount: number;
    reason: string;
    approvedBy: mongoose.Types.ObjectId;
  };
  lateFee?: {
    amount: number;
    reason: string;
  };
  paymentReference?: string;
  transactionId?: string;
  gateway?: 'stripe' | 'paypal' | 'square';
  metadata?: {
    cardLast4?: string;
    cardBrand?: string;
    bankName?: string;
    checkNumber?: string;
  };
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  processedBy?: mongoose.Types.ObjectId;
  refund?: {
    amount: number;
    reason: string;
    date: Date;
    processedBy: mongoose.Types.ObjectId;
  };
}

const paymentSchema = new Schema<IPayment>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'معرف الطالب مطلوب']
  },
  amount: {
    type: Number,
    required: [true, 'المبلغ مطلوب'],
    min: [0, 'المبلغ لا يمكن أن يكون سالب']
  },
  currency: {
    type: String,
    default: 'EGP',
    enum: {
      values: ['EGP', 'USD', 'EUR'],
      message: 'العملة غير مدعومة'
    }
  },
  type: {
    type: String,
    enum: {
      values: ['tuition', 'registration', 'material', 'transport', 'other'],
      message: 'نوع الدفع غير صالح'
    },
    required: [true, 'نوع الدفع مطلوب']
  },
  method: {
    type: String,
    enum: {
      values: ['cash', 'card', 'bank_transfer', 'online', 'check'],
      message: 'طريقة الدفع غير صالحة'
    },
    required: [true, 'طريقة الدفع مطلوبة']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      message: 'حالة الدفع غير صالحة'
    },
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'تاريخ الاستحقاق مطلوب']
  },
  paidDate: {
    type: Date
  },
  description: {
    type: String,
    maxlength: [500, 'الوصف لا يجب أن يزيد عن 500 حرف']
  },
  invoiceNumber: {
    type: String,
    required: [true, 'رقم الفاتورة مطلوب'],
    unique: true,
    match: [/^INV-\d{6}$/, 'صيغة رقم الفاتورة يجب أن تكون INV-123456']
  },
  classIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Class'
  }],
  discount: {
    amount: {
      type: Number,
      min: [0, 'قيمة الخصم لا يمكن أن تكون سالبة']
    },
    reason: {
      type: String,
      maxlength: [200, 'سبب الخصم لا يجب أن يزيد عن 200 حرف']
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  lateFee: {
    amount: {
      type: Number,
      min: [0, 'قيمة الغرامة لا يمكن أن تكون سالبة']
    },
    reason: {
      type: String,
      maxlength: [200, 'سبب الغرامة لا يجب أن يزيد عن 200 حرف']
    }
  },
  paymentReference: {
    type: String,
    maxlength: [100, 'الرقم المرجعي لا يجب أن يزيد عن 100 حرف']
  },
  transactionId: {
    type: String,
    maxlength: [200, 'رقم المعاملة لا يجب أن يزيد عن 200 حرف']
  },
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'square']
  },
  metadata: {
    cardLast4: {
      type: String,
      match: [/^\d{4}$/, 'آخر 4 أرقام من البطاقة يجب أن تكون 4 أرقام']
    },
    cardBrand: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover']
    },
    bankName: {
      type: String,
      maxlength: [100, 'اسم البنك لا يجب أن يزيد عن 100 حرف']
    },
    checkNumber: {
      type: String,
      maxlength: [50, 'رقم الشيك لا يجب أن يزيد عن 50 حرف']
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'الملاحظات لا يجب أن تزيد عن 500 حرف']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف من قام بإنشاء الدفع مطلوب']
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  refund: {
    amount: {
      type: Number,
      min: [0, 'مبلغ الاسترداد لا يمكن أن يكون سالب']
    },
    reason: {
      type: String,
      required: true,
      maxlength: [200, 'سبب الاسترداد لا يجب أن يزيد عن 200 حرف']
    },
    date: {
      type: Date,
      default: Date.now
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// مؤشرات للبحث السريع
paymentSchema.index({ studentId: 1, status: 1 });
paymentSchema.index({ status: 1, dueDate: -1 });
paymentSchema.index({ invoiceNumber: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual لحساب المبلغ النهائي بعد الخصم والغرامات
paymentSchema.virtual('finalAmount').get(function() {
  let amount = this.amount;

  if (this.discount && this.discount.amount) {
    amount -= this.discount.amount;
  }

  if (this.lateFee && this.lateFee.amount) {
    amount += this.lateFee.amount;
  }

  return Math.max(0, amount);
});

// Virtual للتحقق من التأخير في السداد
paymentSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.dueDate < new Date();
});

// Virtual للتحقق من السداد
paymentSchema.virtual('isPaid').get(function() {
  return this.status === 'completed';
});

// دالة لتطبيق الخصم
paymentSchema.methods.applyDiscount = function(
  discountAmount: number,
  reason: string,
  approvedBy: mongoose.Types.ObjectId
): void {
  this.discount = {
    amount: discountAmount,
    reason,
    approvedBy
  };
};

// دالة لإضافة غرامة تأخير
paymentSchema.methods.addLateFee = function(
  feeAmount: number,
  reason: string
): void {
  this.lateFee = {
    amount: feeAmount,
    reason
  };
};

// دالة لمعالجة الدفع
paymentSchema.methods.processPayment = function(
  processedBy: mongoose.Types.ObjectId,
  transactionId?: string
): void {
  this.status = 'completed';
  this.paidDate = new Date();
  this.processedBy = processedBy;

  if (transactionId) {
    this.transactionId = transactionId;
  }
};

// دالة لإلغاء الدفع
paymentSchema.methods.cancelPayment = function(): void {
  this.status = 'cancelled';
};

// دالة لاسترداد المبلغ
paymentSchema.methods.refundPayment = function(
  refundAmount: number,
  reason: string,
  processedBy: mongoose.Types.ObjectId
): void {
  this.status = 'refunded';
  this.refund = {
    amount: refundAmount,
    reason,
    date: new Date(),
    processedBy
  };
};

// دالة لفشل الدفع
paymentSchema.methods.failPayment = function(): void {
  this.status = 'failed';
};

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);