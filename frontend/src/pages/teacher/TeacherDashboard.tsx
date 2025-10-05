import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Table } from '../../components/ui';
import { TeacherLayout } from './TeacherLayout';

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  pendingTasks: number;
  unreadNotifications: number;
  weeklySchedule: {
    day: string;
    classes: number;
    students: number;
  }[];
}

interface Class {
  id: string;
  name: string;
  subject: string;
  students: number;
  nextClass: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface RecentActivity {
  id: string;
  type: 'attendance' | 'grade' | 'assignment' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
  className?: string;
}

export const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    todayAttendance: {
      present: 0,
      absent: 0,
      late: 0,
      total: 0
    },
    pendingTasks: 0,
    unreadNotifications: 0,
    weeklySchedule: []
  });

  const [classes, setClasses] = useState<Class[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بلوحة تحكم المدرس
      // const response = await api.get('/teacher/dashboard');

      // بيانات تجريبية مؤقتة
      setStats({
        totalClasses: 5,
        totalStudents: 127,
        todayAttendance: {
          present: 108,
          absent: 12,
          late: 7,
          total: 127
        },
        pendingTasks: 8,
        unreadNotifications: 3,
        weeklySchedule: [
          { day: 'السبت', classes: 3, students: 75 },
          { day: 'الأحد', classes: 2, students: 52 },
          { day: 'الاثنين', classes: 4, students: 98 },
          { day: 'الثلاثاء', classes: 3, students: 75 },
          { day: 'الأربعاء', classes: 2, students: 52 },
          { day: 'الخميس', classes: 0, students: 0 },
          { day: 'الجمعة', classes: 0, students: 0 }
        ]
      });

      setClasses([
        {
          id: '1',
          name: 'الرياضيات المستوى الأول',
          subject: 'الرياضيات',
          students: 25,
          nextClass: 'اليوم 08:00 - 10:00',
          status: 'upcoming'
        },
        {
          id: '2',
          name: 'اللغة العربية المستوى الثاني',
          subject: 'اللغة العربية',
          students: 28,
          nextClass: 'اليوم 10:00 - 12:00',
          status: 'ongoing'
        },
        {
          id: '3',
          name: 'العلوم المستوى الأول',
          subject: 'العلوم',
          students: 22,
          nextClass: 'غداً 08:00 - 10:00',
          status: 'upcoming'
        },
        {
          id: '4',
          name: 'الإنجليزية المستوى الثالث',
          subject: 'اللغة الإنجليزية',
          students: 30,
          nextClass: 'غداً 10:00 - 12:00',
          status: 'upcoming'
        }
      ]);

      setRecentActivities([
        {
          id: '1',
          type: 'attendance',
          title: 'تسجيل حضور',
          description: 'تم تسجيل حضور 25 طالب في الرياضيات',
          timestamp: 'منذ 10 دقائق',
          className: 'الرياضيات المستوى الأول'
        },
        {
          id: '2',
          type: 'grade',
          title: 'إدخال درجات',
          description: 'تم إدخال درجات اختبار الرياضيات للفصل الأول',
          timestamp: 'منذ ساعتين',
          className: 'الرياضيات المستوى الأول'
        },
        {
          id: '3',
          type: 'assignment',
          title: 'واجب منزلي جديد',
          description: 'تم نشر واجب منزلي في اللغة العربية',
          timestamp: 'أمس',
          className: 'اللغة العربية المستوى الثاني'
        },
        {
          id: '4',
          type: 'announcement',
          title: 'إعلان مهم',
          description: 'تذكير باجتماع المدرسين غداً',
          timestamp: 'أمس',
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'grade':
        return (
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'assignment':
        return (
          <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'announcement':
        return (
          <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.5-1.985 7.5-4.9M8 8a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <TeacherLayout title="لوحة التحكم">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title="لوحة التحكم"
      subtitle="نظرة عامة على فصولك وطلابك"
      actions={
        <div className="flex space-x-3">
          <Button variant="secondary" size="sm">
            تسجيل الحضور السريع
          </Button>
          <Button size="sm">
            إضافة مهمة جديدة
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
            subtitle="فصل تدرسه هذا الفصل"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />

          <StatCard
            title="إجمالي الطلاب"
            value={stats.totalStudents}
            subtitle="طالب في جميع فصولك"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
          />

          <StatCard
            title="معدل الحضور اليوم"
            value={`${Math.round((stats.todayAttendance.present / stats.todayAttendance.total) * 100)}%`}
            subtitle={`${stats.todayAttendance.present} من ${stats.todayAttendance.total} طالب`}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={{ value: 5.2, isPositive: true }}
          />

          <StatCard
            title="المهام المعلقة"
            value={stats.pendingTasks}
            subtitle="مهمة تحتاج إنجاز"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>

        {/* الفصول الحالية والجدول الزمني */}
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
                      <p className="text-sm text-gray-600 mb-2">{classItem.subject}</p>
                      <p className="text-sm text-gray-500">
                        {classItem.students} طالب • {classItem.nextClass}
                      </p>
                    </div>
                    <Button size="sm" className="mr-3">
                      دخول الفصل
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* الجدول الزمني الأسبوعي */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">الجدول الزمني الأسبوعي</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {stats.weeklySchedule.map((day) => (
                  <div key={day.day} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        day.classes > 0 ? 'bg-primary-600' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{day.day}</span>
                    </div>
                    <div className="text-left">
                      {day.classes > 0 ? (
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{day.classes}</span>
                          <span className="text-gray-500 mr-2">فصل</span>
                          <span className="font-medium text-gray-900">{day.students}</span>
                          <span className="text-gray-500">طالب</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">لا توجد حصص</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* تفاصيل الحضور اليوم والأنشطة الأخيرة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* تفاصيل الحضور اليوم */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">تفاصيل الحضور اليوم</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">حاضر</span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(stats.todayAttendance.present / stats.todayAttendance.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.todayAttendance.present}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">غائب</span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(stats.todayAttendance.absent / stats.todayAttendance.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.todayAttendance.absent}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">متأخر</span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${(stats.todayAttendance.late / stats.todayAttendance.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.todayAttendance.late}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">معدل الحضور العام</span>
                  <span className="text-lg font-bold text-green-600">
                    {Math.round((stats.todayAttendance.present / stats.todayAttendance.total) * 100)}%
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* الأنشطة الأخيرة */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">الأنشطة الأخيرة</h3>
                <Button variant="secondary" size="sm">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-4 hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      {activity.className && (
                        <p className="text-xs text-primary-600 mt-1">
                          {activity.className}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* المهام السريعة */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">المهام السريعة</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="secondary" className="h-20 flex-col">
                <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                تسجيل الحضور
              </Button>

              <Button variant="secondary" className="h-20 flex-col">
                <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                إدخال درجات
              </Button>

              <Button variant="secondary" className="h-20 flex-col">
                <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة واجب
              </Button>

              <Button variant="secondary" className="h-20 flex-col">
                <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                إرسال إعلان
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </TeacherLayout>
  );
};