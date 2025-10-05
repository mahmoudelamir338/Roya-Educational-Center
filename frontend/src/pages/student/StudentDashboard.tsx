import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Table } from '../../components/ui';
import { StudentLayout } from './StudentLayout';

interface StudentStats {
  totalClasses: number;
  averageGrade: number;
  attendanceRate: number;
  pendingAssignments: number;
  unreadNotifications: number;
  nextClass?: {
    name: string;
    time: string;
    teacher: string;
  };
}

interface Class {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  nextClass: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  progress: number;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  priority: 'low' | 'medium' | 'high';
}

interface RecentGrade {
  id: string;
  subject: string;
  testType: string;
  score: number;
  maxScore: number;
  date: string;
  grade: string;
}

export const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<StudentStats>({
    totalClasses: 0,
    averageGrade: 0,
    attendanceRate: 0,
    pendingAssignments: 0,
    unreadNotifications: 0
  });

  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recentGrades, setRecentGrades] = useState<RecentGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بلوحة تحكم الطالب
      // const response = await api.get('/student/dashboard');

      // بيانات تجريبية مؤقتة
      setStats({
        totalClasses: 6,
        averageGrade: 87.5,
        attendanceRate: 94.2,
        pendingAssignments: 3,
        unreadNotifications: 5,
        nextClass: {
          name: 'الرياضيات المستوى الأول',
          time: '08:00 - 10:00',
          teacher: 'أحمد محمد'
        }
      });

      setClasses([
        {
          id: '1',
          name: 'الرياضيات المستوى الأول',
          subject: 'الرياضيات',
          teacher: 'أحمد محمد',
          nextClass: 'اليوم 08:00 - 10:00',
          status: 'upcoming',
          progress: 75
        },
        {
          id: '2',
          name: 'اللغة العربية المستوى الثاني',
          subject: 'اللغة العربية',
          teacher: 'فاطمة حسن',
          nextClass: 'اليوم 10:00 - 12:00',
          status: 'ongoing',
          progress: 60
        },
        {
          id: '3',
          name: 'العلوم المستوى الأول',
          subject: 'العلوم',
          teacher: 'محمد علي',
          nextClass: 'غداً 08:00 - 10:00',
          status: 'upcoming',
          progress: 45
        }
      ]);

      setAssignments([
        {
          id: '1',
          title: 'حل المعادلات التربيعية',
          subject: 'الرياضيات',
          dueDate: '2024-01-25',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '2',
          title: 'كتابة إنشاء عن البيئة',
          subject: 'اللغة العربية',
          dueDate: '2024-01-28',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'مشروع العلوم عن النباتات',
          subject: 'العلوم',
          dueDate: '2024-02-01',
          status: 'submitted',
          priority: 'high'
        }
      ]);

      setRecentGrades([
        {
          id: '1',
          subject: 'الرياضيات',
          testType: 'اختبار قصير',
          score: 85,
          maxScore: 100,
          date: '2024-01-15',
          grade: 'جيد جداً'
        },
        {
          id: '2',
          subject: 'اللغة العربية',
          testType: 'واجب منزلي',
          score: 92,
          maxScore: 100,
          date: '2024-01-14',
          grade: 'ممتاز'
        },
        {
          id: '3',
          subject: 'العلوم',
          testType: 'مشروع',
          score: 88,
          maxScore: 100,
          date: '2024-01-12',
          grade: 'جيد جداً'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    className?: string;
  }> = ({ title, value, subtitle, icon, trend, className = '' }) => (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center mt-2 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <svg
                  className={`h-4 w-4 mr-1 ${
                    trend.isPositive ? '' : 'transform rotate-180'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span className="text-sm font-medium">
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'upcoming': return 'warning';
      case 'ongoing': return 'success';
      case 'completed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getAssignmentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'submitted': return 'primary';
      case 'graded': return 'success';
      default: return 'secondary';
    }
  };

  const getAssignmentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'submitted': return 'تم التسليم';
      case 'graded': return 'مُقيّم';
      default: return 'غير محدد';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const assignmentsColumns = [
    {
      key: 'title',
      title: 'عنوان الواجب',
      render: (value: string, record: Assignment) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{record.subject}</div>
        </div>
      )
    },
    {
      key: 'dueDate',
      title: 'تاريخ التسليم',
      render: (value: string) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(value).toLocaleDateString('ar-EG')}
          </div>
          <div className="text-gray-500">
            {Math.ceil((new Date(value).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم متبقي
          </div>
        </div>
      )
    },
    {
      key: 'priority',
      title: 'الأولوية',
      render: (value: string) => (
        <Badge variant={getPriorityBadgeVariant(value)}>
          {value === 'high' ? 'عالية' :
           value === 'medium' ? 'متوسطة' : 'منخفضة'}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: string) => (
        <Badge variant={getAssignmentStatusBadgeVariant(value)}>
          {getAssignmentStatusText(value)}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (value: any, record: Assignment) => (
        <Button size="sm">
          {record.status === 'pending' ? 'بدء العمل' : 'عرض التفاصيل'}
        </Button>
      )
    }
  ];

  const gradesColumns = [
    {
      key: 'subject',
      title: 'المادة'
    },
    {
      key: 'testType',
      title: 'نوع الاختبار'
    },
    {
      key: 'score',
      title: 'الدرجة',
      render: (value: number, record: RecentGrade) => (
        <div className="text-center">
          <div className={`text-lg font-bold ${getGradeColor(record.score, record.maxScore)}`}>
            {value} / {record.maxScore}
          </div>
          <div className="text-sm text-gray-500">
            {Math.round((record.score / record.maxScore) * 100)}%
          </div>
        </div>
      )
    },
    {
      key: 'grade',
      title: 'التقدير',
      render: (value: string) => (
        <Badge variant="primary">{value}</Badge>
      )
    },
    {
      key: 'date',
      title: 'التاريخ'
    }
  ];

  if (loading) {
    return (
      <StudentLayout title="لوحة التحكم">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title="لوحة التحكم"
      subtitle="نظرة عامة على دراستك وتقدمك"
      actions={
        <div className="flex space-x-3">
          <Button variant="secondary" size="sm">
            جدول الفصول
          </Button>
          <Button size="sm">
            التقرير الأكاديمي
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي الفصول"
            value={stats.totalClasses}
            subtitle="فصل دراسي هذا العام"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />

          <StatCard
            title="المعدل العام"
            value={`${stats.averageGrade}%`}
            subtitle="متوسط الدرجات"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            trend={{ value: 5.2, isPositive: true }}
          />

          <StatCard
            title="معدل الحضور"
            value={`${stats.attendanceRate}%`}
            subtitle="هذا الشهر"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={{ value: 2.1, isPositive: true }}
          />

          <StatCard
            title="الواجبات المعلقة"
            value={stats.pendingAssignments}
            subtitle="تحتاج إنجاز"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>

        {/* الفصل القادم والواجبات العاجلة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الفصل القادم */}
          {stats.nextClass && (
            <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-100 text-sm">الفصل القادم</p>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {stats.nextClass.name}
                    </h3>
                    <p className="text-primary-100 text-sm mt-2">
                      مع {stats.nextClass.teacher}
                    </p>
                    <p className="text-white font-medium mt-1">
                      {stats.nextClass.time}
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

          {/* الواجبات العاجلة */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">الواجبات العاجلة</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {assignments.filter(a => a.status === 'pending').slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <p className="text-sm text-gray-600">{assignment.subject}</p>
                      <p className="text-xs text-gray-500">
                        تاريخ التسليم: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityBadgeVariant(assignment.priority)}>
                        {assignment.priority === 'high' ? 'عالية' :
                         assignment.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </Badge>
                      <Button size="sm">
                        ابدأ العمل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* الفصول الحالية والدرجات الأخيرة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الفصول الحالية */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">فصولي الحالية</h3>
                <Button variant="secondary" size="sm">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {classes.map((classItem) => (
                  <div key={classItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                        <Badge variant={getStatusBadgeVariant(classItem.status)}>
                          {classItem.status === 'upcoming' ? 'قادم' :
                           classItem.status === 'ongoing' ? 'جاري' : 'مكتمل'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">مع {classItem.teacher}</p>
                      <p className="text-sm text-gray-500">{classItem.nextClass}</p>

                      {/* شريط التقدم */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${classItem.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {classItem.progress}% مكتمل
                      </div>
                    </div>
                    <Button size="sm" className="mr-3">
                      دخول الفصل
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* الدرجات الأخيرة */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">الدرجات الأخيرة</h3>
                <Button variant="secondary" size="sm">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                columns={gradesColumns}
                data={recentGrades}
                emptyMessage="لا توجد درجات مسجلة بعد"
              />
            </CardBody>
          </Card>
        </div>

        {/* الواجبات القادمة */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">الواجبات والمشاريع</h3>
          </CardHeader>
          <CardBody className="p-0">
            <Table
              columns={assignmentsColumns}
              data={assignments}
              emptyMessage="لا توجد واجبات حالياً"
            />
          </CardBody>
        </Card>

        {/* نصائح وتذكيرات */}
        <Card className="bg-blue-50 border-blue-200">
          <CardBody>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">نصائح للنجاح الأكاديمي</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• تأكد من إنجاز جميع الواجبات قبل موعد التسليم</li>
                  <li>• راجع دروسك يومياً للحفاظ على مستوى أكاديمي عالي</li>
                  <li>• تواصل مع معلميك في حالة مواجهة صعوبات دراسية</li>
                  <li>• حافظ على معدل حضور منتظم لتحقيق أفضل النتائج</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </StudentLayout>
  );
};