import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Table, Modal, Input } from '../../components/ui';
import { StudentLayout } from './StudentLayout';

interface Grade {
  id: string;
  subject: string;
  testType: string;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  date: string;
  teacher: string;
  comments?: string;
  classAverage?: number;
  classHighest?: number;
}

interface SubjectGrades {
  subject: string;
  teacher: string;
  grades: Grade[];
  average: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface SemesterReport {
  semester: string;
  gpa: number;
  totalCredits: number;
  subjectsCount: number;
  grades: {
    subject: string;
    grade: string;
    credits: number;
    points: number;
  }[];
}

export const StudentGrades: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjectGrades, setSubjectGrades] = useState<SubjectGrades[]>([]);
  const [semesterReports, setSemesterReports] = useState<SemesterReport[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'subjects' | 'reports' | 'analytics'>('current');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بدرجات الطالب
      // const response = await api.get('/student/grades');

      // بيانات تجريبية مؤقتة
      const mockGrades: Grade[] = [
        {
          id: '1',
          subject: 'الرياضيات',
          testType: 'اختبار قصير',
          title: 'المعادلات الخطية',
          score: 85,
          maxScore: 100,
          percentage: 85,
          grade: 'جيد جداً',
          date: '2024-01-15',
          teacher: 'أحمد محمد',
          comments: 'أداء ممتاز في حل المعادلات، تحتاج تحسين في السرعة',
          classAverage: 78,
          classHighest: 95
        },
        {
          id: '2',
          subject: 'اللغة العربية',
          testType: 'واجب منزلي',
          title: 'التعبير الكتابي',
          score: 92,
          maxScore: 100,
          percentage: 92,
          grade: 'ممتاز',
          date: '2024-01-14',
          teacher: 'فاطمة حسن',
          comments: 'تعبير رائع وأفكار منظمة بشكل جيد',
          classAverage: 85,
          classHighest: 98
        },
        {
          id: '3',
          subject: 'العلوم',
          testType: 'مشروع',
          title: 'البيئة والتلوث',
          score: 88,
          maxScore: 100,
          percentage: 88,
          grade: 'جيد جداً',
          date: '2024-01-12',
          teacher: 'محمد علي',
          comments: 'مشروع مميز مع أبحاث دقيقة وعرض ممتاز',
          classAverage: 82,
          classHighest: 94
        },
        {
          id: '4',
          subject: 'الرياضيات',
          testType: 'اختبار شهري',
          title: 'الجبر الأساسي',
          score: 76,
          maxScore: 100,
          percentage: 76,
          grade: 'جيد',
          date: '2024-01-10',
          teacher: 'أحمد محمد',
          comments: 'يحتاج المزيد من الممارسة في حل المسائل المركبة',
          classAverage: 72,
          classHighest: 89
        },
        {
          id: '5',
          subject: 'اللغة العربية',
          testType: 'اختبار قصير',
          title: 'النحو والصرف',
          score: 90,
          maxScore: 100,
          percentage: 90,
          grade: 'ممتاز',
          date: '2024-01-08',
          teacher: 'فاطمة حسن',
          comments: 'إجادة ممتازة في قواعد النحو',
          classAverage: 83,
          classHighest: 96
        }
      ];

      setGrades(mockGrades);

      // تجميع الدرجات حسب المادة
      const subjectsMap = new Map<string, SubjectGrades>();
      mockGrades.forEach(grade => {
        if (!subjectsMap.has(grade.subject)) {
          subjectsMap.set(grade.subject, {
            subject: grade.subject,
            teacher: grade.teacher,
            grades: [],
            average: 0,
            trend: 'stable',
            color: getSubjectColor(grade.subject)
          });
        }
        subjectsMap.get(grade.subject)!.grades.push(grade);
      });

      // حساب المعدل لكل مادة
      subjectsMap.forEach(subject => {
        subject.average = subject.grades.reduce((acc, grade) => acc + grade.percentage, 0) / subject.grades.length;
      });

      setSubjectGrades(Array.from(subjectsMap.values()));

      // تقارير الفصل الدراسي
      setSemesterReports([
        {
          semester: 'الفصل الدراسي الأول 2024',
          gpa: 3.7,
          totalCredits: 18,
          subjectsCount: 6,
          grades: [
            { subject: 'الرياضيات', grade: 'A-', credits: 3, points: 3.7 },
            { subject: 'اللغة العربية', grade: 'A', credits: 3, points: 4.0 },
            { subject: 'العلوم', grade: 'B+', credits: 3, points: 3.3 },
            { subject: 'التاريخ', grade: 'B', credits: 3, points: 3.0 },
            { subject: 'الجغرافيا', grade: 'A-', credits: 3, points: 3.7 },
            { subject: 'التربية الإسلامية', grade: 'A', credits: 3, points: 4.0 }
          ]
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setLoading(false);
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'الرياضيات': 'blue',
      'اللغة العربية': 'green',
      'العلوم': 'purple',
      'التاريخ': 'orange',
      'الجغرافيا': 'teal',
      'التربية الإسلامية': 'indigo'
    };
    return colors[subject] || 'gray';
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (grade.includes('ممتاز')) return 'success';
    if (grade.includes('جيد جداً')) return 'primary';
    if (grade.includes('جيد')) return 'warning';
    if (grade.includes('مقبول')) return 'secondary';
    return 'danger';
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case 'اختبار قصير':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'اختبار شهري':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'مشروع':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'واجب منزلي':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || grade.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = [...new Set(grades.map(g => g.subject))];

  const gradesColumns = [
    {
      key: 'subject',
      title: 'المادة',
      render: (value: string, record: Grade) => (
        <div className="flex items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
            getSubjectColor(value) === 'blue' ? 'bg-blue-100 text-blue-600' :
            getSubjectColor(value) === 'green' ? 'bg-green-100 text-green-600' :
            getSubjectColor(value) === 'purple' ? 'bg-purple-100 text-purple-600' :
            getSubjectColor(value) === 'orange' ? 'bg-orange-100 text-orange-600' :
            getSubjectColor(value) === 'teal' ? 'bg-teal-100 text-teal-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {value.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{record.teacher}</div>
          </div>
        </div>
      )
    },
    {
      key: 'title',
      title: 'عنوان الاختبار',
      render: (value: string, record: Grade) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="flex items-center text-sm text-gray-500">
            {getTestTypeIcon(record.testType)}
            <span className="mr-2">{record.testType}</span>
          </div>
        </div>
      )
    },
    {
      key: 'score',
      title: 'الدرجة',
      render: (value: number, record: Grade) => (
        <div className="text-center">
          <div className={`text-xl font-bold ${getGradeColor(record.percentage)}`}>
            {value}/{record.maxScore}
          </div>
          <div className="text-sm text-gray-500">
            {record.percentage}%
          </div>
        </div>
      )
    },
    {
      key: 'grade',
      title: 'التقدير',
      render: (value: string) => (
        <Badge variant={getGradeBadgeVariant(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'date',
      title: 'التاريخ',
      render: (value: string) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(value).toLocaleDateString('ar-EG')}
          </div>
          <div className="text-gray-500">
            {Math.floor((new Date().getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24))} يوم مضى
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (value: any, record: Grade) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSelectedGrade(record);
            setShowGradeModal(true);
          }}
        >
          عرض التفاصيل
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <StudentLayout title="درجاتي">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الدرجات...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title="درجاتي والتقييمات"
      subtitle="متابعة أدائك الأكاديمي وتقدمك الدراسي"
      actions={
        <div className="flex space-x-3">
          <Input
            placeholder="البحث في الدرجات..."
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
            تصدير التقرير
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {Math.round(grades.reduce((acc, g) => acc + g.percentage, 0) / grades.length)}%
              </div>
              <div className="text-sm text-gray-600">المعدل العام</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {grades.filter(g => g.percentage >= 90).length}
              </div>
              <div className="text-sm text-gray-600">درجة ممتازة</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {grades.filter(g => g.percentage >= 80 && g.percentage < 90).length}
              </div>
              <div className="text-sm text-gray-600">درجة جيدة جداً</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {grades.filter(g => g.percentage < 70).length}
              </div>
              <div className="text-sm text-gray-600">يحتاج تحسين</div>
            </CardBody>
          </Card>
        </div>

        {/* التبويبات */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'current', name: 'الدرجات الحالية' },
              { id: 'subjects', name: 'حسب المادة' },
              { id: 'reports', name: 'التقارير الفصلية' },
              { id: 'analytics', name: 'التحليلات' }
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
              </button>
            ))}
          </nav>
        </div>

        {/* محتوى التبويبات */}
        {activeTab === 'current' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">الدرجات الحديثة</h3>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                columns={gradesColumns}
                data={filteredGrades}
                emptyMessage="لا توجد درجات متاحة حالياً"
              />
            </CardBody>
          </Card>
        )}

        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectGrades.map((subject) => (
              <Card key={subject.subject}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{subject.subject}</h3>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      subject.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      subject.color === 'green' ? 'bg-green-100 text-green-600' :
                      subject.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      subject.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      subject.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {subject.subject.charAt(0)}
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getGradeColor(subject.average)}`}>
                        {Math.round(subject.average)}%
                      </div>
                      <div className="text-sm text-gray-600">المعدل في المادة</div>
                    </div>

                    <div className="space-y-2">
                      {subject.grades.slice(0, 3).map((grade) => (
                        <div key={grade.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{grade.title}</div>
                            <div className="text-xs text-gray-500">{grade.testType}</div>
                          </div>
                          <div className={`text-sm font-bold ${getGradeColor(grade.percentage)}`}>
                            {grade.score}/{grade.maxScore}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button size="sm" variant="secondary" className="w-full">
                      عرض جميع الدرجات
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {semesterReports.map((report) => (
              <Card key={report.semester}>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">{report.semester}</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{report.gpa}</div>
                      <div className="text-sm text-gray-600">المعدل التراكمي</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{report.totalCredits}</div>
                      <div className="text-sm text-gray-600">إجمالي الساعات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{report.subjectsCount}</div>
                      <div className="text-sm text-gray-600">عدد المواد</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        report.gpa >= 3.5 ? 'text-green-600' :
                        report.gpa >= 3.0 ? 'text-blue-600' :
                        report.gpa >= 2.5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {report.gpa >= 3.5 ? 'ممتاز' :
                         report.gpa >= 3.0 ? 'جيد جداً' :
                         report.gpa >= 2.5 ? 'جيد' : 'مقبول'}
                      </div>
                      <div className="text-sm text-gray-600">التقييم العام</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 mb-3">تفصيل المواد</h4>
                    {report.grades.map((subjectGrade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{subjectGrade.subject}</div>
                          <div className="text-sm text-gray-600">{subjectGrade.credits} ساعات معتمدة</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{subjectGrade.grade}</div>
                          <div className="text-sm text-gray-600">{subjectGrade.points} نقاط</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">توزيع الدرجات</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {[
                    { range: '90-100%', count: grades.filter(g => g.percentage >= 90).length, color: 'bg-green-500' },
                    { range: '80-89%', count: grades.filter(g => g.percentage >= 80 && g.percentage < 90).length, color: 'bg-blue-500' },
                    { range: '70-79%', count: grades.filter(g => g.percentage >= 70 && g.percentage < 80).length, color: 'bg-yellow-500' },
                    { range: '60-69%', count: grades.filter(g => g.percentage >= 60 && g.percentage < 70).length, color: 'bg-orange-500' },
                    { range: 'أقل من 60%', count: grades.filter(g => g.percentage < 60).length, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.range} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded ${item.color} mr-3`}></div>
                        <span className="text-sm text-gray-600">{item.range}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${(item.count / grades.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">أداء المواد</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {subjectGrades.map((subject) => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{subject.subject}</span>
                        <span className={`text-sm font-bold ${getGradeColor(subject.average)}`}>
                          {Math.round(subject.average)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            subject.color === 'blue' ? 'bg-blue-500' :
                            subject.color === 'green' ? 'bg-green-500' :
                            subject.color === 'purple' ? 'bg-purple-500' :
                            subject.color === 'orange' ? 'bg-orange-500' :
                            subject.color === 'teal' ? 'bg-teal-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${subject.average}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* نصائح للتحسين */}
        <Card className="bg-blue-50 border-blue-200">
          <CardBody>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">نصائح لتحسين الأداء الأكاديمي</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• ركز على المواد التي تحتاج تحسين فيها من خلال الممارسة الإضافية</li>
                  <li>• اطلب المساعدة من معلميك في المواضيع الصعبة</li>
                  <li>• أنشئ جدول دراسي منتظم للمراجعة اليومية</li>
                  <li>• شارك في الدروس التفاعلية وحل التمارين العملية</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* نافذة تفاصيل الدرجة */}
      {showGradeModal && selectedGrade && (
        <Modal
          isOpen={showGradeModal}
          onClose={() => setShowGradeModal(false)}
          title={`تفاصيل الدرجة - ${selectedGrade.title}`}
          size="md"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${getGradeColor(selectedGrade.percentage)}`}>
                  {selectedGrade.score}/{selectedGrade.maxScore}
                </div>
                <div className="text-sm text-gray-600">الدرجة المحققة</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${getGradeColor(selectedGrade.percentage)}`}>
                  {selectedGrade.percentage}%
                </div>
                <div className="text-sm text-gray-600">النسبة المئوية</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">المادة:</span>
                <span className="font-medium">{selectedGrade.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">نوع الاختبار:</span>
                <span className="font-medium">{selectedGrade.testType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">التاريخ:</span>
                <span className="font-medium">
                  {new Date(selectedGrade.date).toLocaleDateString('ar-EG')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المعلم:</span>
                <span className="font-medium">{selectedGrade.teacher}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">التقدير:</span>
                <Badge variant={getGradeBadgeVariant(selectedGrade.grade)}>
                  {selectedGrade.grade}
                </Badge>
              </div>
            </div>

            {selectedGrade.comments && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">ملاحظات المعلم</h4>
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-blue-800">{selectedGrade.comments}</p>
                </div>
              </div>
            )}

            {selectedGrade.classAverage && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">مقارنة مع الفصل</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedGrade.score}</div>
                    <div className="text-xs text-gray-600">درجتك</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedGrade.classAverage}</div>
                    <div className="text-xs text-gray-600">متوسط الفصل</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedGrade.classHighest}</div>
                    <div className="text-xs text-gray-600">أعلى درجة</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </StudentLayout>
  );
};