
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Table, Modal, Input, Textarea } from '../../components/ui';
import { StudentLayout } from './StudentLayout';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacher: string;
  className: string;
  type: 'homework' | 'project' | 'research' | 'presentation' | 'quiz';
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdDate: string;
  maxScore?: number;
  score?: number;
  grade?: string;
  feedback?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: string;
  }[];
  submission?: {
    id: string;
    submittedDate: string;
    fileName: string;
    fileSize: string;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  };
}

interface SubmissionData {
  assignmentId: string;
  file?: File;
  notes?: string;
}

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'submitted' | 'graded'>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [submissionData, setSubmissionData] = useState<SubmissionData>({ assignmentId: '' });

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, activeTab, searchTerm, filterSubject]);

  const fetchAssignments = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بواجبات الطالب
      // const response = await api.get('/student/assignments');

      // بيانات تجريبية مؤقتة
      const mockAssignments: Assignment[] = [
        {
          id: '1',
          title: 'حل المعادلات التربيعية',
          description: 'حل 20 معادلة تربيعية بطرق مختلفة مع شرح الخطوات',
          subject: 'الرياضيات',
          teacher: 'أحمد محمد',
          className: 'الرياضيات المستوى الأول',
          type: 'homework',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2024-01-25',
          createdDate: '2024-01-20',
          maxScore: 100
        },
        {
          id: '2',
          title: 'كتابة إنشاء عن البيئة',
          description: 'كتابة إنشاء باللغة العربية الفصحى عن أهمية الحفاظ على البيئة',
          subject: 'اللغة العربية',
          teacher: 'فاطمة حسن',
          className: 'اللغة العربية المستوى الثاني',
          type: 'project',
          status: 'not_started',
          priority: 'medium',
          dueDate: '2024-01-28',
          createdDate: '2024-01-18',
          maxScore: 50
        },
        {
          id: '3',
          title: 'مشروع العلوم عن النباتات',
          description: 'إعداد مشروع بحثي عن أنواع النباتات ودورة حياتها',
          subject: 'العلوم',
          teacher: 'محمد علي',
          className: 'العلوم المستوى الأول',
          type: 'research',
          status: 'submitted',
          priority: 'high',
          dueDate: '2024-01-22',
          createdDate: '2024-01-15',
          maxScore: 100,
          score: 88,
          grade: 'جيد جداً',
          feedback: 'مشروع ممتاز مع أبحاث دقيقة وعرض مرتب',
          submission: {
            id: '1',
            submittedDate: '2024-01-21',
            fileName: 'مشروع_النباتات.pdf',
            fileSize: '2.5 MB',
            status: 'reviewed'
          }
        },
        {
          id: '4',
          title: 'اختبار قصير في النحو',
          description: 'اختبار قصير يغطي قواعد النحو الأساسية',
          subject: 'اللغة العربية',
          teacher: 'فاطمة حسن',
          className: 'اللغة العربية المستوى الثاني',
          type: 'quiz',
          status: 'graded',
          priority: 'medium',
          dueDate: '2024-01-20',
          createdDate: '2024-01-19',
          maxScore: 20,
          score: 18,
          grade: 'ممتاز',
          feedback: 'أداء ممتاز في قواعد النحو'
        },
        {
          id: '5',
          title: 'عرض تقديمي عن التاريخ الإسلامي',
          description: 'إعداد عرض تقديمي بوربوينت عن العصر العباسي',
          subject: 'التاريخ',
          teacher: 'سارة أحمد',
          className: 'التاريخ الإسلامي',
          type: 'presentation',
          status: 'overdue',
          priority: 'urgent',
          dueDate: '2024-01-18',
          createdDate: '2024-01-10',
          maxScore: 75
        }
      ];

      setAssignments(mockAssignments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    // فلترة حسب التبويب النشط
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'pending':
          filtered = filtered.filter(a => a.status === 'not_started');
          break;
        case 'in_progress':
          filtered = filtered.filter(a => a.status === 'in_progress');
          break;
        case 'submitted':
          filtered = filtered.filter(a => a.status === 'submitted');
          break;
        case 'graded':
          filtered = filtered.filter(a => a.status === 'graded');
          break;
      }
    }

    // فلترة حسب النص البحث
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.teacher.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب المادة
    if (filterSubject) {
      filtered = filtered.filter(a => a.subject === filterSubject);
    }

    setFilteredAssignments(filtered);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'not_started': return 'secondary';
      case 'in_progress': return 'warning';
      case 'submitted': return 'primary';
      case 'graded': return 'success';
      case 'overdue': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return 'لم يبدأ';
      case 'in_progress': return 'قيد التنفيذ';
      case 'submitted': return 'تم التسليم';
      case 'graded': return 'مُقيّم';
      case 'overdue': return 'متأخر';
      default: return 'غير محدد';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'homework':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'project':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'research':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'presentation':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h10M8 8h8m-8 4h8m-8 4h4" />
          </svg>
        );
      case 'quiz':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getGradeColor = (score?: number, maxScore?: number) => {
    if (!score || !maxScore) return 'text-gray-600';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleStartAssignment = (assignment: Assignment) => {
    // تحديث حالة الواجب إلى قيد التنفيذ
    setAssignments(prev => prev.map(a =>
      a.id === assignment.id ? { ...a, status: 'in_progress' as const } : a
    ));
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionData({ assignmentId: assignment.id });
    setShowSubmissionModal(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSubmissionData(prev => ({ ...prev, file }));
    }
  };

  const submitAssignment = async () => {
    if (!submissionData.file) return;

    try {
      // هنا سيتم رفع الملف وإرسال الواجب
      // const formData = new FormData();
      // formData.append('file', submissionData.file);
      // formData.append('assignmentId', submissionData.assignmentId);
      // formData.append('notes', submissionData.notes || '');

      // const response = await api.post('/student/assignments/submit', formData);

      // تحديث حالة الواجب مؤقتاً
      setAssignments(prev => prev.map(a =>
        a.id === submissionData.assignmentId
          ? {
              ...a,
              status: 'submitted' as const,
              submission: {
                id: Date.now().toString(),
                submittedDate: new Date().toISOString(),
                fileName: submissionData.file!.name,
                fileSize: `${(submissionData.file!.size / 1024 / 1024).toFixed(1)} MB`,
                status: 'pending'
              }
            }
          : a
      ));

      setShowSubmissionModal(false);
      setSubmissionData({ assignmentId: '' });
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  const assignmentsColumns = [
    {
      key: 'title',
      title: 'عنوان الواجب',
      render: (value: string, record: Assignment) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
            {getTypeIcon(record.type)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{record.className}</div>
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      title: 'المادة',
      render: (value: string, record: Assignment) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {value.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{record.teacher}</div>
          </div>
        </div>
      )
    },
    {
      key: 'dueDate',
      title: 'تاريخ التسليم',
      render: (value: string, record: Assignment) => {
        const isOverdue = new Date(value) < new Date() && record.status !== 'submitted' && record.status !== 'graded';
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <div className="font-medium">
              {new Date(value).toLocaleDateString('ar-EG')}
            </div>
            <div className={`${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
              {isOverdue ? 'متأخر' : `${Math.ceil((new Date(value).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم متبقي`}
            </div>
          </div>
        );
      }
    },
    {
      key: 'priority',
      title: 'الأولوية',
      render: (value: string) => (
        <Badge variant={getPriorityBadgeVariant(value)}>
          {getPriorityText(value)}
        </Badge>
      )
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
      key: 'grade',
      title: 'الدرجة',
      render: (value: any, record: Assignment) => {
        if (record.status === 'graded' && record.score && record.maxScore) {
          return (
            <div className="text-center">
              <div className={`text-lg font-bold ${getGradeColor(record.score, record.maxScore)}`}>
                {record.score}/{record.maxScore}
              </div>
              <div className="text-sm text-gray-500">
                {record.grade}
              </div>
            </div>
          );
        }
        return <span className="text-gray-400">-</span>;
      }
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (value: any, record: Assignment) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="secondary" onClick={() => {
            setSelectedAssignment(record);
            setShowAssignmentModal(true);
          }}>
            عرض التفاصيل
          </Button>
          {record.status === 'not_started' && (
            <Button size="sm" onClick={() => handleStartAssignment(record)}>
              ابدأ العمل
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button size="sm" onClick={() => handleSubmitAssignment(record)}>
              تسليم الواجب
            </Button>
          )}
        </div>
      )
    }
  ];

  const subjects = [...new Set(assignments.map(a => a.subject))];

  if (loading) {
    return (
      <StudentLayout title="الواجبات والمشاريع">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الواجبات...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title="الواجبات والمشاريع"
      subtitle="إدارة وتتبع جميع واجباتك ومشاريعك الدراسية"
      actions={
        <div className="flex space-x-3">
          <Input
            placeholder="البحث في الواجبات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">جميع المواد</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <Button variant="secondary" size="sm">
            تقويم الواجبات
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {assignments.filter(a => a.status === 'not_started' || a.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">قيد التنفيذ</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {assignments.filter(a => a.status === 'submitted').length}
              </div>
              <div className="text-sm text-gray-600">تم التسليم</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {assignments.filter(a => a.status === 'graded').length}
              </div>
              <div className="text-sm text-gray-600">مُقيّم</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {assignments.filter(a => a.status === 'overdue').length}
              </div>
              <div className="text-sm text-gray-600">متأخر</div>
            </CardBody>
          </Card>
        </div>

        {/* التبويبات */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', name: 'جميع الواجبات' },
              { id: 'pending', name: 'لم يبدأ' },
              { id: 'in_progress', name: 'قيد التنفيذ' },
              { id: 'submitted', name: 'تم التسليم' },
              { id: 'graded', name: 'مُقيّم' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                <span className="mr-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {tab.id === 'all' ? assignments.length :
                   tab.id === 'pending' ? assignments.filter(a => a.status === 'not_started').length :
                   tab.id === 'in_progress' ? assignments.filter(a => a.status === 'in_progress').length :
                   tab.id === 'submitted' ? assignments.filter(a => a.status === 'submitted').length :
                   assignments.filter(a => a.status === 'graded').length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* قائمة الواجبات */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'all' ? 'جميع الواجبات' :
               activeTab === 'pending' ? 'الواجبات المعلقة' :
               activeTab === 'in_progress' ? 'الواجبات قيد التنفيذ' :
               activeTab === 'submitted' ? 'الواجبات المسلمة' :
               'الواجبات المُقيّمة'}
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            <Table
              columns={assignmentsColumns}
              data={filteredAssignments}
              emptyMessage="لا توجد واجبات في هذه الفئة"
            />
          </CardBody>
        </Card>

        {/* الواجبات العاجلة */}
        {assignments.filter(a => a.priority === 'urgent' || a.priority === 'high').length > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-red-900">الواجبات العاجلة والمهمة</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {assignments
                  .filter(a => a.priority === 'urgent' || a.priority === 'high')
                  .slice(0, 3)
                  .map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                        {getTypeIcon(assignment.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                        <p className="text-sm text-gray-600">{assignment.subject} • {assignment.teacher}</p>
                        <p className="text-sm text-red-600">
                          تاريخ التسليم: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityBadgeVariant(assignment.priority)}>
                        {getPriorityText(assignment.priority)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(assignment.status)}>
                        {getStatusText(assignment.status)}
                      </Badge>
                      {assignment.status === 'not_started' && (
                        <Button size="sm" onClick={() => handleStartAssignment(assignment)}>
                          ابدأ العمل
                        </Button>
                      )}
                      {assignment.status === 'in_progress' && (
                        <Button size="sm" onClick={() => handleSubmitAssignment(assignment)}>
                          تسليم
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* نصائح لإدارة الواجبات */}
        <Card className="bg-blue-50 border-blue-200">
          <CardBody>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">نصائح لإدارة الواجبات بفعالية</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• ابدأ العمل في الواجبات مبكراً لتجنب التأخير</li>
                  <li>• قسم الواجبات الكبيرة إلى مهام صغيرة قابلة للتنفيذ</li>
                  <li>• استخدم تقويم لتتبع مواعيد التسليم</li>
                  <li>• راجع تعليمات الواجب بعناية قبل البدء</li>
                  <li>• احتفظ بنسخة احتياطية من جميع ملفاتك</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* نافذة تفاصيل الواجب */}
      {showAssignmentModal && selectedAssignment && (
        <Modal
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          title={selectedAssignment.title}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">المادة</h4>
                <p className="text-gray-600">{selectedAssignment.subject}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">المعلم</h4>
                <p className="text-gray-600">{selectedAssignment.teacher}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">نوع الواجب</h4>
                <div className="flex items-center">
                  {getTypeIcon(selectedAssignment.type)}
                  <span className="mr-2 capitalize">{selectedAssignment.type}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">تاريخ التسليم</h4>
                <p className="text-gray-600">
                  {new Date(selectedAssignment.dueDate).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">وصف الواجب</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{selectedAssignment.description}</p>
              </div>
            </div>

            {selectedAssignment.score && selectedAssignment.maxScore && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getGradeColor(selectedAssignment.score, selectedAssignment.maxScore)}`}>
                    {selectedAssignment.score}/{selectedAssignment.maxScore}
                  </div>
                  <div className="text-sm text-gray-600">الدرجة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round((selectedAssignment.score / selectedAssignment.maxScore) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">النسبة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedAssignment.grade}
                  </div>
                  <div className="text-sm text-gray-600">التقدير</div>
                </div>
              </div>
            )}

            {selectedAssignment.feedback && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">ملاحظات المعلم</h4>
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-blue-800">{selectedAssignment.feedback}</p>
                </div>
              </div>
            )}

            {selectedAssignment.submission && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">حالة التسليم</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedAssignment.submission.fileName}</p>
                      <p className="text-sm text-gray-600">
                        تم التسليم في: {new Date(selectedAssignment.submission.submittedDate).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <Badge variant={
                      selectedAssignment.submission.status === 'accepted' ? 'success' :
                      selectedAssignment.submission.status === 'rejected' ? 'danger' :
                      selectedAssignment.submission.status === 'reviewed' ? 'primary' : 'warning'
                    }>
                      {selectedAssignment.submission.status === 'accepted' ? 'مقبول' :
                       selectedAssignment.submission.status === 'rejected' ? 'مرفوض' :
                       selectedAssignment.submission.status === 'reviewed' ? 'تم المراجعة' : 'قيد المراجعة'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* نافذة تسليم الواجب */}
      {showSubmissionModal && selectedAssignment && (
        <Modal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          title={`تسليم الواجب - ${selectedAssignment.title}`}
          size="md"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر الملف
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              />
              {submissionData.file && (
                <p className="mt-2 text-sm text-gray-600">
                  تم اختيار الملف: {submissionData.file.name} ({(submissionData.file.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات إضافية (اختياري)
              </label>
              <Textarea
                value={submissionData.notes || ''}
                <div className="text-lg font-bold text-gray-900">
                  {selectedAssignment.estimatedHours} ساعة
                </div>
                <div className="text-sm text-gray-600">الوقت المقدر</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-lg font-bold ${
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">نصائح لإنجاز الواجبات بنجاح</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• ابدأ العمل في الواجبات مبكراً قبل موعد التسليم</li>
                  <li>• اقرأ المتطلبات بعناية وتأكد من فهمها جيداً</li>
