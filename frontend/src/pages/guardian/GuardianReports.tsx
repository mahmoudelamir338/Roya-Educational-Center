import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge } from '../../components/ui';
import { GuardianLayout } from './GuardianLayout';

interface Report {
  id: string;
  title: string;
  type: 'academic' | 'attendance' | 'behavior' | 'health' | 'financial';
  description: string;
  date: string;
  status: 'ready' | 'processing' | 'scheduled';
  downloadUrl?: string;
  childName: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedChild?: string;
}

export const GuardianReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'التقرير الأكاديمي الشهري',
          type: 'academic',
          description: 'تقرير شامل عن الأداء الأكاديمي لشهر يناير 2024',
          date: '2024-01-31',
          status: 'ready',
          downloadUrl: '/reports/academic-jan-2024.pdf',
          childName: 'أحمد محمد علي'
        },
        {
          id: '2',
          title: 'تقرير الحضور الشهري',
          type: 'attendance',
          description: 'إحصائيات الحضور والغياب لشهر يناير 2024',
          date: '2024-01-31',
          status: 'ready',
          downloadUrl: '/reports/attendance-jan-2024.pdf',
          childName: 'أحمد محمد علي'
        },
        {
          id: '3',
          title: 'التقرير السلوكي الفصلي',
          type: 'behavior',
          description: 'تقييم السلوك والانضباط للفصل الدراسي الأول',
          date: '2024-02-15',
          status: 'scheduled',
          childName: 'أحمد محمد علي'
        }
      ];

      setReports(mockReports);

      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'تحديث درجات جديد',
          message: 'تم تحديث درجات اختبار الرياضيات لأحمد',
          type: 'info',
          date: '2024-01-15T10:30:00',
          read: false,
          priority: 'medium',
          relatedChild: 'أحمد محمد علي'
        },
        {
          id: '2',
          title: 'تنبيه حضور',
          message: 'أحمد تغيب عن حصة اللغة العربية اليوم',
          type: 'warning',
          date: '2024-01-14T09:15:00',
          read: false,
          priority: 'high',
          relatedChild: 'أحمد محمد علي'
        },
        {
          id: '3',
          title: 'اجتماع أولياء الأمور',
          message: 'سيتم عقد اجتماع أولياء الأمور يوم السبت المقبل',
          type: 'info',
          date: '2024-01-13T16:00:00',
          read: true,
          priority: 'medium'
        }
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setLoading(false);
    }
  };

  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'academic': return 'أكاديمي';
      case 'attendance': return 'حضور';
      case 'behavior': return 'سلوكي';
      case 'health': return 'صحي';
      case 'financial': return 'مالي';
      default: return 'غير محدد';
    }
  };

  const getReportTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'academic': return 'primary';
      case 'attendance': return 'success';
      case 'behavior': return 'warning';
      case 'health': return 'danger';
      case 'financial': return 'secondary';
      default: return 'secondary';
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'info': return 'primary';
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'error': return 'danger';
      default: return 'secondary';
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <GuardianLayout title="التقارير والإشعارات">
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
      title="التقارير والإشعارات"
      subtitle="جميع التقارير والإشعارات المهمة في مكان واحد"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* التقارير المتاحة */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">التقارير المتاحة</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={getReportTypeBadgeVariant(report.type)}>
                      {getReportTypeText(report.type)}
                    </Badge>
                    <Badge variant={report.status === 'ready' ? 'success' : 'warning'}>
                      {report.status === 'ready' ? 'جاهز' : 'قيد المعالجة'}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{report.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <p className="text-xs text-gray-500 mb-3">{report.childName}</p>
                  {report.status === 'ready' && report.downloadUrl ? (
                    <Button size="sm" className="w-full">
                      تحميل التقرير
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="w-full" disabled>
                      قيد المعالجة
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* الإشعارات */}
        <div className="lg:col-span-2 space-y-6">
          {/* إحصائيات الإشعارات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">{notifications.length}</div>
                <div className="text-sm text-gray-600">إجمالي الإشعارات</div>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">{unreadNotificationsCount}</div>
                <div className="text-sm text-gray-600">غير مقروءة</div>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {notifications.filter(n => n.priority === 'high').length}
                </div>
                <div className="text-sm text-gray-600">عاجلة</div>
              </CardBody>
            </Card>
          </div>

          {/* قائمة الإشعارات */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">الإشعارات الأخيرة</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          notification.type === 'success' ? 'bg-green-100 text-green-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {notification.type === 'info' ? 'ℹ' :
                           notification.type === 'warning' ? '⚠' :
                           notification.type === 'success' ? '✓' : '✕'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <Badge variant={getNotificationBadgeVariant(notification.type)}>
                              {notification.type}
                            </Badge>
                            {notification.priority === 'high' && (
                              <Badge variant="danger"}>عاجل</Badge>
                            )}
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          {notification.relatedChild && (
                            <p className="text-xs text-gray-500 mb-1">الطالب: {notification.relatedChild}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(notification.date).toLocaleDateString('ar-EG')} - {new Date(notification.date).toLocaleTimeString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* إشعارات مهمة */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardBody>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">إشعارات تحتاج متابعة</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• لديك {unreadNotificationsCount} إشعارات غير مقروءة</li>
                    <li>• يرجى مراجعة التقارير الجاهزة للتحميل</li>
                    <li>• تأكد من متابعة الإشعارات العاجلة فوراً</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </GuardianLayout>
  );
};