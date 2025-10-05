import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Table, Modal, Input } from '../../components/ui';
import { GuardianLayout } from './GuardianLayout';

interface AttendanceRecord {
  id: string;
  childId: string;
  childName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  checkOutTime?: string;
  subject?: string;
  teacher?: string;
  notes?: string;
  justification?: string;
}

interface AttendanceSummary {
  childId: string;
  childName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
  currentMonth: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

export const GuardianAttendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState<AttendanceSummary[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const mockAttendanceRecords: AttendanceRecord[] = [
        {
          id: '1',
          childId: '1',
          childName: 'أحمد محمد علي',
          date: '2024-01-15',
          status: 'present',
          checkInTime: '07:45',
          checkOutTime: '14:00',
          subject: 'الرياضيات',
          teacher: 'أحمد محمد',
          notes: 'حضور منتظم ومشاركة فعالة'
        },
        {
          id: '2',
          childId: '1',
          childName: 'أحمد محمد علي',
          date: '2024-01-14',
          status: 'late',
          checkInTime: '08:15',
          checkOutTime: '14:00',
          subject: 'اللغة العربية',
          teacher: 'فاطمة حسن',
          notes: 'تأخير بسبب الازدحام المروري'
        },
        {
          id: '3',
          childId: '2',
          childName: 'فاطمة أحمد علي',
          date: '2024-01-15',
          status: 'present',
          checkInTime: '07:50',
          checkOutTime: '14:00',
          subject: 'العلوم',
          teacher: 'محمد علي'
        }
      ];

      setAttendanceRecords(mockAttendanceRecords);

      const summaries: AttendanceSummary[] = [
        {
          childId: '1',
          childName: 'أحمد محمد علي',
          totalDays: 45,
          presentDays: 38,
          absentDays: 3,
          lateDays: 4,
          excusedDays: 2,
          attendanceRate: 94.2,
          currentMonth: {
            present: 18,
            absent: 1,
            late: 2,
            total: 21
          }
        },
        {
          childId: '2',
          childName: 'فاطمة أحمد علي',
          totalDays: 45,
          presentDays: 42,
          absentDays: 1,
          lateDays: 2,
          excusedDays: 1,
          attendanceRate: 98.1,
          currentMonth: {
            present: 20,
            absent: 0,
            late: 1,
            total: 21
          }
        }
      ];

      setAttendanceSummaries(summaries);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      case 'excused': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'حاضر';
      case 'absent': return 'غائب';
      case 'late': return 'متأخر';
      case 'excused': return 'معذور';
      default: return 'غير محدد';
    }
  };

  if (loading) {
    return (
      <GuardianLayout title="الحضور والانضباط">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل بيانات الحضور...</p>
          </div>
        </div>
      </GuardianLayout>
    );
  }

  return (
    <GuardianLayout
      title="الحضور والانضباط"
      subtitle="متابعة حضور أبنائك والسجلات الانضباطية"
    >
      <div className="space-y-6">
        {/* اختيار الابن/الابنة */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <Button
                variant={!selectedChild ? 'primary' : 'secondary'}
                onClick={() => setSelectedChild('')}
              >
                جميع الأبناء
              </Button>
              {attendanceSummaries.map((child) => (
                <Button
                  key={child.childId}
                  variant={selectedChild === child.childId ? 'primary' : 'secondary'}
                  onClick={() => setSelectedChild(child.childId)}
                >
                  {child.childName}
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* إحصائيات الحضور */}
        {selectedChild && (
          <>
            {attendanceSummaries
              .filter(summary => summary.childId === selectedChild)
              .map((summary) => (
              <div key={summary.childId} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center">
                  <CardBody className="p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {summary.attendanceRate}%
                    </div>
                    <div className="text-sm text-gray-600">معدل الحضور العام</div>
                  </CardBody>
                </Card>

                <Card className="text-center">
                  <CardBody className="p-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {summary.presentDays}/{summary.totalDays}
                    </div>
                    <div className="text-sm text-gray-600">أيام الحضور</div>
                  </CardBody>
                </Card>

                <Card className="text-center">
                  <CardBody className="p-6">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {summary.absentDays}
                    </div>
                    <div className="text-sm text-gray-600">أيام الغياب</div>
                  </CardBody>
                </Card>

                <Card className="text-center">
                  <CardBody className="p-6">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {summary.lateDays}
                    </div>
                    <div className="text-sm text-gray-600">أيام التأخير</div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </>
        )}

        {/* سجل الحضور */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">سجل الحضور التفصيلي</h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الابن/الابنة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">حالة الحضور</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحصة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords
                    .filter(record => !selectedChild || record.childId === selectedChild)
                    .map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-primary-600">
                              {record.childName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{record.childName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(record.status)}>
                          {getStatusText(record.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.subject || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button size="sm" variant="secondary">تفاصيل</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </GuardianLayout>
  );
};