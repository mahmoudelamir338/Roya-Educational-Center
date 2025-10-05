import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Table } from '../../components/ui';
import { GuardianLayout } from './GuardianLayout';

interface Child {
  id: string;
  name: string;
  grade: string;
  className: string;
  avatar?: string;
  status: 'online' | 'offline';
}

interface ChildStats {
  childId: string;
  childName: string;
  overallAverage: number;
  attendanceRate: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  recentGrades: {
    subject: string;
    grade: string;
    score: number;
    maxScore: number;
    date: string;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    type: 'exam' | 'assignment' | 'meeting' | 'activity';
    date: string;
    description: string;
  }[];
}

interface Notification {
  id: string;
  type: 'grade' | 'attendance' | 'assignment' | 'message' | 'announcement';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedChild?: string;
}

export const GuardianDashboard: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenStats, setChildrenStats] = useState<ChildStats[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بلوحة تحكم ولي الأمر
      // const response = await api.get('/guardian/dashboard');

      // بيانات تجريبية مؤقتة
      setChildren([
        {
          id: '1',
          name: 'أحمد محمد علي',
          grade: 'الصف السادس الابتدائي',
          className: 'الفصل 6/أ',
          status: 'online'
        },
        {
          id: '2',
          name: 'فاطمة أحمد علي',
          grade: 'الصف الثالث الابتدائي',
          className: 'الفصل 3/ب',
          status: 'offline'
        }
      ]);

      setChildrenStats([
        {
          childId: '1',
          childName: 'أحمد محمد علي',
          overallAverage: 87.5,
          attendanceRate: 94.2,
          assignmentsCompleted: 15,
          totalAssignments: 18,
          recentGrades: [
            {
              subject: 'الرياضيات',
              grade: 'جيد جداً',
              score: 85,
              maxScore: 100,
              date: '2024-01-15'
            },
            {
              subject: 'اللغة العربية',
              grade: 'ممتاز',
              score: 92,
              maxScore: 100,
              date: '2024-01-14'
            },
            {
              subject: 'العلوم',
              grade: 'جيد جداً',
              score: 88,
              maxScore: 100,
              date: '2024-01-12'
            }
          ],
          upcomingEvents: [
            {
              id: '1',
              title: 'اختبار الرياضيات الشهري',
              type: 'exam',
              date: '2024-01-25',
              description: 'اختبار شامل في الرياضيات'
            },
            {
              id: '2',
              title: 'مشروع البيئة',
              type: 'assignment',
              date: '2024-01-28',
              description: 'مشروع بحثي عن البيئة والتلوث'
            }
          ]
        },
        {
          childId: '2',
          childName: 'فاطمة أحمد علي',
          overallAverage: 91.2,
          attendanceRate: 98.1,
          assignmentsCompleted: 12,
          totalAssignments: 14,
          recentGrades: [
            {
              subject: 'اللغة العربية',
              grade: 'ممتاز',
              score: 95,
              maxScore: 100,
              date: '2024-01-15'
            },
            {
              subject: 'الرياضيات',
              grade: 'ممتاز',
              score: 93,
              maxScore: 100,
              date: '2024-01-13'
            }
          ],
          upcomingEvents: [
            {
              id: '3',
              title: 'زيارة المزرعة التعليمية',
              type: 'activity',
              date: '2024-01-26',
              description: 'رحلة تعليمية للتعرف على الحيوانات والنباتات'
            }
          ]
        }
      ]);

      setNotifications([
        {
          id: '1',
          type: 'grade',
          title: 'درجة جديدة في الرياضيات',
          message: 'تم تسجيل درجة جديدة لأحمد في اختبار المعادلات الخطية',
          date: '2024-01-15T10:30:00',
          read: false,
          priority: 'medium',
          relatedChild: 'أحمد محمد علي'
        },
        {
          id: '2',
          type: 'assignment',
          title: 'واجب جديد في العلوم',
          message: 'تم إضافة واجب جديد في مادة العلوم لفاطمة',
          date: '2024-01-14T14:20:00',
          read: false,
          priority: 'high',
          relatedChild: 'فاطمة أحمد علي'
        },
        {
          id: '3',
          type: 'attendance',
          title: 'تنبيه حضور',
          message: 'أحمد تغيب عن حصة الرياضيات اليوم',
          date: '2024-01-14T09:15:00',
          read: true,
          priority: 'medium',
          relatedChild: 'أحمد محمد علي'
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
    childName?: string;
  }> = ({ title, value, subtitle, icon, trend, className = '', childName }) => (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {childName && (
              <p className="text-xs text-gray-500 mb-1">{childName}</p>
            )}
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'grade':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'attendance':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'assignment':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'message':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'grade': return 'success';
      case 'attendance': return 'warning';
      case 'assignment': return 'primary';
      case 'message': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'exam': return 'اختبار';
      case 'assignment': return 'واجب';
      case 'meeting': return 'اجتماع';
      case 'activity': return 'نشاط';
      default: return 'حدث';
    }
  };

  const getEventTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'exam': return 'danger';
      case 'assignment': return 'warning';
      case 'meeting': return 'primary';
      case 'activity': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <GuardianLayout title="لوحة التحكم">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </GuardianLayout>
    );
  }

  return (
    <GuardianLayout
      title="لوحة التحكم"
      subtitle="متابعة أداء أبنائك ونشاطاتهم المدرسية"
      actions={
        <div className="flex space-x-3">
          <Button variant="secondary" size="sm">
            تقرير شامل
          </Button>
          <Button size="sm">
            تواصل مع المدرسين
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* بطاقات الأبناء */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <Card
              key={child.id}
              className={`cursor-pointer transition-all ${
                selectedChild === child.id ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedChild(child.id)}
            >
              <CardBody className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {child.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                      child.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-600">{child.grade}</p>
                    <p className="text-sm text-gray-500">{child.className}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={child.status === 'online' ? 'success' : 'secondary'}>
                      {child.status === 'online' ? 'متصل' : 'غير متصل'}
                    </Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* إحصائيات الأبناء المختارين */}
        {selectedChild && (
          <>
            {childrenStats
              .filter(stats => stats.childId === selectedChild)
              .map((stats) => (
              <div key={stats.childId}>
                {/* إحصائيات عامة */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="المعدل العام"
                    value={`${stats.overallAverage}%`}
                    subtitle="متوسط الدرجات"
                    childName={stats.childName}
                    icon={
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    }
                    trend={{ value: 3.2, isPositive: true }}
                  />

                  <StatCard
                    title="معدل الحضور"
                    value={`${stats.attendanceRate}%`}
                    subtitle="هذا الشهر"
                    childName={stats.childName}
                    icon={
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    trend={{ value: 1.5, isPositive: true }}
                  />

                  <StatCard
                    title="الواجبات المكتملة"
                    value={`${stats.assignmentsCompleted}/${stats.totalAssignments}`}
                    subtitle="نسبة الإنجاز"
                    childName={stats.childName}
                    icon={
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                  />

                  <StatCard
                    title="الأحداث القادمة"
                    value={stats.upcomingEvents.length}
                    subtitle="تحتاج متابعة"
                    childName={stats.childName}
                    icon={
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                </div>

                {/* الدرجات الأخيرة والأحداث القادمة */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* الدرجات الأخيرة */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">الدرجات الأخيرة</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {stats.recentGrades.map((grade, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{grade.subject}</div>
                              <div className="text-sm text-gray-600">{grade.date}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary-600">
                                {grade.score}/{grade.maxScore}
                              </div>
                              <Badge variant="primary" size="sm">
                                {grade.grade}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="secondary" size="sm" className="w-full mt-4">
                        عرض جميع الدرجات
                      </Button>
                    </CardBody>
                  </Card>

                  {/* الأحداث القادمة */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">الأحداث القادمة</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {stats.upcomingEvents.map((event) => (
                          <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                event.type === 'exam' ? 'bg-red-100 text-red-600' :
                                event.type === 'assignment' ? 'bg-yellow-100 text-yellow-600' :
                                event.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {event.type === 'exam' ? (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                ) : event.type === 'assignment' ? (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-900">{event.title}</h4>
                                <Badge variant={getEventTypeBadgeVariant(event.type)}>
                                  {getEventTypeText(event.type)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(event.date).toLocaleDateString('ar-EG')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="secondary" size="sm" className="w-full mt-4">
                        عرض التقويم الكامل
                      </Button>
                    </CardBody>
                  </Card>
                </div>
              </div>
            ))}
          </>
        )}

        {/* الإشعارات الأخيرة */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">الإشعارات الأخيرة</h3>
              <Button variant="secondary" size="sm">
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    notification.type === 'grade' ? 'bg-green-100 text-green-600' :
                    notification.type === 'attendance' ? 'bg-yellow-100 text-yellow-600' :
                    notification.type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <div className="flex items-center space-x-2">
                        {notification.relatedChild && (
                          <span className="text-sm text-gray-500">{notification.relatedChild}</span>
                        )}
                        <Badge variant={getNotificationBadgeVariant(notification.type)}>
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.date).toLocaleDateString('ar-EG')} - {new Date(notification.date).toLocaleTimeString('ar-EG')}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* نصائح للآباء */}
        <Card className="bg-green-50 border-green-200">
          <CardBody>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">نصائح لمتابعة أداء أبنائك</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• تواصل بانتظام مع معلمي أبنائك لمتابعة تقدمهم الدراسي</li>
                  <li>• شجع أبنائك على المشاركة في الأنشطة المدرسية والواجبات المنزلية</li>
                  <li>• راقب معدلات الحضور وتأكد من التزام أبنائك بالدوام المدرسي</li>
                  <li>• ساعد أبنائك في تنظيم وقتهم وإدارة واجباتهم الدراسية</li>
                  <li>• احتفل بالإنجازات والتحسن في الأداء الأكاديمي</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </GuardianLayout>
  );
};