import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, Modal, Table } from '../../components/ui';
import { TeacherLayout } from './TeacherLayout';

interface Class {
  id: string;
  name: string;
  subject: string;
  students: Student[];
}

interface Student {
  id: string;
  name: string;
  grades: {
    [key: string]: number; // تاريخ الاختبار: الدرجة
  };
  average?: number;
}

interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  testDate: string;
  testType: 'quiz' | 'midterm' | 'final' | 'homework' | 'project';
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  notes?: string;
}

interface GradeFormData {
  studentId: string;
  testDate: string;
  testType: 'quiz' | 'midterm' | 'final' | 'homework' | 'project';
  score: number;
  maxScore: number;
  notes: string;
}

export const ReportsGrades: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [showEditGradeModal, setShowEditGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeRecord | null>(null);
  const [formData, setFormData] = useState<GradeFormData>({
    studentId: '',
    testDate: new Date().toISOString().split('T')[0],
    testType: 'quiz',
    score: 0,
    maxScore: 100,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<GradeFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchGradeRecords();
  }, [selectedClass]);

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
          students: [
            { id: '1', name: 'أحمد محمد', grades: { '2024-01-15': 85, '2024-01-10': 90 }, average: 87.5 },
            { id: '2', name: 'فاطمة علي', grades: { '2024-01-15': 92, '2024-01-10': 88 }, average: 90 },
            { id: '3', name: 'محمد حسن', grades: { '2024-01-15': 78, '2024-01-10': 82 }, average: 80 }
          ]
        },
        {
          id: '2',
          name: 'اللغة العربية المستوى الثاني',
          subject: 'اللغة العربية',
          students: [
            { id: '4', name: 'سارة محمد', grades: { '2024-01-14': 95, '2024-01-08': 89 }, average: 92 },
            { id: '5', name: 'يوسف أحمد', grades: { '2024-01-14': 87, '2024-01-08': 91 }, average: 89 }
          ]
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const fetchGradeRecords = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بسجلات الدرجات
      // const response = await api.get('/teacher/grade-records', {
      //   params: selectedClass ? { classId: selectedClass.id } : {}
      // });

      // بيانات تجريبية مؤقتة
      setGradeRecords([
        {
          id: '1',
          studentId: '1',
          studentName: 'أحمد محمد',
          classId: '1',
          className: 'الرياضيات المستوى الأول',
          testDate: '2024-01-15',
          testType: 'quiz',
          subject: 'الرياضيات',
          score: 85,
          maxScore: 100,
          percentage: 85,
          notes: 'أداء جيد'
        },
        {
          id: '2',
          studentId: '2',
          studentName: 'فاطمة علي',
          classId: '1',
          className: 'الرياضيات المستوى الأول',
          testDate: '2024-01-15',
          testType: 'quiz',
          subject: 'الرياضيات',
          score: 92,
          maxScore: 100,
          percentage: 92,
          notes: 'ممتاز'
        },
        {
          id: '3',
          studentId: '4',
          studentName: 'سارة محمد',
          classId: '2',
          className: 'اللغة العربية المستوى الثاني',
          testDate: '2024-01-14',
          testType: 'midterm',
          subject: 'اللغة العربية',
          score: 95,
          maxScore: 100,
          percentage: 95,
          notes: 'أداء متميز'
        }
      ]);
    } catch (error) {
      console.error('Error fetching grade records:', error);
    }
  };

  const filteredRecords = gradeRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTestType = testTypeFilter === 'all' || record.testType === testTypeFilter;

    return matchesSearch && matchesTestType;
  });

  const validateForm = (): boolean => {
    const errors: Partial<GradeFormData> = {};

    if (!formData.studentId) {
      errors.studentId = 'يجب اختيار طالب';
    }

    if (!formData.testDate) {
      errors.testDate = 'تاريخ الاختبار مطلوب';
    }

    if (formData.score < 0) {
      errors.score = 'الدرجة يجب أن تكون أكبر من أو تساوي 0';
    }

    if (formData.maxScore <= 0) {
      errors.maxScore = 'الدرجة القصوى يجب أن تكون أكبر من 0';
    }

    if (formData.score > formData.maxScore) {
      errors.score = 'الدرجة يجب أن تكون أقل من أو تساوي الدرجة القصوى';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedClass) return;

    setSubmitting(true);

    try {
      // هنا سيتم استدعاء API لإضافة أو تعديل الدرجة
      // const response = await api.post('/teacher/grades', formData);

      // محاكاة نجاح العملية
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newGrade: GradeRecord = {
        id: Date.now().toString(),
        studentId: formData.studentId,
        studentName: selectedClass.students.find(s => s.id === formData.studentId)?.name || '',
        classId: selectedClass.id,
        className: selectedClass.name,
        testDate: formData.testDate,
        testType: formData.testType,
        subject: selectedClass.subject,
        score: formData.score,
        maxScore: formData.maxScore,
        percentage: Math.round((formData.score / formData.maxScore) * 100),
        notes: formData.notes
      };

      if (showEditGradeModal && selectedGrade) {
        // تعديل درجة موجودة
        setGradeRecords(gradeRecords.map(record =>
          record.id === selectedGrade.id ? newGrade : record
        ));
      } else {
        // إضافة درجة جديدة
        setGradeRecords([...gradeRecords, newGrade]);
      }

      setShowAddGradeModal(false);
      setShowEditGradeModal(false);
      resetForm();

      Alert({ message: 'تم حفظ الدرجة بنجاح' });
    } catch (error) {
      console.error('Error saving grade:', error);
      Alert({ message: 'حدث خطأ أثناء حفظ الدرجة', variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      testDate: new Date().toISOString().split('T')[0],
      testType: 'quiz',
      score: 0,
      maxScore: 100,
      notes: ''
    });
    setFormErrors({});
  };

  const openEditModal = (grade: GradeRecord) => {
    setSelectedGrade(grade);
    setFormData({
      studentId: grade.studentId,
      testDate: grade.testDate,
      testType: grade.testType,
      score: grade.score,
      maxScore: grade.maxScore,
      notes: grade.notes || ''
    });
    setShowEditGradeModal(true);
  };

  const getTestTypeBadgeVariant = (testType: string) => {
    switch (testType) {
      case 'quiz': return 'primary';
      case 'midterm': return 'warning';
      case 'final': return 'danger';
      case 'homework': return 'secondary';
      case 'project': return 'success';
      default: return 'secondary';
    }
  };

  const getTestTypeText = (testType: string) => {
    switch (testType) {
      case 'quiz': return 'اختبار قصير';
      case 'midterm': return 'اختبار منتصف الفصل';
      case 'final': return 'اختبار نهائي';
      case 'homework': return 'واجب منزلي';
      case 'project': return 'مشروع';
      default: return 'غير محدد';
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const gradesColumns = [
    {
      key: 'studentName',
      title: 'اسم الطالب',
      render: (value: string, record: GradeRecord) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary-600">
              {value.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{record.className}</div>
          </div>
        </div>
      )
    },
    {
      key: 'testType',
      title: 'نوع الاختبار',
      render: (value: string) => (
        <Badge variant={getTestTypeBadgeVariant(value)}>
          {getTestTypeText(value)}
        </Badge>
      )
    },
    {
      key: 'testDate',
      title: 'تاريخ الاختبار'
    },
    {
      key: 'score',
      title: 'الدرجة',
      render: (value: number, record: GradeRecord) => (
        <div className="text-center">
          <div className={`text-lg font-bold ${getGradeColor(record.percentage)}`}>
            {value} / {record.maxScore}
          </div>
          <div className="text-sm text-gray-500">
            {record.percentage}%
          </div>
        </div>
      )
    },
    {
      key: 'notes',
      title: 'ملاحظات',
      render: (value: string) => (
        <div className="max-w-xs truncate text-sm text-gray-600" title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (value: any, record: GradeRecord) => (
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
            onClick={() => {
              setSelectedGrade(record);
              // يمكن إضافة نافذة تأكيد الحذف هنا
            }}
          >
            حذف
          </Button>
        </div>
      )
    }
  ];

  return (
    <TeacherLayout
      title="التقارير والدرجات"
      subtitle="إدارة درجات الطلاب وتقارير الأداء"
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
            <Button onClick={() => setShowAddGradeModal(true)}>
              إضافة درجة جديدة
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* فلاتر البحث */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="البحث في السجلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="form-input"
                value={testTypeFilter}
                onChange={(e) => setTestTypeFilter(e.target.value)}
              >
                <option value="all">جميع أنواع الاختبارات</option>
                <option value="quiz">اختبار قصير</option>
                <option value="midterm">اختبار منتصف الفصل</option>
                <option value="final">اختبار نهائي</option>
                <option value="homework">واجب منزلي</option>
                <option value="project">مشروع</option>
              </select>

              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setTestTypeFilter('all');
                }}
              >
                إعادة تعيين
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* جدول سجلات الدرجات */}
        <Card>
          <CardBody className="p-0">
            <Table
              columns={gradesColumns}
              data={filteredRecords}
              loading={loading}
              emptyMessage="لا توجد سجلات درجات للعرض"
            />
          </CardBody>
        </Card>

        {/* إحصائيات الدرجات */}
        {selectedClass && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(gradeRecords.reduce((sum, record) => sum + record.percentage, 0) / gradeRecords.length) || 0}%
                </div>
                <div className="text-sm text-gray-600">متوسط الدرجات</div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {gradeRecords.filter(r => r.percentage >= 90).length}
                </div>
                <div className="text-sm text-gray-600">درجات ممتازة (90+)</div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {gradeRecords.filter(r => r.percentage >= 70 && r.percentage < 90).length}
                </div>
                <div className="text-sm text-gray-600">درجات جيدة (70-89)</div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {gradeRecords.filter(r => r.percentage < 70).length}
                </div>
                <div className="text-sm text-gray-600">درجات تحتاج تحسين</div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* تقرير أداء الفصل */}
        {selectedClass && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">تقرير أداء الفصل</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {selectedClass.students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-primary-600">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">
                          {Object.keys(student.grades).length} اختبار • متوسط: {student.average}%
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className={`text-lg font-bold ${getGradeColor(student.average || 0)}`}>
                        {student.average}%
                      </div>
                      <div className="text-sm text-gray-500">المعدل</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* رسالة عند عدم اختيار فصل */}
        {!selectedClass && (
          <Card>
            <CardBody className="text-center py-12">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">اختر فصلاً لعرض الدرجات</h3>
              <p className="text-gray-600">
                يرجى اختيار فصل من القائمة أعلاه لبدء إدارة الدرجات والتقارير
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* نافذة إضافة درجة جديدة */}
      <Modal
        isOpen={showAddGradeModal}
        onClose={() => setShowAddGradeModal(false)}
        title="إضافة درجة جديدة"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">الطالب</label>
            <select
              className="form-input"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            >
              <option value="">اختر الطالب</option>
              {selectedClass?.students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {formErrors.studentId && (
              <p className="form-error">{formErrors.studentId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="تاريخ الاختبار"
              type="date"
              value={formData.testDate}
              onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
              error={formErrors.testDate}
              required
            />

            <div className="form-group">
              <label className="form-label">نوع الاختبار</label>
              <select
                className="form-input"
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value as any })}
                required
              >
                <option value="quiz">اختبار قصير</option>
                <option value="midterm">اختبار منتصف الفصل</option>
                <option value="final">اختبار نهائي</option>
                <option value="homework">واجب منزلي</option>
                <option value="project">مشروع</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="الدرجة المحققة"
              type="number"
              min="0"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) || 0 })}
              error={formErrors.score}
              required
            />

            <Input
              label="الدرجة القصوى"
              type="number"
              min="1"
              value={formData.maxScore}
              onChange={(e) => setFormData({ ...formData, maxScore: parseFloat(e.target.value) || 100 })}
              error={formErrors.maxScore}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ملاحظات</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية حول أداء الطالب..."
            />
          </div>

          {/* عرض النسبة المئوية */}
          {formData.score > 0 && formData.maxScore > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getGradeColor(Math.round((formData.score / formData.maxScore) * 100))}`}>
                  {Math.round((formData.score / formData.maxScore) * 100)}%
                </div>
                <div className="text-sm text-gray-600">النسبة المئوية</div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddGradeModal(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              حفظ الدرجة
            </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة تعديل درجة */}
      <Modal
        isOpen={showEditGradeModal}
        onClose={() => setShowEditGradeModal(false)}
        title="تعديل الدرجة"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">الطالب</label>
            <select
              className="form-input"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            >
              <option value="">اختر الطالب</option>
              {selectedClass?.students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {formErrors.studentId && (
              <p className="form-error">{formErrors.studentId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="تاريخ الاختبار"
              type="date"
              value={formData.testDate}
              onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
              error={formErrors.testDate}
              required
            />

            <div className="form-group">
              <label className="form-label">نوع الاختبار</label>
              <select
                className="form-input"
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value as any })}
                required
              >
                <option value="quiz">اختبار قصير</option>
                <option value="midterm">اختبار منتصف الفصل</option>
                <option value="final">اختبار نهائي</option>
                <option value="homework">واجب منزلي</option>
                <option value="project">مشروع</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="الدرجة المحققة"
              type="number"
              min="0"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) || 0 })}
              error={formErrors.score}
              required
            />

            <Input
              label="الدرجة القصوى"
              type="number"
              min="1"
              value={formData.maxScore}
              onChange={(e) => setFormData({ ...formData, maxScore: parseFloat(e.target.value) || 100 })}
              error={formErrors.maxScore}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ملاحظات</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية حول أداء الطالب..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditGradeModal(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={submitting}>
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>
    </TeacherLayout>
  );
};