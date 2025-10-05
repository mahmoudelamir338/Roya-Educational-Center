import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, Modal, Table } from '../../components/ui';
import { TeacherLayout } from './TeacherLayout';

interface Class {
  id: string;
  name: string;
  subject: string;
  students: Student[];
  maxStudents: number;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  academicYear: string;
  semester: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'transferred';
  notes?: string;
}

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  notes: string;
}

export const ClassesStudents: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<StudentFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

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
          maxStudents: 30,
          academicYear: '2024/2025',
          semester: 'الأول',
          schedule: [
            { day: 'الأحد', startTime: '08:00', endTime: '10:00' },
            { day: 'الثلاثاء', startTime: '08:00', endTime: '10:00' }
          ],
          students: [
            {
              id: '1',
              name: 'أحمد محمد علي',
              email: 'ahmed@example.com',
              phone: '+20123456789',
              guardianName: 'محمد علي',
              guardianPhone: '+20123456780',
              enrollmentDate: '2024-01-15',
              status: 'active',
              notes: 'طالب متفوق'
            },
            {
              id: '2',
              name: 'فاطمة حسن أحمد',
              email: 'fatima@example.com',
              phone: '+20123456790',
              guardianName: 'حسن أحمد',
              guardianPhone: '+20123456781',
              enrollmentDate: '2024-01-10',
              status: 'active'
            },
            {
              id: '3',
              name: 'محمد علي حسن',
              email: 'mohamed@example.com',
              phone: '+20123456791',
              guardianName: 'علي حسن',
              guardianPhone: '+20123456782',
              enrollmentDate: '2024-01-05',
              status: 'inactive',
              notes: 'انتقل لمدرسة أخرى'
            }
          ]
        },
        {
          id: '2',
          name: 'اللغة العربية المستوى الثاني',
          subject: 'اللغة العربية',
          maxStudents: 28,
          academicYear: '2024/2025',
          semester: 'الأول',
          schedule: [
            { day: 'الأحد', startTime: '10:00', endTime: '12:00' },
            { day: 'الثلاثاء', startTime: '10:00', endTime: '12:00' }
          ],
          students: [
            {
              id: '4',
              name: 'سارة محمد حسن',
              email: 'sara@example.com',
              phone: '+20123456792',
              guardianName: 'محمد حسن',
              guardianPhone: '+20123456783',
              enrollmentDate: '2024-01-12',
              status: 'active'
            },
            {
              id: '5',
              name: 'يوسف أحمد علي',
              email: 'yousef@example.com',
              phone: '+20123456793',
              guardianName: 'أحمد علي',
              guardianPhone: '+20123456784',
              enrollmentDate: '2024-01-08',
              status: 'active'
            }
          ]
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const filteredStudents = selectedClass ? selectedClass.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) : [];

  const validateForm = (): boolean => {
    const errors: Partial<StudentFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'اسم الطالب مطلوب';
    }

    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صالح';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'رقم الهاتف مطلوب';
    }

    if (!formData.guardianName.trim()) {
      errors.guardianName = 'اسم ولي الأمر مطلوب';
    }

    if (!formData.guardianPhone.trim()) {
      errors.guardianPhone = 'رقم هاتف ولي الأمر مطلوب';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedClass) return;

    setSubmitting(true);

    try {
      // هنا سيتم استدعاء API لإضافة أو تعديل الطالب
      // const response = await api.post(`/teacher/classes/${selectedClass.id}/students`, formData);

      // محاكاة نجاح العملية
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newStudent: Student = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: formData.notes
      };

      if (showEditStudentModal && selectedStudent) {
        // تعديل طالب موجود
        const updatedClasses = classes.map(cls => {
          if (cls.id === selectedClass.id) {
            return {
              ...cls,
              students: cls.students.map(student =>
                student.id === selectedStudent.id ? { ...newStudent, id: selectedStudent.id } : student
              )
            };
          }
          return cls;
        });
        setClasses(updatedClasses);
      } else {
        // إضافة طالب جديد
        const updatedClasses = classes.map(cls => {
          if (cls.id === selectedClass.id) {
            return {
              ...cls,
              students: [...cls.students, newStudent]
            };
          }
          return cls;
        });
        setClasses(updatedClasses);
      }

      setShowAddStudentModal(false);
      setShowEditStudentModal(false);
      resetForm();

      Alert({ message: 'تم حفظ بيانات الطالب بنجاح' });
    } catch (error) {
      console.error('Error saving student:', error);
      Alert({ message: 'حدث خطأ أثناء حفظ بيانات الطالب', variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!selectedClass || !selectedStudent) return;

    try {
      // هنا سيتم استدعاء API لحذف الطالب من الفصل
      // await api.delete(`/teacher/classes/${selectedClass.id}/students/${selectedStudent.id}`);

      const updatedClasses = classes.map(cls => {
        if (cls.id === selectedClass.id) {
          return {
            ...cls,
            students: cls.students.filter(student => student.id !== selectedStudent.id)
          };
        }
        return cls;
      });

      setClasses(updatedClasses);
      setShowRemoveStudentModal(false);
      setSelectedStudent(null);

      Alert({ message: 'تم حذف الطالب من الفصل بنجاح' });
    } catch (error) {
      console.error('Error removing student:', error);
      Alert({ message: 'حدث خطأ أثناء حذف الطالب', variant: 'danger' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      guardianName: '',
      guardianPhone: '',
      notes: ''
    });
    setFormErrors({});
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      notes: student.notes || ''
    });
    setShowEditStudentModal(true);
  };

  const openRemoveModal = (student: Student) => {
    setSelectedStudent(student);
    setShowRemoveStudentModal(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'transferred': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'transferred': return 'منقول';
      default: return 'غير محدد';
    }
  };

  const studentsColumns = [
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
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      title: 'الهاتف'
    },
    {
      key: 'guardianName',
      title: 'ولي الأمر',
      render: (value: string, record: Student) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{record.guardianPhone}</div>
        </div>
      )
    },
    {
      key: 'enrollmentDate',
      title: 'تاريخ التسجيل'
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
      render: (value: any, record: Student) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEditModal(record)}
          >
            تعديل
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => openRemoveModal(record)}
          >
            إزالة
          </Button>
        </div>
      )
    }
  ];

  return (
    <TeacherLayout
      title="إدارة الفصول والطلاب"
      subtitle="إدارة فصولك وطلابك"
      actions={
        <div className="flex space-x-3">
          <select
            className="form-input"
            value={selectedClass?.id || ''}
            onChange={(e) => {
              const classData = classes.find(c => c.id === e.target.value);
              setSelectedClass(classData || null);
            }}
          >
            <option value="">اختر الفصل</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          {selectedClass && (
            <Button onClick={() => setShowAddStudentModal(true)}>
              إضافة طالب جديد
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* معلومات الفصل المحدد */}
        {selectedClass && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedClass.name}</h3>
                  <p className="text-sm text-gray-600">{selectedClass.subject}</p>
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-600">
                    السعة: {selectedClass.students.length} / {selectedClass.maxStudents}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(selectedClass.students.length / selectedClass.maxStudents) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">السنة الدراسية:</span>
                  <span className="mr-2 text-gray-900">{selectedClass.academicYear}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">الفصل الدراسي:</span>
                  <span className="mr-2 text-gray-900">{selectedClass.semester}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">عدد الحصص الأسبوعية:</span>
                  <span className="mr-2 text-gray-900">{selectedClass.schedule.length}</span>
                </div>
              </div>

              {/* الجدول الزمني */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">الجدول الزمني:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClass.schedule.map((item, index) => (
                    <Badge key={index} variant="secondary">
                      {item.day}: {item.startTime} - {item.endTime}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* فلاتر البحث */}
        {selectedClass && (
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="البحث في الطلاب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="form-input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="transferred">منقول</option>
                </select>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  إعادة تعيين
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* جدول الطلاب */}
        {selectedClass && (
          <Card>
            <CardBody className="p-0">
              <Table
                columns={studentsColumns}
                data={filteredStudents}
                loading={loading}
                emptyMessage="لا يوجد طلاب في هذا الفصل"
              />
            </CardBody>
          </Card>
        )}

        {/* إحصائيات الطلاب */}
        {selectedClass && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedClass.students.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">طلاب نشطين</div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {selectedClass.students.filter(s => s.status === 'inactive').length}
                </div>
                <div className="text-sm text-gray-600">طلاب غير نشطين</div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {selectedClass.students.filter(s => s.status === 'transferred').length}
                </div>
                <div className="text-sm text-gray-600">طلاب منقولين</div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((selectedClass.students.filter(s => s.status === 'active').length / selectedClass.students.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">معدل النشاط</div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* رسالة عند عدم اختيار فصل */}
        {!selectedClass && (
          <Card>
            <CardBody className="text-center py-12">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">اختر فصلاً لعرض الطلاب</h3>
              <p className="text-gray-600">
                يرجى اختيار فصل من القائمة أعلاه لبدء إدارة الطلاب
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* نافذة إضافة طالب جديد */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title="إضافة طالب جديد"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="اسم الطالب"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              required
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              required
            />

            <Input
              label="رقم الهاتف"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={formErrors.phone}
              required
            />

            <Input
              label="اسم ولي الأمر"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              error={formErrors.guardianName}
              required
            />
          </div>

          <Input
            label="رقم هاتف ولي الأمر"
            value={formData.guardianPhone}
            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
            error={formErrors.guardianPhone}
            required
          />

          <div className="form-group">
            <label className="form-label">ملاحظات</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddStudentModal(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              إضافة الطالب
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تعديل طالب */}
      <Modal
        isOpen={showEditStudentModal}
        onClose={() => setShowEditStudentModal(false)}
        title="تعديل بيانات الطالب"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="اسم الطالب"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              required
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              required
            />

            <Input
              label="رقم الهاتف"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={formErrors.phone}
              required
            />

            <Input
              label="اسم ولي الأمر"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              error={formErrors.guardianName}
              required
            />
          </div>

          <Input
            label="رقم هاتف ولي الأمر"
            value={formData.guardianPhone}
            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
            error={formErrors.guardianPhone}
            required
          />

          <div className="form-group">
            <label className="form-label">ملاحظات</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditStudentModal(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تأكيد إزالة الطالب */}
      <Modal
        isOpen={showRemoveStudentModal}
        onClose={() => setShowRemoveStudentModal(false)}
        title="تأكيد إزالة الطالب"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            هل أنت متأكد من إزالة الطالب "{selectedStudent?.name}" من الفصل؟
            <br />
            يمكن إعادة إضافته لاحقاً إذا لزم الأمر.
          </p>

          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowRemoveStudentModal(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleRemoveStudent}
            >
              إزالة
            </Button>
          </div>
        </div>
      </Modal>
    </TeacherLayout>
  );
};