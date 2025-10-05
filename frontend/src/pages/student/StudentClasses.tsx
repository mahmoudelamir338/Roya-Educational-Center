import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Table, Modal, Input } from '../../components/ui';
import { StudentLayout } from './StudentLayout';

interface Class {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  schedule: string;
  room: string;
  status: 'active' | 'completed' | 'upcoming';
  progress: number;
  description: string;
  totalLessons: number;
  completedLessons: number;
  nextLesson?: {
    title: string;
    date: string;
    time: string;
    topic: string;
  };
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live';
  duration: string;
  status: 'completed' | 'in_progress' | 'locked' | 'available';
  completedDate?: string;
  dueDate?: string;
  grade?: number;
  maxGrade?: number;
}

interface ClassDetails {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  description: string;
  schedule: string;
  room: string;
  progress: number;
  lessons: Lesson[];
  materials: {
    id: string;
    title: string;
    type: 'pdf' | 'video' | 'audio' | 'document';
    url: string;
    size: string;
  }[];
}

export const StudentClasses: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'materials' | 'grades'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بفصول الطالب
      // const response = await api.get('/student/classes');

      // بيانات تجريبية مؤقتة
      setClasses([
        {
          id: '1',
          name: 'الرياضيات المستوى الأول',
          subject: 'الرياضيات',
          teacher: 'أحمد محمد',
          schedule: 'الأحد والثلاثاء 08:00 - 10:00',
          room: 'قاعة 101',
          status: 'active',
          progress: 75,
          description: 'دورة شاملة في الرياضيات الأساسية تشمل الحساب والجبر والهندسة',
          totalLessons: 24,
          completedLessons: 18,
          nextLesson: {
            title: 'المعادلات التربيعية',
            date: '2024-01-21',
            time: '08:00 - 10:00',
            topic: 'حل المعادلات التربيعية بالطرق المختلفة'
          }
        },
        {
          id: '2',
          name: 'اللغة العربية المستوى الثاني',
          subject: 'اللغة العربية',
          teacher: 'فاطمة حسن',
          schedule: 'الأحد والأربعاء 10:00 - 12:00',
          room: 'قاعة 205',
          status: 'active',
          progress: 60,
          description: 'تطوير مهارات القراءة والكتابة والتعبير باللغة العربية الفصحى',
          totalLessons: 20,
          completedLessons: 12
        },
        {
          id: '3',
          name: 'العلوم المستوى الأول',
          subject: 'العلوم',
          teacher: 'محمد علي',
          schedule: 'الاثنين والخميس 12:00 - 14:00',
          room: 'مختبر العلوم',
          status: 'active',
          progress: 45,
          description: 'مقدمة في العلوم الطبيعية تشمل الفيزياء والكيمياء وعلوم الحياة',
          totalLessons: 22,
          completedLessons: 10
        },
        {
          id: '4',
          name: 'التاريخ الإسلامي',
          subject: 'التاريخ',
          teacher: 'سارة أحمد',
          schedule: 'السبت 14:00 - 16:00',
          room: 'قاعة 103',
          status: 'upcoming',
          progress: 0,
          description: 'دراسة التاريخ الإسلامي منذ البعثة النبوية وحتى العصر الحديث',
          totalLessons: 18,
          completedLessons: 0
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId: string) => {
    try {
      // هنا سيتم استدعاء API الخاص بتفاصيل الفصل
      // const response = await api.get(`/student/classes/${classId}`);

      // بيانات تجريبية مؤقتة
      const classDetails: ClassDetails = {
        id: classId,
        name: classes.find(c => c.id === classId)?.name || '',
        subject: classes.find(c => c.id === classId)?.subject || '',
        teacher: classes.find(c => c.id === classId)?.teacher || '',
        description: classes.find(c => c.id === classId)?.description || '',
        schedule: classes.find(c => c.id === classId)?.schedule || '',
        room: classes.find(c => c.id === classId)?.room || '',
        progress: classes.find(c => c.id === classId)?.progress || 0,
        lessons: [
          {
            id: '1',
            title: 'مقدمة في المعادلات',
            type: 'video',
            duration: '45 دقيقة',
            status: 'completed',
            completedDate: '2024-01-15',
            grade: 85,
            maxGrade: 100
          },
          {
            id: '2',
            title: 'المعادلات الخطية',
            type: 'video',
            duration: '50 دقيقة',
            status: 'completed',
            completedDate: '2024-01-16',
            grade: 92,
            maxGrade: 100
          },
          {
            id: '3',
            title: 'المعادلات التربيعية',
            type: 'live',
            duration: '90 دقيقة',
            status: 'available',
            dueDate: '2024-01-21'
          },
          {
            id: '4',
            title: 'اختبار المعادلات',
            type: 'quiz',
            duration: '30 دقيقة',
            status: 'locked'
          },
          {
            id: '5',
            title: 'واجب منزلي',
            type: 'assignment',
            duration: 'حتى 2024-01-25',
            status: 'available',
            dueDate: '2024-01-25'
          }
        ],
        materials: [
          {
            id: '1',
            title: 'شرائح المعادلات الخطية',
            type: 'pdf',
            url: '/materials/linear-equations.pdf',
            size: '2.5 MB'
          },
          {
            id: '2',
            title: 'فيديو توضيحي للمعادلات التربيعية',
            type: 'video',
            url: '/materials/quadratic-equations.mp4',
            size: '45.2 MB'
          }
        ]
      };

      setSelectedClass(classDetails);
      setShowClassModal(true);
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'upcoming': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'upcoming': return 'قادم';
      default: return 'غير محدد';
    }
  };

  const getLessonStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'available': return 'primary';
      case 'locked': return 'secondary';
      default: return 'secondary';
    }
  };

  const getLessonStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      case 'available': return 'متاح';
      case 'locked': return 'مقفل';
      default: return 'غير محدد';
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
      case 'document': return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
      case 'quiz': return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
      case 'assignment': return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
      case 'live': return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
      default: return null;
    }
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const classesColumns = [
    {
      key: 'name',
      title: 'اسم الفصل',
      render: (value: string, record: Class) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{record.subject}</div>
        </div>
      )
    },
    {
      key: 'teacher',
      title: 'المعلم',
      render: (value: string) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary-600">
              {value.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'schedule',
      title: 'الجدول الزمني'
    },
    {
      key: 'progress',
      title: 'التقدم',
      render: (value: number, record: Class) => (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{record.completedLessons}/{record.totalLessons} درس</span>
            <span>{value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {getStatusText(value)}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (value: any, record: Class) => (
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => fetchClassDetails(record.id)}>
            عرض التفاصيل
          </Button>
          {record.nextLesson && (
            <Button size="sm" variant="secondary">
              الدرس القادم
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <StudentLayout title="فصولي">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الفصول...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title="فصولي والدروس"
      subtitle="جميع فصولك الدراسية والمحتوى التعليمي"
      actions={
        <div className="flex space-x-3">
          <Input
            placeholder="البحث في الفصول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="secondary" size="sm">
            جدول الفصول
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {classes.length}
              </div>
              <div className="text-sm text-gray-600">فصل نشط</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {classes.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">فصل نشط</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {classes.reduce((acc, c) => acc + c.completedLessons, 0)}
              </div>
              <div className="text-sm text-gray-600">درس مكتمل</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {Math.round(classes.reduce((acc, c) => acc + c.progress, 0) / classes.length)}%
              </div>
              <div className="text-sm text-gray-600">متوسط التقدم</div>
            </CardBody>
          </Card>
        </div>

        {/* قائمة الفصول */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">فصولي الدراسية</h3>
          </CardHeader>
          <CardBody className="p-0">
            <Table
              columns={classesColumns}
              data={filteredClasses}
              emptyMessage="لا توجد فصول متاحة حالياً"
            />
          </CardBody>
        </Card>

        {/* الفصل القادم */}
        {classes.find(c => c.nextLesson) && (
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">الدرس القادم</p>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {classes.find(c => c.nextLesson)?.nextLesson?.title}
                  </h3>
                  <p className="text-blue-100 text-sm mt-2">
                    {classes.find(c => c.nextLesson)?.name}
                  </p>
                  <p className="text-white font-medium mt-1">
                    {classes.find(c => c.nextLesson)?.nextLesson?.date} - {classes.find(c => c.nextLesson)?.nextLesson?.time}
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* نصائح دراسية */}
        <Card className="bg-green-50 border-green-200">
          <CardBody>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">نصائح للدراسة الفعالة</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• راجع دروسك يومياً لمدة 30 دقيقة على الأقل</li>
                  <li>• شارك في الدروس التفاعلية وحل التمارين العملية</li>
                  <li>• اسأل أسئلتك أثناء الدرس للحصول على إجابات فورية</li>
                  <li>• أكمل الواجبات في مواعيدها للحفاظ على تقدمك الدراسي</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* نافذة تفاصيل الفصل */}
      {showClassModal && selectedClass && (
        <Modal
          isOpen={showClassModal}
          onClose={() => setShowClassModal(false)}
          title={selectedClass.name}
          size="lg"
        >
          <div className="space-y-6">
            {/* تبويبات المحتوى */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'نظرة عامة' },
                  { id: 'lessons', name: 'الدروس' },
                  { id: 'materials', name: 'المواد التعليمية' },
                  { id: 'grades', name: 'الدرجات' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* محتوى التبويبات */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">وصف الفصل</h4>
                  <p className="text-gray-600">{selectedClass.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">المعلم</h4>
                    <p className="text-gray-600">{selectedClass.teacher}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">الجدول الزمني</h4>
                    <p className="text-gray-600">{selectedClass.schedule}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">القاعة</h4>
                    <p className="text-gray-600">{selectedClass.room}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">التقدم العام</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 flex-1">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedClass.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedClass.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="space-y-3">
                {selectedClass.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        lesson.status === 'completed' ? 'bg-green-100 text-green-600' :
                        lesson.status === 'available' ? 'bg-blue-100 text-blue-600' :
                        lesson.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {getLessonTypeIcon(lesson.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{lesson.duration}</span>
                          {lesson.completedDate && (
                            <span>مكتمل: {new Date(lesson.completedDate).toLocaleDateString('ar-EG')}</span>
                          )}
                          {lesson.dueDate && (
                            <span>تاريخ التسليم: {new Date(lesson.dueDate).toLocaleDateString('ar-EG')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {lesson.grade && (
                        <div className="text-center">
                          <div className="text-sm font-bold text-gray-900">
                            {lesson.grade}/{lesson.maxGrade}
                          </div>
                          <div className="text-xs text-gray-500">الدرجة</div>
                        </div>
                      )}
                      <Badge variant={getLessonStatusBadgeVariant(lesson.status)}>
                        {getLessonStatusText(lesson.status)}
                      </Badge>
                      {lesson.status !== 'locked' && (
                        <Button size="sm">
                          {lesson.status === 'completed' ? 'مراجعة' : 'بدء'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="space-y-3">
                {selectedClass.materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{material.title}</h4>
                        <div className="text-sm text-gray-500">
                          {material.size} • {material.type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      تحميل
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {selectedClass.progress}%
                  </div>
                  <div className="text-gray-600">التقدم العام في الفصل</div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">الدروس المكتملة</h4>
                  {selectedClass.lessons
                    .filter(lesson => lesson.status === 'completed' && lesson.grade)
                    .map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{lesson.title}</div>
                        <div className="text-sm text-gray-600">{lesson.type}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {lesson.grade}/{lesson.maxGrade}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((lesson.grade! / lesson.maxGrade!) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </StudentLayout>
  );
};