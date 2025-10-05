import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Modal, Input, Textarea } from '../../components/ui';
import { GuardianLayout } from './GuardianLayout';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'guardian' | 'teacher' | 'admin';
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'message' | 'announcement' | 'alert';
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone?: string;
  lastContact?: string;
  children: string[];
}

export const GuardianCommunication: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    fetchCommunicationData();
  }, []);

  const fetchCommunicationData = async () => {
    try {
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 't1',
          senderName: 'أحمد محمد',
          senderType: 'teacher',
          recipientId: 'g1',
          recipientName: 'محمد أحمد',
          subject: 'تحديث درجات الرياضيات',
          content: 'تم تحديث درجات اختبار المعادلات الخطية. يمكنكم مراجعة الدرجات الجديدة في قسم الدرجات.',
          date: '2024-01-15T10:30:00',
          read: false,
          priority: 'medium',
          type: 'message'
        },
        {
          id: '2',
          senderId: 't2',
          senderName: 'فاطمة حسن',
          senderType: 'teacher',
          recipientId: 'g1',
          recipientName: 'محمد أحمد',
          subject: 'واجب منزلي جديد',
          content: 'تم إضافة واجب منزلي جديد في التعبير الكتابي. تاريخ التسليم: 2024-01-25',
          date: '2024-01-14T14:20:00',
          read: true,
          priority: 'high',
          type: 'message'
        },
        {
          id: '3',
          senderId: 'admin',
          senderName: 'إدارة المدرسة',
          senderType: 'admin',
          recipientId: 'all',
          recipientName: 'جميع أولياء الأمور',
          subject: 'اجتماع أولياء الأمور',
          content: 'سيتم عقد اجتماع أولياء الأمور يوم السبت الموافق 2024-01-27 في تمام الساعة 10:00 صباحاً.',
          date: '2024-01-13T09:00:00',
          read: true,
          priority: 'high',
          type: 'announcement'
        }
      ];

      setMessages(mockMessages);

      const mockTeachers: Teacher[] = [
        {
          id: 't1',
          name: 'أحمد محمد',
          subject: 'الرياضيات',
          email: 'ahmed.mohamed@roya.edu',
          phone: '+20 10 1234 5678',
          lastContact: '2024-01-15',
          children: ['أحمد محمد علي', 'فاطمة أحمد علي']
        },
        {
          id: 't2',
          name: 'فاطمة حسن',
          subject: 'اللغة العربية',
          email: 'fatima.hassan@roya.edu',
          phone: '+20 10 9876 5432',
          lastContact: '2024-01-14',
          children: ['أحمد محمد علي']
        },
        {
          id: 't3',
          name: 'محمد علي',
          subject: 'العلوم',
          email: 'mohamed.ali@roya.edu',
          phone: '+20 11 5555 6666',
          lastContact: '2024-01-12',
          children: ['أحمد محمد علي', 'فاطمة أحمد علي']
        }
      ];

      setTeachers(mockTeachers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching communication data:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.recipientId || !newMessage.subject || !newMessage.content) return;

    try {
      const message: Message = {
        id: Date.now().toString(),
        senderId: 'g1',
        senderName: 'محمد أحمد',
        senderType: 'guardian',
        recipientId: newMessage.recipientId,
        recipientName: teachers.find(t => t.id === newMessage.recipientId)?.name || '',
        subject: newMessage.subject,
        content: newMessage.content,
        date: new Date().toISOString(),
        read: false,
        priority: newMessage.priority,
        type: 'message'
      };

      setMessages(prev => [message, ...prev]);
      setShowNewMessageModal(false);
      setNewMessage({ recipientId: '', subject: '', content: '', priority: 'medium' });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  if (loading) {
    return (
      <GuardianLayout title="التواصل مع المدرسين">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الرسائل...</p>
          </div>
        </div>
      </GuardianLayout>
    );
  }

  return (
    <GuardianLayout
      title="التواصل مع المدرسين"
      subtitle="تواصل مع معلمي أبنائك وإدارة المدرسة"
      actions={
        <Button onClick={() => setShowNewMessageModal(true)}>
          رسالة جديدة
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المدرسين */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">معلمو أبنائي</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTeacher?.id === teacher.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedTeacher(teacher)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{teacher.name}</div>
                      <div className="text-sm text-gray-600">{teacher.subject}</div>
                      <div className="text-xs text-gray-500">{teacher.email}</div>
                    </div>
                    {teacher.lastContact && (
                      <div className="text-xs text-gray-500">
                        آخر تواصل: {new Date(teacher.lastContact).toLocaleDateString('ar-EG')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* الرسائل */}
        <div className="lg:col-span-2 space-y-6">
          {/* إحصائيات التواصل */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">{messages.length}</div>
                <div className="text-sm text-gray-600">إجمالي الرسائل</div>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">{unreadCount}</div>
                <div className="text-sm text-gray-600">رسائل غير مقروءة</div>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">{teachers.length}</div>
                <div className="text-sm text-gray-600">معلم متاح</div>
              </CardBody>
            </Card>
          </div>

          {/* قائمة الرسائل */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">الرسائل الأخيرة</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      !message.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          message.senderType === 'teacher' ? 'bg-green-100 text-green-600' :
                          message.senderType === 'admin' ? 'bg-purple-100 text-purple-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {message.senderType === 'teacher' ? 'م' : message.senderType === 'admin' ? 'إ' : 'و'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{message.senderName}</span>
                            <Badge variant={
                              message.priority === 'high' ? 'danger' :
                              message.priority === 'medium' ? 'warning' : 'secondary'
                            }>
                              {message.priority === 'high' ? 'عاجل' :
                               message.priority === 'medium' ? 'مهم' : 'عادي'}
                            </Badge>
                            {!message.read && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(message.date).toLocaleDateString('ar-EG')} - {new Date(message.date).toLocaleTimeString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* نصائح للتواصل الفعال */}
          <Card className="bg-green-50 border-green-200">
            <CardBody>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-green-900 mb-1">نصائح للتواصل الفعال مع المدرسين</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• كن مهذباً ولطيفاً في جميع رسائلك</li>
                    <li>• كن واضحاً وموجزاً في طرح استفساراتك</li>
                    <li>• رد على الرسائل في وقت مناسب</li>
                    <li>• احتفظ بسجل لجميع المحادثات المهمة</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* نافذة إرسال رسالة جديدة */}
      {showNewMessageModal && (
        <Modal
          isOpen={showNewMessageModal}
          onClose={() => setShowNewMessageModal(false)}
          title="إرسال رسالة جديدة"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستلم
              </label>
              <select
                value={newMessage.recipientId}
                onChange={(e) => setNewMessage(prev => ({ ...prev, recipientId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">اختر المستلم</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name} - {teacher.subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                موضوع الرسالة
              </label>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="أدخل موضوع الرسالة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                محتوى الرسالة
              </label>
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                placeholder="اكتب رسالتك هنا..."
                rows={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأولوية
              </label>
              <select
                value={newMessage.priority}
                onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">عادية</option>
                <option value="medium">مهمة</option>
                <option value="high">عاجلة</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowNewMessageModal(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSendMessage}>
                إرسال الرسالة
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </GuardianLayout>
  );
};