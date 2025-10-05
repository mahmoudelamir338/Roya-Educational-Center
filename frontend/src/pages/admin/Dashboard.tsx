import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Badge, Button } from '../../components/ui';
import { AdminLayout } from './AdminLayout';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalGuardians: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  monthlyRevenue: number;
  pendingPayments: number;
  unreadNotifications: number;
}

interface RecentActivity {
  id: string;
  type: 'attendance' | 'payment' | 'user' | 'class';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalGuardians: 0,
    todayAttendance: {
      present: 0,
      absent: 0,
      late: 0,
      total: 0
    },
    monthlyRevenue: 0,
    pendingPayments: 0,
    unreadNotifications: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب البيانات من API
    const fetchDashboardData = async () => {
      try {
        // هنا سيتم استدعاء API الخاص بالإحصائيات
        // const response = await api.get('/admin/dashboard');

        // بيانات تجريبية مؤقتة
        setStats({
          totalStudents: 245,
          totalTeachers: 18,
          totalClasses: 32,
          totalGuardians: 189,
          todayAttendance: {
            present: 198,
            absent: 32,
            late: 15,
            total: 245
          },
          monthlyRevenue: 125000,
          pendingPayments: 8500,
          unreadNotifications: 5
        });

        setRecentActivities([
          {
            id: '1',
            type: 'attendance',
            title: 'تسجيل حضور جديد',
            description: 'تم تسجيل حضور الطالب أحمد محمد في الفصل 1A',
            timestamp: 'منذ 5 دقائق',
            status: 'success'
          },
          {
            id: '2',
            type: 'payment',
            title: 'دفع رسوم جديدة',
            description: 'تم دفع رسوم شهر نوفمبر للطالب فاطمة علي',
            timestamp: 'منذ 15 دقيقة',
            status: 'success'
          },
          {
            id: '3',
            type: 'user',
            title: 'إضافة مدرس جديد',
            description: 'تم إضافة المدرس محمد حسن إلى النظام',
            timestamp: 'منذ ساعة',
            status: 'success'
          },
          {
            id: '4',
            type: 'class',
            title: 'إنشاء فصل جديد',
            description: 'تم إنشاء فصل الرياضيات المستوى الثاني',
            timestamp: 'منذ ساعتين',
            status: 'success'
          },
          {
            id: '5',
            type: 'payment',
            title: 'مدفوعات متأخرة',
            description: 'يوجد 3 مدفوعات متأخرة تحتاج متابعة',
            timestamp: 'منذ 3 ساعات',
            status: 'warning'
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    className?: string;
  }> = ({ title, value, icon, trend, className = '' }) => (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
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

  const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case 'attendance':
          return (
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        case 'payment':
          return (
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          );
        case 'user':
          return (
            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          );
        case 'class':
          return (
            <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          );
        default:
          return null;
      }
    };

    const getStatusBadge = () => {
      if (!activity.status) return null;

      switch (activity.status) {
        case 'success':
          return <Badge variant="success" size="sm">نجح</Badge>;
        case 'warning':
          return <Badge variant="warning" size="sm">تحذير</Badge>;
        case 'error':
          return <Badge variant="danger" size="sm">خطأ</Badge>;
        default:
          return null;
      }
    };

    return (
      <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            {getActivityIcon()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.title}
            </p>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {activity.description}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {activity.timestamp}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="لوحة التحكم">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="لوحة التحكم"
      subtitle="نظرة عامة على أداء المركز"
      actions={
        <div className="flex space-x-3">
          <Button variant="secondary" size="sm">
            تصدير التقرير
          </Button>
          <Button size="sm">
            عرض التفاصيل
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي الطلاب"
            value={stats.totalStudents}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            trend={{ value: 12, isPositive: true }}
          />

          <StatCard
            title="إجمالي المدرسين"
            value={stats.totalTeachers}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            trend={{ value: 5, isPositive: true }}
          />

          <StatCard
            title="معدل الحضور اليوم"
            value={`${Math.round((stats.todayAttendance.present / stats.todayAttendance.total) * 100)}%`}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={{ value: 3, isPositive: true }}
          />

          <StatCard
            title="الإيرادات الشهرية"
            value={`${stats.monthlyRevenue.toLocaleString()} جنيه`}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            trend={{ value: 18, isPositive: true }}
          />
        </div>

        {/* قسم التفاصيل */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="w-16 h-2 bg-gray-200 rounded-full mr-3">
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
                    <div className="w-16 h-2 bg-gray-200 rounded-full mr-3">
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
                    <div className="w-16 h-2 bg-gray-200 rounded-full mr-3">
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
            </CardBody>
          </Card>

          {/* المدفوعات المعلقة */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">المدفوعات المعلقة</h3>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {stats.pendingPayments.toLocaleString()} جنيه
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  إجمالي المدفوعات المتأخرة
                </p>
                <Button variant="danger" size="sm" fullWidth>
                  متابعة المدفوعات
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* الإشعارات الجديدة */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">الإشعارات الجديدة</h3>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.unreadNotifications}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  إشعار غير مقروء
                </p>
                <Button variant="primary" size="sm" fullWidth>
                  عرض الإشعارات
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

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
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
};