import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, Modal, Table } from '../../components/ui';
import { AdminLayout } from './AdminLayout';

interface Class {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  students: number;
  maxStudents: number;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  status: 'active' | 'inactive' | 'completed';
  academicYear: string;
  semester: string;
  createdAt: string;
}

interface ClassFormData {
  name: string;
  subject: string;
  teacherId: string;
  maxStudents: number;
  academicYear: string;
  semester: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export const ClassesManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    subject: '',
    teacherId: '',
    maxStudents: 30,
    academicYear: '2024/2025',
    semester: 'الأول',
    schedule: []
  });
  const [formErrors, setFormErrors] = useState<Partial<ClassFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بالفصول
      // const response = await api.get('/admin/classes');

      // بيانات تجريبية مؤقتة
      setClasses([
        {
          id: '1',
          name: 'الرياضيات المستوى الأول',
          subject: 'الرياضيات',
          teacherId: '1',
          teacherName: 'أحمد محمد',
          students: 25,
          maxStudents: 30,
          schedule: [
            { day: 'الأحد', startTime: '08:00', endTime: '10:00' },
            { day: 'الثلاثاء', startTime: '08:00', endTime: '10:00' }
          ],
          status: 'active',
          academicYear: '2024/2025',
          semester: 'الأول',
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'اللغة العربية المستوى الثاني',
          subject: 'اللغة العربية',
          teacherId: '2',
          teacherName: 'فاطمة حسن',
          students: 28,
          maxStudents: 30,
          schedule: [
            { day: 'الأحد', startTime: '10:00', endTime: '12:00' },
            { day: 'الثلاثاء', startTime: '10:00', endTime: '12:00' }
          ],
          status: 'active',
          academicYear: '2024/2025',
          semester: 'الأول',
          createdAt: '2024-01-01'
        },
        {
          id: '3',
          name: 'العلوم المستوى الأول',
          subject: 'العلوم',
          teacherId: '3',
          teacherName: 'محمد علي',
          students: 22,
          maxStudents: 25,
          schedule: [
            { day: 'الاثنين', startTime: '08:00', endTime: '10:00' },
            { day: 'الأربعاء', startTime: '08:00', endTime: '10:00' }
          ],
          status: 'active',
          academicYear: '2024/2025',
          semester: 'الأول',
          createdAt: '2024-01-01'
        },
        {
          id: '4',
          name: 'الإنجليزية المستوى الثالث',
          subject: 'اللغة الإنجليزية',
          teacherId: '4',
          teacherName: 'سارة أحمد',
          students: 0,
          maxStudents: 30,
          schedule: [],
          status: 'inactive',
          academicYear: '2024/2025',
          semester: 'الأول',
          createdAt: '2024-01-01'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بالمدرسين
      // const response = await api.get('/admin/teachers');

      // بيانات تجريبية مؤقتة
      setTeachers([
        { id: '1', name: 'أحمد محمد' },
        { id: '2', name: 'فاطمة حسن' },
        { id: '3', name: 'محمد علي' },
        { id: '4', name: 'سارة أحمد' },
        { id: '5', name: 'علي حسن' }
      ]);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const validateForm = (): boolean => {
    const errors: Partial<ClassFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'اسم الفصل مطلوب';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'اسم المادة مطلوب';
    }

    if (!formData.teacherId) {
      errors.teacherId = 'يجب اختيار مدرس للفصل';
    }

    if (!formData.maxStudents || formData.maxStudents < 1) {
      errors.maxStudents = 'الحد الأقصى للطلاب يجب أن يكون أكبر من 0';
    }

    if (formData.schedule.length === 0) {
      errors.schedule = 'يجب إضافة جدول زمني للفصل';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // هنا سيتم استدعاء API لإضافة أو تعديل الفصل
      // const response = await api.post('/admin/classes', formData);

      // محاكاة نجاح العملية
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchClasses();

      Alert({ message: 'تم حفظ الفصل بنجاح' });
    } catch (error) {
      console.error('Error saving class:', error);
      Alert({ message: 'حدث خطأ أثناء حفظ الفصل', variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;

    try {
      // هنا سيتم استدعاء API لحذف الفصل
      // await api.delete(`/admin/classes/${selectedClass.id}`);

      setClasses(classes.filter(cls => cls.id !== selectedClass.id));
      setShowDeleteModal(false);
      setSelectedClass(null);

      Alert({ message: 'تم حذف الفصل بنجاح' });
    } catch (error) {
      console.error('Error deleting class:', error);
      Alert({ message: 'حدث خطأ أثناء حذف الفصل', variant: 'danger' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      teacherId: '',
      maxStudents: 30,
      academicYear: '2024/2025',
      semester: 'الأول',
      schedule: []
    });
    setFormErrors({});
  };

  const openEditModal = (cls: Class) => {
    setSelectedClass(cls);
    setFormData({
      name: cls.name,
      subject: cls.subject,
      teacherId: cls.teacherId,
      maxStudents: cls.maxStudents,
      academicYear: cls.academicYear,
      semester: cls.semester,
      schedule: cls.schedule
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (cls: Class) => {
    setSelectedClass(cls);
    setShowDeleteModal(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'completed': return 'warning';
      default: return 'secondary';
    }
  };

  const addScheduleItem = () => {
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        { day: 'الأحد', startTime: '08:00', endTime: '10:00' }
      ]
    });
  };

  const updateScheduleItem = (index: number, field: string, value: string) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removeScheduleItem = (index: number) => {
    const newSchedule = formData.schedule.filter((_, i) => i !== index);
    setFormData({ ...formData, schedule: newSchedule });
  };

  const columns = [
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
      key: 'teacherName',
      title: 'المدرس المسؤول'
    },
    {
      key: 'students',
      title: 'عدد الطلاب',
      render: (value: number, record: Class) => (
        <div>
          <span className="font-medium">{value}</span>
          <span className="text-gray-500"> / {record.maxStudents}</span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${(value / record.maxStudents) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'schedule',
      title: 'الجدول الزمني',
      render: (schedule: Class['schedule']) => (
        <div className="text-sm">
          {schedule.length > 0 ? (
            <div>
              {schedule.slice(0, 2).map((item, index) => (
                <div key={index} className="text-gray-600">
                  {item.day}: {item.startTime} - {item.endTime}
                </div>
              ))}
              {schedule.length > 2 && (
                <div className="text-gray-400">+{schedule.length - 2} أخرى</div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">لم يحدد</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {value === 'active' ? 'نشط' :
           value === 'inactive' ? 'غير نشط' : 'مكتمل'}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (value: any, record: Class) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedClass(record);
              setShowStudentsModal(true);
            }}
          >
            الطلاب
          </Button>
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
            onClick={() => openDeleteModal(record)}
          >
            حذف
          </Button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout
      title="إدارة الفصول"
      subtitle="إدارة الفصول والمدرسين والطلاب"
      actions={
        <Button onClick={() => setShowAddModal(true)}>
          إضافة فصل جديد
        </Button>
      }
    >
      <div className="space-y-6">
        {/* فلاتر البحث */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="البحث في الفصول..."
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
                <option value="completed">مكتمل</option>
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

        {/* جدول الفصول */}
        <Card>
          <CardBody className="p-0">
            <Table
              columns={columns}
              data={filteredClasses}
              loading={loading}
              emptyMessage="لا توجد فصول للعرض"
            />
          </CardBody>
        </Card>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {classes.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">فصول نشطة</div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {classes.reduce((sum, c) => sum + c.students, 0)}
              </div>
              <div className="text-sm text-gray-600">إجمالي الطلاب</div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {classes.reduce((sum, c) => sum + c.maxStudents, 0)}
              </div>
              <div className="text-sm text-gray-600">السعة الإجمالية</div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((classes.reduce((sum, c) => sum + c.students, 0) / classes.reduce((sum, c) => sum + c.maxStudents, 0)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">معدل الإشغال</div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* نافذة إضافة فصل جديد */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إضافة فصل جديد"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="اسم الفصل"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="المادة"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            error={formErrors.subject}
            required
          />

          <div className="form-group">
            <label className="form-label">المدرس المسؤول</label>
            <select
              className="form-input"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              required
            >
              <option value="">اختر المدرس</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {formErrors.teacherId && (
              <p className="form-error">{formErrors.teacherId}</p>
            )}
          </div>

          <Input
            label="الحد الأقصى للطلاب"
            type="number"
            value={formData.maxStudents}
            onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
            error={formErrors.maxStudents}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="السنة الدراسية"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              required
            />

            <div className="form-group">
              <label className="form-label">الفصل الدراسي</label>
              <select
                className="form-input"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
              >
                <option value="الأول">الأول</option>
                <option value="الثاني">الثاني</option>
              </select>
            </div>
          </div>

          {/* الجدول الزمني */}
          <div className="form-group">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">الجدول الزمني</label>
              <Button type="button" variant="secondary" size="sm" onClick={addScheduleItem}>
                إضافة موعد
              </Button>
            </div>

            {formData.schedule.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  className="form-input flex-1"
                  value={item.day}
                  onChange={(e) => updateScheduleItem(index, 'day', e.target.value)}
                >
                  <option value="السبت">السبت</option>
                  <option value="الأحد">الأحد</option>
                  <option value="الاثنين">الاثنين</option>
                  <option value="الثلاثاء">الثلاثاء</option>
                  <option value="الأربعاء">الأربعاء</option>
                  <option value="الخميس">الخميس</option>
                  <option value="الجمعة">الجمعة</option>
                </select>

                <Input
                  type="time"
                  value={item.startTime}
                  onChange={(e) => updateScheduleItem(index, 'startTime', e.target.value)}
                  className="flex-1"
                />

                <Input
                  type="time"
                  value={item.endTime}
                  onChange={(e) => updateScheduleItem(index, 'endTime', e.target.value)}
                  className="flex-1"
                />

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeScheduleItem(index)}
                >
                  حذف
                </Button>
              </div>
            ))}

            {formErrors.schedule && (
              <p className="form-error">{formErrors.schedule}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              إضافة الفصل
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تعديل فصل */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل الفصل"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="اسم الفصل"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="المادة"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            error={formErrors.subject}
            required
          />

          <div className="form-group">
            <label className="form-label">المدرس المسؤول</label>
            <select
              className="form-input"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              required
            >
              <option value="">اختر المدرس</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {formErrors.teacherId && (
              <p className="form-error">{formErrors.teacherId}</p>
            )}
          </div>

          <Input
            label="الحد الأقصى للطلاب"
            type="number"
            value={formData.maxStudents}
            onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
            error={formErrors.maxStudents}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="السنة الدراسية"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              required
            />

            <div className="form-group">
              <label className="form-label">الفصل الدراسي</label>
              <select
                className="form-input"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
              >
                <option value="الأول">الأول</option>
                <option value="الثاني">الثاني</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تأكيد الحذف */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد الحذف"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            هل أنت متأكد من حذف الفصل "{selectedClass?.name}"؟
            <br />
            هذا الإجراء لا يمكن التراجع عنه.
          </p>

          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              حذف
            </Button>
          </div>
        </div>
      </Modal>

      {/* نافذة عرض طلاب الفصل */}
      <Modal
        isOpen={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        title={`طلاب الفصل: ${selectedClass?.name}`}
        size="xl"
      >
        <div className="text-center py-8">
          <p className="text-gray-600">
            سيتم عرض قائمة طلاب الفصل هنا مع إمكانية إضافة وإزالة الطلاب
          </p>
          <Button className="mt-4">
            إضافة طالب للفصل
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
};