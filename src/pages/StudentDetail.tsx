import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Clock, Trash2, Mail, Phone, MapPin, 
  Calendar, BookOpen, CreditCard, TrendingUp, CalendarCheck 
} from 'lucide-react';
import { studentService } from '../services/studentService';
// import TabNav from '../components/ui/TabNav';
import StudentFeeHistory from '../components/students/StudentFeeHistory';
import StudentAttendance from '../components/students/StudentAttendance';
import StudentPerformance from '../components/students/StudentPerformance';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import { useNavigate } from 'react-router-dom';

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [student, setStudent] = React.useState<any|null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const editStudent = () => {
    if (id) {
      navigate(`/students/edit/${id}`);
    }
  };

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    studentService.getById(id)
      .then(data => {
        setStudent(data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load student data');
        setStudent(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl font-medium text-gray-600">{error || 'Student not found'}</p>
        <Link to="/students" className="mt-4 text-primary hover:underline
        ">
          Back to Students
        </Link>
      </div>
    );
  }
  
  // const tabs = [
  //   { id: 'overview', label: 'Overview' },
  //   { id: 'fees', label: 'Fee History' },
  //   { id: 'attendance', label: 'Attendance' },
  //   { id: 'performance', label: 'Performance' }
  // ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/students" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
          <span className="ml-4 badge badge-blue">{student.category}</span>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center" onClick={editStudent}>
            <Edit className="h-4 w-4 mr-2" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Student details */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:space-x-6">
            {/* Profile image and basic info */}
            <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold">
                {student.name.charAt(0)}
              </div>
              <div className="mt-4 text-center md:text-left">
                <h2 className="text-lg font-semibold">{student.name}</h2>
                <p className="text-sm text-gray-600">ID: {student.id}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Enrolled on {student.enrollmentDate}</span>
                </div>
              </div>
            </div>
            
            {/* Contact details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{student.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{student.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">{student.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-gray-900">{student.dob}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="text-gray-900">{student.course}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Fee Status</p>
                    <span 
                      className={`badge ${
                        student.feeStatus === 'Paid' ? 'badge-green' : 
                        student.feeStatus === 'Partial' ? 'badge-yellow' : 
                        'badge-red'
                      }`}
                    >
                      {student.feeStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      {/* <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      
      {/* Tab content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-blue-50 border-none">
                <div className="flex items-center">
                  
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Attendance</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">92%</p>
                    <p className="mt-1 text-sm text-gray-600">Last 30 days</p>
                  </div>
                </div>
              </div>
              
              <div className="card bg-green-50 border-none">
                <div className="flex items-center">
                  
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Performance</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">78%</p>
                    <p className="mt-1 text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
              </div>
              
              <div className="card bg-orange-50 border-none">
                <div className="flex items-center">
                  
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Fee</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">₹12,500</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {student.feeStatus === 'Paid' ? 'Fully Paid' : 
                       student.feeStatus === 'Partial' ? 'Remaining: ₹7,500' : 
                       'Unpaid'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Activities</h3>
              <div className="border rounded-lg divide-y">
                <div className="p-4 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Attended Physics Class</p>
                    <p className="text-sm text-gray-500">May 10, 2025 • 10:30 AM</p>
                  </div>
                </div>
                <div className="p-4 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                   
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Scored 92% in Monthly Test</p>
                    <p className="text-sm text-gray-500">May 8, 2025 • Chemistry</p>
                  </div>
                </div>
                <div className="p-4 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Fee Payment - ₹5,000</p>
                    <p className="text-sm text-gray-500">May 5, 2025 • Second Installment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'fees' && <StudentFeeHistory studentId={student.id} />}
        {activeTab === 'attendance' && <StudentAttendance studentId={student.id} />}
        {activeTab === 'performance' && <StudentPerformance studentId={student.id} />}
      </div>
    </div>
  );
};

export default StudentDetail;
