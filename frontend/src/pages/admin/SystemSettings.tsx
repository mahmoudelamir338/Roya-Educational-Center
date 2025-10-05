import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Alert, Modal } from '../../components/ui';
import { AdminLayout } from './AdminLayout';

interface SystemSettings {
  general: {
    centerName: string;
    centerDescription: string;
    centerLogo: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    website: string;
  };
  academic: {
    currentAcademicYear: string;
    currentSemester: string;
    schoolStartTime: string;
    schoolEndTime: string;
    breakStartTime: string;
    breakEndTime: string;
    workingDays: string[];
  };
  financial: {
    currency: string;
    latePaymentFee: number;
    paymentDueDays: number;
    acceptedPaymentMethods: string[];
    autoSendReminders: boolean;
    reminderDays: number[];
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notificationTypes: {
      attendance: boolean;
      payments: boolean;
      announcements: boolean;
      grades: boolean;
    };
  };
  security: {
    passwordMinLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
  };
}

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      centerName: 'مركز رؤية التعليمي',
      centerDescription: 'مركز متخصص في التعليم والتطوير',
      centerLogo: '',
      contactEmail: 'info@roya-center.com',
      contactPhone: '+20 123 456 789',
      address: 'القاهرة، مصر',
      website: 'https://roya-center.com'
    },
    academic: {
      currentAcademicYear: '2024/2025',
      currentSemester: 'الأول',
      schoolStartTime: '08:00',
      schoolEndTime: '15:00',
      breakStartTime: '12:00',
      breakEndTime: '13:00',
      workingDays: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء']
    },
    financial: {
      currency: 'جنيه مصري',
      latePaymentFee: 50,
      paymentDueDays: 30,
      acceptedPaymentMethods: ['كاش', 'تحويل بنكي', 'فيزا'],
      autoSendReminders: true,
      reminderDays: [7, 3, 1]
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      notificationTypes: {
        attendance: true,
        payments: true,
        announcements: true,
        grades: false
      }
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableTwoFactor: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const tabs = [
    { id: 'general', title: 'الإعدادات العامة', icon: '🏢' },
    { id: 'academic', title: 'الإعدادات الأكاديمية', icon: '📚' },
    { id: 'financial', title: 'الإعدادات المالية', icon: '💰' },
    { id: 'notifications', title: 'الإشعارات', icon: '🔔' },
    { id: 'security', title: 'الأمان', icon: '🔒' }
  ];

  const handleSave = async () => {
    setSaving(true);

    try {
      // هنا سيتم استدعاء API لحفظ الإعدادات
      // await api.post('/admin/settings', settings);

      // محاكاة نجاح العملية
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);

    } catch (error) {
      console.error('Error saving settings:', error);
      Alert({ message: 'حدث خطأ أثناء حفظ الإعدادات', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      // هنا سيتم استدعاء API لإعادة تعيين الإعدادات
      // await api.post('/admin/settings/reset');

      // محاكاة إعادة تعيين الإعدادات
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowResetModal(false);
      Alert({ message: 'تم إعادة تعيين الإعدادات بنجاح' });

    } catch (error) {
      console.error('Error resetting settings:', error);
      Alert({ message: 'حدث خطأ أثناء إعادة تعيين الإعدادات', variant: 'danger' });
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNestedSetting = (section: keyof SystemSettings, subsection: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [key]: value
        }
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="اسم المركز"
          value={settings.general.centerName}
          onChange={(e) => updateSetting('general', 'centerName', e.target.value)}
        />

        <Input
          label="البريد الإلكتروني"
          type="email"
          value={settings.general.contactEmail}
          onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
        />

        <Input
          label="رقم الهاتف"
          value={settings.general.contactPhone}
          onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
        />

        <Input
          label="الموقع الإلكتروني"
          value={settings.general.website}
          onChange={(e) => updateSetting('general', 'website', e.target.value)}
        />
      </div>

      <Input
        label="وصف المركز"
        value={settings.general.centerDescription}
        onChange={(e) => updateSetting('general', 'centerDescription', e.target.value)}
      />

      <Input
        label="العنوان"
        value={settings.general.address}
        onChange={(e) => updateSetting('general', 'address', e.target.value)}
      />

      <div className="form-group">
        <label className="form-label">شعار المركز</label>
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">شعار</span>
          </div>
          <div>
            <Button variant="secondary" size="sm">
              اختيار صورة
            </Button>
            <p className="text-sm text-gray-500 mt-1">
              يُفضل أن تكون الصورة بحجم 200x200 بكسل
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAcademicSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="السنة الدراسية الحالية"
          value={settings.academic.currentAcademicYear}
          onChange={(e) => updateSetting('academic', 'currentAcademicYear', e.target.value)}
        />

        <div className="form-group">
          <label className="form-label">الفصل الدراسي الحالي</label>
          <select
            className="form-input"
            value={settings.academic.currentSemester}
            onChange={(e) => updateSetting('academic', 'currentSemester', e.target.value)}
          >
            <option value="الأول">الأول</option>
            <option value="الثاني">الثاني</option>
          </select>
        </div>

        <Input
          label="وقت بداية الدوام"
          type="time"
          value={settings.academic.schoolStartTime}
          onChange={(e) => updateSetting('academic', 'schoolStartTime', e.target.value)}
        />

        <Input
          label="وقت نهاية الدوام"
          type="time"
          value={settings.academic.schoolEndTime}
          onChange={(e) => updateSetting('academic', 'schoolEndTime', e.target.value)}
        />

        <Input
          label="بدء الاستراحة"
          type="time"
          value={settings.academic.breakStartTime}
          onChange={(e) => updateSetting('academic', 'breakStartTime', e.target.value)}
        />

        <Input
          label="نهاية الاستراحة"
          type="time"
          value={settings.academic.breakEndTime}
          onChange={(e) => updateSetting('academic', 'breakEndTime', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">أيام العمل</label>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
          {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => (
            <label key={day} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.academic.workingDays.includes(day)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateSetting('academic', 'workingDays', [...settings.academic.workingDays, day]);
                  } else {
                    updateSetting('academic', 'workingDays', settings.academic.workingDays.filter(d => d !== day));
                  }
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="mr-2 text-sm">{day}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinancialSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="العملة"
          value={settings.financial.currency}
          onChange={(e) => updateSetting('financial', 'currency', e.target.value)}
        />

        <Input
          label="غرامة التأخير"
          type="number"
          value={settings.financial.latePaymentFee}
          onChange={(e) => updateSetting('financial', 'latePaymentFee', parseFloat(e.target.value))}
        />

        <Input
          label="مهلة الدفع (بالأيام)"
          type="number"
          value={settings.financial.paymentDueDays}
          onChange={(e) => updateSetting('financial', 'paymentDueDays', parseInt(e.target.value))}
        />

        <div className="form-group">
          <label className="form-label">طرق الدفع المقبولة</label>
          <div className="space-y-2">
            {['كاش', 'تحويل بنكي', 'فيزا', 'محفظة إلكترونية'].map(method => (
              <label key={method} className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.financial.acceptedPaymentMethods.includes(method)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateSetting('financial', 'acceptedPaymentMethods', [...settings.financial.acceptedPaymentMethods, method]);
                    } else {
                      updateSetting('financial', 'acceptedPaymentMethods', settings.financial.acceptedPaymentMethods.filter(m => m !== method));
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="mr-2 text-sm">{method}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.financial.autoSendReminders}
            onChange={(e) => updateSetting('financial', 'autoSendReminders', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="mr-2 text-sm font-medium">تفعيل الإشعارات التلقائية للمدفوعات</span>
        </label>
      </div>

      {settings.financial.autoSendReminders && (
        <div className="form-group">
          <label className="form-label">أيام الإشعار قبل الاستحقاق</label>
          <div className="flex gap-2">
            {[7, 3, 1].map(day => (
              <label key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.financial.reminderDays.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateSetting('financial', 'reminderDays', [...settings.financial.reminderDays, day]);
                    } else {
                      updateSetting('financial', 'reminderDays', settings.financial.reminderDays.filter(d => d !== day));
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="mr-2 text-sm">{day} أيام</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="form-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="mr-2 text-sm font-medium">إشعارات البريد الإلكتروني</span>
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="mr-2 text-sm font-medium">إشعارات الرسائل النصية</span>
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="mr-2 text-sm font-medium">إشعارات الدفع</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">أنواع الإشعارات</label>
        <div className="space-y-3">
          {Object.entries(settings.notifications.notificationTypes).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateNestedSetting('notifications', 'notificationTypes', key, e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="mr-2 text-sm">
                {key === 'attendance' ? 'الحضور والغياب' :
                 key === 'payments' ? 'المدفوعات' :
                 key === 'announcements' ? 'الإعلانات' : 'الدرجات'}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="الحد الأدنى لطول كلمة المرور"
          type="number"
          value={settings.security.passwordMinLength}
          onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
        />

        <Input
          label="مهلة انتهاء الجلسة (بالدقائق)"
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
        />

        <Input
          label="الحد الأقصى لمحاولات تسجيل الدخول"
          type="number"
          value={settings.security.maxLoginAttempts}
          onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-4">
        <div className="form-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.security.requireSpecialChars}
              onChange={(e) => updateSetting('security', 'requireSpecialChars', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="mr-2 text-sm font-medium">طلب أحرف خاصة في كلمة المرور</span>
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.security.requireNumbers}
              onChange={(e) => updateSetting('security', 'requireNumbers', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="mr-2 text-sm font-medium">طلب أرقام في كلمة المرور</span>
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.security.enableTwoFactor}
              onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="mr-2 text-sm font-medium">تفعيل المصادقة الثنائية</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'academic':
        return renderAcademicSettings();
      case 'financial':
        return renderFinancialSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <AdminLayout
      title="إعدادات النظام"
      subtitle="تخصيص إعدادات المركز والنظام"
      actions={
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowResetModal(true)}
          >
            إعادة تعيين
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
          >
            حفظ الإعدادات
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* تنبيه النجاح */}
        {showSuccessAlert && (
          <Alert variant="success" dismissible onDismiss={() => setShowSuccessAlert(false)}>
            تم حفظ الإعدادات بنجاح
          </Alert>
        )}

        {/* تبويبات الإعدادات */}
        <Card>
          <CardBody>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.title}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* محتوى التبويب النشط */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.title}
            </h3>
          </CardHeader>
          <CardBody>
            {renderTabContent()}
          </CardBody>
        </Card>
      </div>

      {/* نافذة تأكيد إعادة التعيين */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="تأكيد إعادة التعيين"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟
            <br />
            هذا الإجراء لا يمكن التراجع عنه.
          </p>

          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowResetModal(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleReset}
              loading={loading}
            >
              إعادة تعيين
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};