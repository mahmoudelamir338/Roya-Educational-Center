import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, Modal, Table } from '../../components/ui';
import { TeacherLayout } from './TeacherLayout';

interface Class {
  id: string;
  name: string;
  subject: string;
  students: Student[];
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
}

interface Student {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  checkInTime?: string;
}

interface AttendanceRecord {
  id: string;
  classId: string;
  className: string;
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  status: 'completed' | 'in-progress' | 'not-started';
}

export const AttendanceManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchAttendanceRecords();
  }, [selectedDate]);

  const fetchClasses = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بالفصول
      // const response = await api.get('/teacher/classes');

      // بيانات تجريبية مؤقتة
      setClasses([
        {
          id: '1',
          name: 'الرياضيات المستوى الأول',
          subject: 'الرياضيات',
          schedule: { day: 'الأحد', startTime: '08:00', endTime: '10:00' },
          students: [
            { id: '1', name: 'أحمد محمد', status: 'present', checkInTime: '08:05' },
            { id: '2', name: 'فاطمة علي', status: 'late', checkInTime: '08:15' },
            { id: '3', name: 'محمد حسن', status: 'absent' },
            { id: '4', name: 'نور أحمد', status: 'present', checkInTime: '08:00' },
            { id: '5', name: 'علي محمود', status: 'excused', notes: 'مرض' }
          ]
        },
        {
          id: '2',
          name: 'اللغة العربية المستوى الثاني',
          subject: 'اللغة العربية',
          schedule: { day: 'الأحد', startTime: '10:00', endTime: '12:00' },
          students: [
            { id: '6', name: 'سارة محمد', status: 'present', checkInTime: '10:05' },
            { id: '7', name: 'يوسف علي', status: 'present', checkInTime: '10:00' },
            { id: '8', name: 'لينا حسن', status: 'late', checkInTime: '10:20' },
            { id: '9', name: 'عمر أحمد', status: 'absent' },
            { id: '10', name: 'جودي محمود', status: 'present', checkInTime: '10:02' }
          ]
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بسجلات الحضور
      // const response = await api.get('/teacher/attendance-records', {
      //   params: { date: selectedDate }
      // });

      // بيانات تجريبية مؤقتة
      setAttendanceRecords([
        {
          id: '1',
          classId: '1',
          className: 'الرياضيات المستوى الأول',
          date: selectedDate,
          totalStudents: 25,
          present: 20,
          absent: 3,
          late: 2,
          excused: 0,
          status: 'completed'
        },
        {
          id: '2',
          classId: '2',
          className: 'اللغة العربية المستوى الثاني',
          date: selectedDate,
          totalStudents: 28,
          present: 25,
          absent: 1,
          late: 2,
          excused: 0,
          status: 'completed'
        },
        {
          id: '3',
          classId: '3',
          className: 'العلوم المستوى الأول',
          date: selectedDate,
          totalStudents: 22,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          status: 'not-started'
        }
      ]);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const handleAttendanceSubmit = async () => {
    if (!selectedClass) return;

    setSaving(true);

    try {
      // هنا سيتم استدعاء API لحفظ سجل الحضور
      // await api.post(`/teacher/classes/${selectedClass.id}/attendance`, {
      //   date: selectedDate,
      //   students: selectedClass.students
      // });

      // محاكاة نجاح العملية
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowAttendanceModal(false);
      fetchAttendanceRecords();

      Alert({ message: 'تم حفظ سجل الحضور بنجاح' });
    } catch (error) {
      console.error('Error saving attendance:', error);
      Alert({ message: 'حدث خطأ أثناء حفظ سجل الحضور', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const updateStudentStatus = (studentId: string, status: Student['status'], notes?: string) => {
    if (!selectedClass) return;

    const updatedStudents = selectedClass.students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          status,
          notes,
          checkInTime: status !== 'absent' ? new Date().toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
          }) : undefined
        };
      }
      return student;
    });

    setSelectedClass({ ...selectedClass, students: updatedStudents });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      case 'excused': return 'secondary';
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

  const getRecordStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'not-started': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRecordStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'in-progress': return 'قيد التنفيذ';
      case 'not-started': return 'لم يبدأ';
      default: return 'غير محدد';
    }
  };

  const attendanceColumns = [
    {
      key: 'name',
      title: 'اسم الطالب',
      render: (value: string, record: Student) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary-600">
              {value.charAt(0)}
            </span>
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: string, record: Student) => (
        <select
          className="form-input text-sm"
          value={value}
          onChange={(e) => updateStudentStatus(record.id, e.target.value as Student['status'])}
        >
          <option value="present">حاضر</option>
          <option value="absent">غائب</option>
          <option value="late">متأخر</option>
          <option value="excused">معذور</option>
        </select>
      )
    },
    {
      key: 'checkInTime',
      title: 'وقت الوصول',
      render: (value: string) => value || '-'
    },
    {
      key: 'notes',
      title: 'ملاحظات',
      render: (value: string, record: Student) => (
        <Input
          placeholder="إضافة ملاحظة..."
          value={value || ''}
          onChange={(e) => updateStudentStatus(record.id, record.status, e.target.value)}
          className="text-sm"
        />
      )
    }
  ];

  const recordsColumns = [
    {
      key: 'className',
      title: 'اسم الفصل'
    },
    {
      key: 'totalStudents',
      title: 'إجمالي الطلاب'
    },
    {
      key: 'present',
      title: 'الحاضرون',
      render: (value: number, record: AttendanceRecord) => (
        <div className="flex items-center">
          <Badge variant="success" size="sm">{value}</Badge>
          <span className="mr-2 text-sm text-gray-600">
            ({Math.round((value / record.totalStudents) * 100)}%)
          </span>
        </div>
      )
    },
    {
      key: 'absent',
      title: 'الغائبون',
      render: (value: number) => (
        <Badge variant="danger" size="sm">{value}</Badge>
      )
    },
    {
      key: 'late',
      title: 'المتأخرون',
      render: (value: number) => (
        <Badge variant="warning" size="sm">{value}</Badge>
      )
    },
    {
      key: 'status',
      title: 'حالة التسجيل',
      render: (value: string) => (
        <Badge variant={getRecordStatusBadgeVariant(value)}>
          {getRecordStatusText(value)}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (value: any, record: AttendanceRecord) => (
        <Button
          size="sm"
          onClick={() => {
            const classData = classes.find(c => c.id === record.classId);
            if (classData) {
              setSelectedClass(classData);
              setShowAttendanceModal(true);
            }
          }}
          disabled={record.status === 'completed'}
        >
          {record.status === 'completed' ? 'مكتمل' : 'تسجيل الحضور'}
        </Button>
      )
    }
  ];

  return (
    <TeacherLayout
      title="تسجيل الحضور"
      subtitle="تسجيل حضور الطلاب في الفصول"
      actions={
        <div className="flex space-x-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button variant="secondary" size="sm">
            تقرير الحضور
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* سجلات الحضور للتاريخ المحدد */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              سجلات الحضور - {new Date(selectedDate).toLocaleDateString('ar-EG')}
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            <Table
              columns={recordsColumns}
              data={attendanceRecords}
              loading={loading}
              emptyMessage="لا توجد فصول في هذا التاريخ"
            />
          </CardBody>
        </Card>

        {/* إحصائيات سريعة لليوم */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {attendanceRecords.reduce((sum, record) => sum + record.present, 0)}
              </div>
              <div className="text-sm text-gray-600">إجمالي الحاضرين</div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {attendanceRecords.reduce((sum, record) => sum + record.absent, 0)}
              </div>
              <div className="text-sm text-gray-600">إجمالي الغائبين</div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {attendanceRecords.reduce((sum, record) => sum + record.late, 0)}
              </div>
              <div className="text-sm text-gray-600">إجمالي المتأخرين</div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {attendanceRecords.length > 0 ?
                  Math.round(attendanceRecords.reduce((sum, record) => sum + record.present, 0) /
                           attendanceRecords.reduce((sum, record) => sum + record.totalStudents, 0) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">معدل الحضور العام</div>
            </CardBody>
          </Card>
        </div>

        {/* قائمة الفصول اليوم */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">فصول اليوم</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => (
                <div key={classItem.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                    <Badge variant="primary" size="sm">
                      {classItem.schedule.startTime} - {classItem.schedule.endTime}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{classItem.subject}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {classItem.students.filter(s => s.status === 'present').length} / {classItem.students.length} طالب
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedClass(classItem);
                        setShowAttendanceModal(true);
                      }}
                    >
                      تسجيل الحضور
                    </Button>
                  </div>

                  {/* شريط تقدم الحضور */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(classItem.students.filter(s => s.status === 'present').length / classItem.students.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* نافذة تسجيل الحضور */}
      <Modal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        title={`تسجيل الحضور - ${selectedClass?.name}`}
        size="xl"
      >
        {selectedClass && (
          <div className="space-y-6">
            {/* معلومات الفصل */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">المادة:</span>
                  <span className="mr-2 text-gray-900">{selectedClass.subject}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">التاريخ:</span>
                  <span className="mr-2 text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">الوقت:</span>
                  <span className="mr-2 text-gray-900">
                    {selectedClass.schedule.startTime} - {selectedClass.schedule.endTime}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">إجمالي الطلاب:</span>
                  <span className="mr-2 text-gray-900">{selectedClass.students.length}</span>
                </div>
              </div>
            </div>

            {/* جدول الطلاب */}
            <div className="max-h-96 overflow-y-auto">
              <Table
                columns={attendanceColumns}
                data={selectedClass.students}
                emptyMessage="لا يوجد طلاب في هذا الفصل"
              />
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {selectedClass.students.filter(s => s.status === 'present').length}
                </div>
                <div className="text-xs text-gray-600">حاضر</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {selectedClass.students.filter(s => s.status === 'absent').length}
                </div>
                <div className="text-xs text-gray-600">غائب</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {selectedClass.students.filter(s => s.status === 'late').length}
                </div>
                <div className="text-xs text-gray-600">متأخر</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {selectedClass.students.filter(s => s.status === 'excused').length}
                </div>
                <div className="text-xs text-gray-600">معذور</div>
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setShowAttendanceModal(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAttendanceSubmit}
                loading={saving}
              >
                حفظ سجل الحضور
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </TeacherLayout>
  );
};