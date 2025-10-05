import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Table, Modal, Input } from '../../components/ui';
import { GuardianLayout } from './GuardianLayout';

interface ChildGrade {
  id: string;
  childId: string;
  childName: string;
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
  semester?: string;
}

interface ChildSummary {
  childId: string;
  childName: string;
  currentSemester: string;
  overallAverage: number;
  subjectsCount: number;
  subjects: {
    subject: string;
    average: number;
    trend: 'up' | 'down' | 'stable';
    teacher: string;
    lastGrade?: {
      score: number;
      maxScore: number;
      grade: string;
      date: string;
    };
  }[];
}

interface SemesterReport {
  childId: string;
  childName: string;
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

export const GuardianChildrenGrades: React.FC = () => {
  const [grades, setGrades] = useState<ChildGrade[]>([]);
  const [childrenSummaries, setChildrenSummaries] = useState<ChildSummary[]>([]);
  const [semesterReports, setSemesterReports] = useState<SemesterReport[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<ChildGrade | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'reports' | 'comparison'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    fetchGradesData();
  }, []);

  const fetchGradesData = async () => {
    try {
      // هنا سيتم استدعاء API الخاص بدرجات الأبناء
      // const response = await api.get('/guardian/children-grades');

      // بيانات تجريبية مؤقتة
      const mockGrades: ChildGrade[] = [
        {
          id: '1',
          childId: '1',
          childName: 'أحمد محمد علي',
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
          classHighest: 95,
          semester: 'الفصل الأول 2024'
        },
        {
          id: '2',
          childId: '1',
          childName: 'أحمد محمد علي',
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
          classHighest: 98,
          semester: 'الفصل الأول 2024'
        },
        {
          id: '3',
          childId: '2',
          childName: 'فاطمة أحمد علي',
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
          classHighest: 94,
          semester: 'الفصل الأول 2024'
        },
        {
          id: '4',
          childId: '1',
          childName: 'أحمد محمد علي',
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
          classHighest: 89,
          semester: 'الفصل الأول 2024'
        }
      ];

      setGrades(mockGrades);

      // إنشاء ملخصات الأبناء
      const summaries: ChildSummary[] = [
        {
          childId: '1',
          childName: 'أحمد محمد علي',
          currentSemester: 'الفصل الأول 2024',
          overallAverage: 84.3,
          subjectsCount: 6,
          subjects: [
            {
              subject: 'الرياضيات',
              average: 80.5,
              trend: 'up',
              teacher: 'أحمد محمد',
              lastGrade: { score: 85, maxScore: 100, grade: 'جيد جداً', date: '2024-01-15' }
            },
            {
              subject: 'اللغة العربية',
              average: 92,
              trend: 'stable',
              teacher: 'فاطمة حسن',
              lastGrade: { score: 92, maxScore: 100, grade: 'ممتاز', date: '2024-01-14' }
            },
            {
              subject: 'العلوم',
              average: 88,
              trend: 'up',
              teacher: 'محمد علي',
              lastGrade: { score: 88, maxScore: 100, grade: 'جيد جداً', date: '2024-01-12' }
            }
          ]
        },
        {
          childId: '2',
          childName: 'فاطمة أحمد علي',
          currentSemester: 'الفصل الأول 2024',
          overallAverage: 91.2,
          subjectsCount: 5,
          subjects: [
            {
              subject: 'اللغة العربية',
              average: 95,
              trend: 'up',
              teacher: 'فاطمة حسن',
              lastGrade: { score: 95, maxScore: 100, grade: 'ممتاز', date: '2024-01-15' }
            },
            {
              subject: 'الرياضيات',
              average: 93,
              trend: 'stable',
              teacher: 'أحمد محمد',
              lastGrade: { score: 93, maxScore: 100, grade: 'ممتاز', date: '2024-01-13' }
            },
            {
              subject: 'العلوم',
              average: 88,
              trend: 'up',
              teacher: 'محمد علي',
              lastGrade: { score: 88, maxScore: 100, grade: 'جيد جداً', date: '2024-01-12' }
            }
          ]
        }
      ];

      setChildrenSummaries(summaries);

      // تقارير الفصل الدراسي
      const reports: SemesterReport[] = [
        {
          childId: '1',
          childName: 'أحمد محمد علي',
          semester: 'الفصل الدراسي الأول 2024',
          gpa: 3.4,
          totalCredits: 18,
          subjectsCount: 6,
          grades: [
            { subject: 'الرياضيات', grade: 'B+', credits: 3, points: 3.3 },
            { subject: 'اللغة العربية', grade: 'A', credits: 3, points: 4.0 },
            { subject: 'العلوم', grade: 'A-', credits: 3, points: 3.7 },
            { subject: 'التاريخ', grade: 'B', credits: 3, points: 3.0 },
            { subject: 'الجغرافيا', grade: 'B+', credits: 3, points: 3.3 },
            { subject: 'التربية الإسلامية', grade: 'A-', credits: 3, points: 3.7 }
          ]
        }
      ];

      setSemesterReports(reports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching grades data:', error);
      setLoading(false);
    }
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        );
      case 'down':
        return (
          <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || grade.subject === filterSubject;
    const matchesChild = !selectedChild || grade.childId === selectedChild;
    return matchesSearch && matchesSubject && matchesChild;
  });

