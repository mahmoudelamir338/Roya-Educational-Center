import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roya-educational-center';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // إعدادات MongoDB الحديثة
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });

    console.log(`✅ MongoDB متصل: ${conn.connection.host}`);

    // مراقبة حالة الاتصال
    mongoose.connection.on('error', (err) => {
      console.error('❌ خطأ في اتصال MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB انقطع الاتصال');
    });

    // إغلاق الاتصال بناءً على إشارات النظام
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔄 تم إغلاق اتصال MongoDB');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ فشل في الاتصال بـ MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;