import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, Table } from '../../components/ui';
import { AdminLayout } from './AdminLayout';

interface ReportData {
  attendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
  financial: {
    totalRevenue: number;
    totalPending: number;
    totalRefunded: number;
    totalTransactions: number;
    averagePayment: number;
  };
  classes: {
    totalClasses: number;
    activeClasses: number;
    totalCapacity: number;
    totalEnrolled: number;
    averageOccupancy: number;
  };
  teachers: {
    totalTeachers: number;
    averageAttendanceRate: number;
  };
}

interface ActivityLog {
  id: string;
  actorName: string;
  action: string;
  category: string;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
  details?: string;
}

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    attendance: {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendanceRate: 0
    },
    financial: {
      totalRevenue: 0,
      totalPending: 0,
      totalRefunded: 0,
      totalTransactions: 0,
      averagePayment: 0
    },
    classes: {
      totalClasses: 0,
      activeClasses: 0,
      totalCapacity: 0,
      totalEnrolled: 0,
      averageOccupancy: 0
    },
    teachers: {
      totalTeachers: 0,
      averageAttendanceRate: 0
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchReportData();
    fetchActivityLogs();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بالتقارير
      // const response = await api.get('/admin/reports', {
      //   params: dateRange
      // });

      // بيانات تجريبية مؤقتة
      setReportData({
        attendance: {
          total: 2450,
          present: 2100,
          absent: 250,
          late: 80,
          excused: 20,
          attendanceRate: 85.7
        },
        financial: {
          totalRevenue: 125000,
          totalPending: 8500,
          totalRefunded: 1200,
          totalTransactions: 450,
          averagePayment: 278
        },
        classes: {
          totalClasses: 32,
          activeClasses: 28,
          totalCapacity: 960,
          totalEnrolled: 756,
          averageOccupancy: 78.8
        },
        teachers: {
          totalTeachers: 18,
          averageAttendanceRate: 92.5
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بسجل العمليات
      // const response = await api.get('/admin/activity-logs');

      // بيانات تجريبية مؤقتة
      setActivityLogs([
        {
          id: '1',
          actorName: 'أحمد محمد',
          action: 'تسجيل دخول للنظام',
          category: 'authentication',
          status: 'success',
          timestamp: '2024-01-20 10:30:00',
          details: 'تسجيل دخول ناجح من عنوان IP: 192.168.1.100'
        },
        {
          id: '2',
          actorName: 'فاطمة حسن',
          action: 'إضافة طالب جديد',
          category: 'data',
          status: 'success',
          timestamp: '2024-01-20 09:15:00',
          details: 'تم إضافة الطالب محمد أحمد إلى الفصل 1A'
        },
        {
          id: '3',
          actorName: 'محمد علي',
          action: 'تسجيل حضور',
          category: 'business',
          status: 'success',
          timestamp: '2024-01-20 08:45:00',
          details: 'تم تسجيل حضور 25 طالب في الفصل الرياضيات'
        },
        {
          id: '4',
          actorName: 'سارة أحمد',
          action: 'دفع رسوم متأخرة',
          category: 'business',
          status: 'warning',
          timestamp: '2024-01-19 16:20:00',
          details: 'تنبيه: دفع رسوم متأخرة للطالب علي حسن'
        },
        {
          id: '5',
          actorName: 'النظام',
          action: 'نسخ احتياطي تلقائي',
          category: 'system',
          status: 'success',
          timestamp: '2024-01-19 02:00:00',
          details: 'تم إنشاء نسخة احتياطية تلقائية بنجاح'
        }
      ]);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
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

  const exportReport = (type: string) => {
    // هنا سيتم تصدير التقرير
    console.log(`تصدير تقرير ${type}`);
    // يمكن إضافة منطق تصدير PDF أو Excel هنا
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      default: return 'secondary';
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'authentication': return 'primary';
      case 'data': return 'success';
      case 'business': return 'warning';
      case 'system': return 'secondary';
      case 'security': return 'danger';
      default: return 'secondary';
    }
  };

  const activityColumns = [
    {
      key: 'actorName',
      title: 'المستخدم',
      render: (value: string, record: ActivityLog) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary-600">
              {value.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <Badge variant={getCategoryBadgeVariant(record.category)} size="sm">
              {record.category}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      title: 'الإجراء'
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {value === 'success' ? 'نجح' :
           value === 'warning' ? 'تحذير' : 'خطأ'}
        </Badge>
      )
    },
    {
      key: 'timestamp',
      title: 'التاريخ والوقت'
    },
    {
      key: 'details',
      title: 'التفاصيل',
      render: (value: string) => (
        <div className="max-w-xs truncate text-sm text-gray-600" title={value}>
          {value}
        </div>
      )
    }
  ];

  return (
    <AdminLayout
      title="التقارير والإحصائيات"
      subtitle="تحليل أداء المركز والتقارير المفصلة"
      actions={
        <div className="flex space-x-3">
          <Button variant="secondary" size="sm" onClick={() => exportReport('pdf')}>
            تصدير PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportReport('excel')}>
            تصدير Excel
          </Button>
          <Button size="sm">
            تحديث البيانات
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* فلاتر التاريخ */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="تاريخ البداية"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />

              <Input
                label="تاريخ النهاية"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />

              <div className="form-group">
                <label className="form-label">نوع التقرير</label>
                <select
                  className="form-input"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="overview">نظرة عامة</option>
                  <option value="attendance">الحضور والغياب</option>
                  <option value="financial">التقارير المالية</option>
                  <option value="performance">الأداء الأكاديمي</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDateRange({ startDate: '', endDate: '' });
                    setReportType('overview');
                  }}
                >
                  إعادة تعيين
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* إحصائيات الحضور */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="معدل الحضور العام"
            value={`${reportData.attendance.attendanceRate}%`}
            subtitle={`${reportData.attendance.present} من ${reportData.attendance.total} طالب`}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={{ value: 5.2, isPositive: true }}
          />

          <StatCard
            title="إجمالي الإيرادات"
            value={`${reportData.financial.totalRevenue.toLocaleString()} جنيه`}
            subtitle={`${reportData.financial.totalTransactions} معاملة`}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            trend={{ value: 12.5, isPositive: true }}
          />

          <StatCard
            title="معدل إشغال الفصول"
            value={`${reportData.classes.averageOccupancy}%`}
            subtitle={`${reportData.classes.totalEnrolled} من ${reportData.classes.totalCapacity} طالب`}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            trend={{ value: 3.1, isPositive: true }}
          />

          <StatCard
            title="أداء المدرسين"
            value={`${reportData.teachers.averageAttendanceRate}%`}
            subtitle={`${reportData.teachers.totalTeachers} مدرس`}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            trend={{ value: 2.3, isPositive: true }}
          />
        </div>

        {/* تفاصيل إضافية حسب نوع التقرير */}
        {reportType === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* تفاصيل الحضور */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">تفاصيل الحضور</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">حاضر</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(reportData.attendance.present / reportData.attendance.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {reportData.attendance.present}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">غائب</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${(reportData.attendance.absent / reportData.attendance.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {reportData.attendance.absent}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">متأخر</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${(reportData.attendance.late / reportData.attendance.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {reportData.attendance.late}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">معذور</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(reportData.attendance.excused / reportData.attendance.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {reportData.attendance.excused}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* التقرير المالي */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">التقرير المالي</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">إجمالي الإيرادات</span>
                    <span className="text-lg font-semibold text-green-600">
                      {reportData.financial.totalRevenue.toLocaleString()} جنيه
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">المدفوعات المعلقة</span>
                    <span className="text-lg font-semibold text-red-600">
                      {reportData.financial.totalPending.toLocaleString()} جنيه
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">المبالغ المستردة</span>
                    <span className="text-lg font-semibold text-orange-600">
                      {reportData.financial.totalRefunded.toLocaleString()} جنيه
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">متوسط الدفعة</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {reportData.financial.averagePayment} جنيه
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">صافي الإيرادات</span>
                      <span className="text-xl font-bold text-green-600">
                        {(reportData.financial.totalRevenue - reportData.financial.totalRefunded).toLocaleString()} جنيه
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* سجل العمليات */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">سجل العمليات الأخيرة</h3>
              <Button variant="secondary" size="sm">
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table
              columns={activityColumns}
              data={activityLogs}
              loading={loading}
              emptyMessage="لا توجد عمليات مسجلة"
            />
          </CardBody>
        </Card>

        {/* رسوم بيانية (سيتم إضافتها لاحقاً) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">اتجاهات الحضور</h3>
            </CardHeader>
            <CardBody>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>رسم بياني لاتجاهات الحضور</p>
                  <p className="text-sm">سيتم إضافته قريباً</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">الإيرادات الشهرية</h3>
            </CardHeader>
            <CardBody>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <p>رسم بياني للإيرادات الشهرية</p>
                  <p className="text-sm">سيتم إضافته قريباً</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};