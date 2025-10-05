import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Modal, Input } from '../../components/ui';
import { GuardianLayout } from './GuardianLayout';

interface Child {
  id: string;
  name: string;
  grade: string;
  className: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  phone?: string;
  emergencyContact: string;
  medicalInfo?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'graduated';
  enrollmentDate: string;
  teachers: {
    subject: string;
    name: string;
    contact: string;
  }[];
}

export const GuardianChildrenProfile: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildrenData();
  }, []);

  const fetchChildrenData = async () => {
    try {
      const mockChildren: Child[] = [
        {
          id: '1',
          name: 'أحمد محمد علي',
          grade: 'الصف السادس الابتدائي',
          className: 'الفصل 6/أ',
          dateOfBirth: '2012-05-15',
          gender: 'male',
          address: 'شارع النيل، الجيزة، مصر',
          phone: '+20 10 1234 5678',
          emergencyContact: '+20 11 9876 5432 (الأم)',
          medicalInfo: 'لا توجد حساسية معروفة',
          status: 'active',
          enrollmentDate: '2023-09-01',
          teachers: [
            { subject: 'الرياضيات', name: 'أحمد محمد', contact: 'ahmed.mohamed@roya.edu' },
            { subject: 'اللغة العربية', name: 'فاطمة حسن', contact: 'fatima.hassan@roya.edu' },
            { subject: 'العلوم', name: 'محمد علي', contact: 'mohamed.ali@roya.edu' }
          ]
        },
        {
          id: '2',
          name: 'فاطمة أحمد علي',
          grade: 'الصف الثالث الابتدائي',
          className: 'الفصل 3/ب',
          dateOfBirth: '2015-08-22',
          gender: 'female',
          address: 'شارع النيل، الجيزة، مصر',
          phone: '+20 10 5555 6666',
          emergencyContact: '+20 11 9876 5432 (الأم)',
          medicalInfo: 'حساسية من المكسرات',
          status: 'active',
          enrollmentDate: '2023-09-01',
          teachers: [
            { subject: 'اللغة العربية', name: 'فاطمة حسن', contact: 'fatima.hassan@roya.edu' },
            { subject: 'الرياضيات', name: 'أحمد محمد', contact: 'ahmed.mohamed@roya.edu' },
            { subject: 'العلوم', name: 'محمد علي', contact: 'mohamed.ali@roya.edu' }
          ]
        }
      ];

      setChildren(mockChildren);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching children data:', error);
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'graduated': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'graduated': return 'متخرج';
      default: return 'غير محدد';
    }
  };

  if (loading) {
    return (
      <GuardianLayout title="ملف الأبناء">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل بيانات الأبناء...</p>
          </div>
        </div>
      </GuardianLayout>
    );
  }

  return (
    <GuardianLayout
      title="ملف الأبناء"
      subtitle="الملفات الشخصية والمعلومات الدراسية لأبنائك"
    >
      <div className="space-y-6">
        {/* قائمة الأبناء */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <Card
              key={child.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedChild(child);
                setShowProfileModal(true);
              }}
            >
              <CardBody className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-xl font-medium text-white">
                      {child.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-600">{child.grade}</p>
                    <p className="text-sm text-gray-500">{child.className}</p>
                    <div className="mt-2">
                      <Badge variant={getStatusBadgeVariant(child.status)}>
                        {getStatusText(child.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* معلومات إضافية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">إحصائيات الأبناء</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">إجمالي الأبناء:</span>
                  <span className="font-medium text-gray-900">{children.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الأبناء النشطين:</span>
                  <span className="font-medium text-green-600">
                    {children.filter(c => c.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">المتخرجين:</span>
                  <span className="font-medium text-blue-600">
                    {children.filter(c => c.status === 'graduated').length}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">معلمو أبنائك</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {Array.from(new Set(
                  children.flatMap(child => child.teachers.map(t => t.name))
                )).map((teacherName, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{teacherName}</div>
                      <div className="text-sm text-gray-600">
                        يدرس {children
                          .filter(child => child.teachers.some(t => t.name === teacherName))
                          .flatMap(child => child.teachers.filter(t => t.name === teacherName).map(t => t.subject))
                          .join(', ')}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary">
                      تواصل
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* نصائح للآباء */}
        <Card className="bg-purple-50 border-purple-200">
          <CardBody>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-purple-900 mb-1">نصائح لمتابعة ملفات أبنائك</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• احرص على تحديث بيانات الاتصال والمعلومات الطبية بانتظام</li>
                  <li>• تواصل مع معلمي أبنائك لمتابعة تقدمهم الدراسي</li>
                  <li>• احتفظ بنسخة من جميع الوثائق المهمة في مكان آمن</li>
                  <li>• شارك في اجتماعات أولياء الأمور والأنشطة المدرسية</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* نافذة تفاصيل ملف الابن */}
      {showProfileModal && selectedChild && (
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title={`ملف ${selectedChild.name}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* المعلومات الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-medium text-white">
                    {selectedChild.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedChild.name}</h3>
                <p className="text-gray-600">{selectedChild.grade}</p>
                <p className="text-gray-500">{selectedChild.className}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">المعلومات الشخصية</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الميلاد:</span>
                      <span className="font-medium">{new Date(selectedChild.dateOfBirth).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الجنس:</span>
                      <span className="font-medium">{selectedChild.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الهاتف:</span>
                      <span className="font-medium">{selectedChild.phone || 'غير محدد'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ التسجيل:</span>
                      <span className="font-medium">{new Date(selectedChild.enrollmentDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* العنوان ومعلومات الاتصال */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">العنوان</h4>
                <p className="text-gray-600 text-sm">{selectedChild.address}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">جهة الاتصال في الطوارئ</h4>
                <p className="text-gray-600 text-sm">{selectedChild.emergencyContact}</p>
              </div>
            </div>

            {/* المعلومات الطبية */}
            {selectedChild.medicalInfo && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">المعلومات الطبية</h4>
                <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                  <p className="text-red-800 text-sm">{selectedChild.medicalInfo}</p>
                </div>
              </div>
            )}

            {/* معلمو الطالب */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">معلمو الطالب</h4>
              <div className="space-y-3">
                {selectedChild.teachers.map((teacher, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{teacher.name}</div>
                      <div className="text-sm text-gray-600">{teacher.subject}</div>
                      <div className="text-xs text-gray-500">{teacher.contact}</div>
                    </div>
                    <Button size="sm" variant="secondary">
                      تواصل
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* الإجراءات */}
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
                إغلاق
              </Button>
              <Button>
                تعديل الملف
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </GuardianLayout>
  );
};