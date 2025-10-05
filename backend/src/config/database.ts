import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('متغيرات البيئة SUPABASE_URL و SUPABASE_ANON_KEY مطلوبة');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

console.log('✅ تم إعداد Supabase بنجاح');

// اختبار الاتصال
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (which is normal for new projects)
      console.error('❌ خطأ في الاتصال بـ Supabase:', error);
      return false;
    }

    console.log('✅ تم الاتصال بقاعدة البيانات Supabase بنجاح');
    return true;
  } catch (error) {
    console.error('❌ فشل في الاتصال بقاعدة البيانات:', error);
    return false;
  }
};

export default supabase;