  const subjects = [...new Set(grades.map(g => g.subject))];

  const gradesColumns = [
    {
      key: 'childName',
      title: 'الابن/الابنة',
      render: (value: string, record: ChildGrade) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary-600">
              {value.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{record.grade}</div>
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      title: 'المادة',
      render: (value: string, record: ChildGrade) => (
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
      key: 'title',
      title: 'عنوان الاختبار',
      render: (value: string, record: ChildGrade) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{record.testType}</div>
        </div>
      )
    },
    {
      key: 'score',
      title: 'الدرجة',
      render: (value: number, record: ChildGrade) => (
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
      render: (value: any, record: ChildGrade) => (
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
      <GuardianLayout title="درجات الأبناء">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الدرجات...</p>
          </div>
        </div>
      </GuardianLayout>
    );
  }

  return (
    <GuardianLayout
      title="درجات الأبناء"
      subtitle="متابعة أداء أبنائك الأكاديمي في جميع المواد"
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
              {childrenSummaries.map((child) => (
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

        {/* التبويبات */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'نظرة عامة' },
              { id: 'detailed', name: 'التفاصيل' },
              { id: 'reports', name: 'التقارير الفصلية' },
              { id: 'comparison', name: 'المقارنة' }
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {childrenSummaries
              .filter(child => !selectedChild || child.childId === selectedChild)
              .map((child) => (
              <Card key={child.childId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{child.childName}</h3>
                    <Badge variant="primary">{child.currentSemester}</Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {/* المعدل العام */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-3xl font-bold ${getGradeColor(child.overallAverage)}`}>
                        {child.overallAverage}%
                      </div>
                      <div className="text-sm text-gray-600">المعدل العام</div>
                    </div>

                    {/* المواد */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">أداء المواد</h4>
                      {child.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {subject.subject.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{subject.subject}</div>
                              <div className="text-sm text-gray-500">{subject.teacher}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getGradeColor(subject.average)}`}>
                                {subject.average}%
                              </div>
                              <div className="text-xs text-gray-500">المعدل</div>
                            </div>
                            {getTrendIcon(subject.trend)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="secondary" size="sm" className="w-full">
                      عرض التفاصيل الكاملة
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'detailed' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">جميع الدرجات</h3>
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

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {semesterReports
              .filter(report => !selectedChild || report.childId === selectedChild)
              .map((report) => (
              <Card key={`${report.childId}-${report.semester}`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.childName} - {report.semester}
                    </h3>
                    <Badge variant="primary">المعدل: {report.gpa}</Badge>
                  </div>
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

        {activeTab === 'comparison' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {childrenSummaries
              .filter(child => !selectedChild || child.childId === selectedChild)
              .map((child) => (
              <Card key={child.childId}>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">
                    مقارنة أداء {child.childName}
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {/* مقارنة مع المعدل العام */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">مقارنة مع أداء الفصل</h4>
                      <div className="space-y-2">
                        {child.subjects.map((subject, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-blue-800">{subject.subject}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-blue-600">
                                {subject.average}% (فردي)
                              </span>
                              <span className="text-sm text-blue-500">
                                82% (فصل)
                              </span>
                              <Badge variant={subject.average > 82 ? 'success' : subject.average > 75 ? 'warning' : 'danger'}>
                                {subject.average > 82 ? 'أعلى' : subject.average > 75 ? 'متوسط' : 'أقل'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* تطور الأداء */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">تطور الأداء</h4>
                      <div className="space-y-2">
                        {child.subjects.map((subject, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-green-800">{subject.subject}</span>
                            <div className="flex items-center space-x-2">
                              {getTrendIcon(subject.trend)}
                              <span className={`text-sm font-medium ${
                                subject.trend === 'up' ? 'text-green-600' :
                                subject.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {subject.trend === 'up' ? 'تحسن' :
                                 subject.trend === 'down' ? 'انخفاض' : 'مستقر'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* نصائح للآباء */}
        <Card className="bg-purple-50 border-purple-200">
          <CardBody>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-purple-900 mb-1">نصائح لمتابعة أداء أبنائك الأكاديمي</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• احرص على مراجعة الدرجات بانتظام مع أبنائك ومناقشة نقاط القوة والضعف</li>
                  <li>• شجع أبنائك على تحسين الأداء في المواد التي تحتاج تطوير</li>
                  <li>• تواصل مع المعلمين لفهم أسباب أي انخفاض في الأداء وكيفية المساعدة</li>
                  <li>• ساعد أبنائك في وضع خطط دراسية لتحسين الدرجات المنخفضة</li>
                  <li>• احتفل بالتحسن والإنجازات لتعزيز الثقة بالنفس</li>
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
                <span className="text-gray-600">الابن/الابنة:</span>
                <span className="font-medium">{selectedGrade.childName}</span>
              </div>
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
                    <div className="text-xs text-gray-600">درجة ابنك</div>
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
    </GuardianLayout>
  );
};
