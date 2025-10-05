import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, Modal, Alert, Table } from '../../components/ui';
import { AdminLayout } from './AdminLayout';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'teacher' | 'student' | 'guardian';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'teacher' | 'student' | 'guardian';
  password: string;
  confirmPassword: string;
}

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بالمستخدمين
      // const response = await api.get('/admin/users');

      // بيانات تجريبية مؤقتة
      setUsers([
        {
          id: '1',
          name: 'أحمد محمد علي',
          email: 'ahmed@example.com',
          phone: '+20123456789',
          role: 'admin',
          status: 'active',
          createdAt: '2024-01-15',
          lastLogin: '2024-01-20'
        },
        {
          id: '2',
          name: 'فاطمة حسن',
          email: 'fatima@example.com',
          phone: '+20123456790',
          role: 'teacher',
          status: 'active',
          createdAt: '2024-01-10',
          lastLogin: '2024-01-19'
        },
        {
          id: '3',
          name: 'محمد أحمد',
          email: 'mohamed@example.com',
          phone: '+20123456791',
          role: 'student',
          status: 'active',
          createdAt: '2024-01-05',
          lastLogin: '2024-01-18'
        },
        {
          id: '4',
          name: 'علي حسن محمد',
          email: 'ali@example.com',
          phone: '+20123456792',
          role: 'guardian',
          status: 'inactive',
          createdAt: '2024-01-01'
        },
        {
          id: '5',
          name: 'نور علي',
          email: 'nour@example.com',
          phone: '+20123456793',
          role: 'student',
          status: 'suspended',
          createdAt: '2023-12-20'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صالح';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'رقم الهاتف مطلوب';
    }

    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // هنا سيتم استدعاء API لإضافة أو تعديل المستخدم
      // const response = await api.post('/admin/users', formData);

      // محاكاة نجاح العملية
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchUsers();

      Alert({ message: 'تم حفظ المستخدم بنجاح' });
    } catch (error) {
      console.error('Error saving user:', error);
      Alert({ message: 'حدث خطأ أثناء حفظ المستخدم', variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      // هنا سيتم استدعاء API لحذف المستخدم
      // await api.delete(`/admin/users/${selectedUser.id}`);

      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);

      Alert({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert({ message: 'حدث خطأ أثناء حذف المستخدم', variant: 'danger' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'student',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'teacher': return 'warning';
      case 'student': return 'primary';
      case 'guardian': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'suspended': return 'danger';
      default: return 'secondary';
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'الاسم',
      render: (value: string, record: User) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary-600">
              {value.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'الدور',
      render: (value: string) => (
        <Badge variant={getRoleBadgeVariant(value)}>
          {value === 'admin' ? 'مدير عام' :
           value === 'teacher' ? 'مدرس' :
           value === 'student' ? 'طالب' : 'ولي أمر'}
        </Badge>
      )
    },
    {
      key: 'phone',
      title: 'الهاتف'
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {value === 'active' ? 'نشط' :
           value === 'inactive' ? 'غير نشط' : 'معلق'}
        </Badge>
      )
    },
    {
      key: 'lastLogin',
      title: 'آخر دخول',
      render: (value: string) => value || 'لم يسجل دخول بعد'
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (value: any, record: User) => (
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
      title="إدارة المستخدمين"
      subtitle="إدارة جميع مستخدمي النظام"
      actions={
        <Button onClick={() => setShowAddModal(true)}>
          إضافة مستخدم جديد
        </Button>
      }
    >
      <div className="space-y-6">
        {/* فلاتر البحث */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="البحث في المستخدمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="form-input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">جميع الأدوار</option>
                <option value="admin">مدير عام</option>
                <option value="teacher">مدرس</option>
                <option value="student">طالب</option>
                <option value="guardian">ولي أمر</option>
              </select>

              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="suspended">معلق</option>
              </select>

              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              >
                إعادة تعيين
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* جدول المستخدمين */}
        <Card>
          <CardBody className="p-0">
            <Table
              columns={columns}
              data={filteredUsers}
              loading={loading}
              emptyMessage="لا توجد مستخدمين للعرض"
            />
          </CardBody>
        </Card>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">مدير عام</div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.role === 'teacher').length}
              </div>
              <div className="text-sm text-gray-600">مدرس</div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'student').length}
              </div>
              <div className="text-sm text-gray-600">طالب</div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'guardian').length}
              </div>
              <div className="text-sm text-gray-600">ولي أمر</div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* نافذة إضافة مستخدم جديد */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إضافة مستخدم جديد"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الاسم الكامل"
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

          <div className="form-group">
            <label className="form-label">الدور</label>
            <select
              className="form-input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              required
            >
              <option value="student">طالب</option>
              <option value="teacher">مدرس</option>
              <option value="guardian">ولي أمر</option>
              <option value="admin">مدير عام</option>
            </select>
          </div>

          <Input
            label="كلمة المرور"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
            required
          />

          <Input
            label="تأكيد كلمة المرور"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={formErrors.confirmPassword}
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              إضافة المستخدم
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تعديل مستخدم */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل المستخدم"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الاسم الكامل"
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

          <div className="form-group">
            <label className="form-label">الدور</label>
            <select
              className="form-input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              required
            >
              <option value="student">طالب</option>
              <option value="teacher">مدرس</option>
              <option value="guardian">ولي أمر</option>
              <option value="admin">مدير عام</option>
            </select>
          </div>

          <Input
            label="كلمة المرور الجديدة (اتركها فارغة إذا كنت لا تريد تغييرها)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
          />

          <Input
            label="تأكيد كلمة المرور الجديدة"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={formErrors.confirmPassword}
          />

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
            هل أنت متأكد من حذف المستخدم "{selectedUser?.name}"؟
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
    </AdminLayout>
  );
};