import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Clock, Trash2, Mail, Phone, MapPin,
  Calendar, BookOpen, CreditCard, TrendingUp, CalendarCheck
} from 'lucide-react';
import TabNav from '../components/ui/TabNav';
import StudentFeeHistory from '../components/students/StudentFeeHistory';
import StudentAttendance from '../components/students/StudentAttendance';
import StudentPerformance from '../components/students/StudentPerformance';
import supabase from '../lib/supabase';
import { attendanceService } from '../services/attendanceService';
import { performanceService } from '../services/performanceService';
import { paymentService } from '../services/paymentService';

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState<any>(null);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setError(error.message);
        setStudent(null);
      } else {
        setStudent(data);
        setEditStudent(data);
      }
      setLoading(false);
    };
    if (id) {
      fetchStudent();
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setDataLoading(true);
      setDataError(null);
      try {
        const [attendanceData, performanceData, paymentData] = await Promise.all([
          attendanceService.getByStudentId(id),
          performanceService.getByStudentId(id),
          paymentService.getByStudentId(id),
        ]);
        setAttendance(attendanceData);
        setPerformance(performanceData);
        setPayments(paymentData);
      } catch (error: any) {
        setDataError(error.message || 'Failed to fetch data');
      }
      setDataLoading(false);
    };

    fetchData();
  }, [id]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditStudent((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('students')
      .update(editStudent)
      .eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      setStudent(editStudent);
      setIsEditing(false);
    }
    setSaving(false);
  };
  if (loading) {
    return <div>Loading student details...</div>;
  }
  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl font-medium text-gray-600">Student not found</p>
        <Link to="/students" className="mt-4 text-primary hover:underline">
          Back to Students
        </Link>
      </div>
    );
  }

  if (dataLoading) {
    return <div>Loading student related data...</div>;
  }

  if (dataError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl font-medium text-red-600">{dataError}</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'fees', label: 'Fee History' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'performance', label: 'Performance' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/students" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
          <span className="ml-4 badge badge-blue">{student.category}</span>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleEditClick} className="btn-secondary flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            aria-label="Delete student"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                try {
                  setLoading(true);
                  const { error } = await supabase
                    .from('students')
                    .delete()
                    .eq('id', id);
                  if (error) {
                    setError(error.message);
                    setLoading(false);
                    return;
                  }
                  window.location.href = '/students';
                } catch {
                  setError('Failed to delete student.');
                  setLoading(false);
                }
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {isEditing ? (
            <div>
              <h2 className="text-lg font-semibold">Edit Student Details</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={editStudent.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Name"
                />
                <input
                  type="email"
                  name="email"
                  value={editStudent.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Email"
                />
                <input
                  type="text"
                  name="phone"
                  value={editStudent.phone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  name="address"
                  value={editStudent.address}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Address"
                />
                <input
                  type="date"
                  name="dob"
                  value={editStudent.dob}
                  onChange={handleInputChange}
                  className="input"
                />
                <input
                  type="text"
                  name="course"
                  value={editStudent.course}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Course"
                />
                <button onClick={handleSave} className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div>
                <h2 className="text-lg font-semibold">{student.name}</h2>
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:space-x-3">
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
                          className={`badge ${student.feeStatus === 'Paid' ? 'badge-green' :
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
          )}
        </div>
      </div>

      <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-blue-50 border-none">
                <div className="flex items-center">
                  <div className="ml-4">
                    <h3 className="text-xl text-center font-medium text-gray-500 ">Attendance</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {attendance.length}
                    </p>
                    <p className="mt-1 text-xl text-gray-600 ml-2">Last 30 days</p>
                  </div>
                </div>
              </div>

              <div className="card bg-green-50 border-none">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <TrendingUp className="h-6 w-6 text-green-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Performance</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {performance.length > 0 ? Math.round(performance.reduce((acc, p) => acc + p.score, 0) / performance.length) : 'N/A'}%
                    </p>
                    <p className="mt-1 text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
              </div>

              <div className="card bg-orange-50 border-none">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <CreditCard className="h-6 w-6 text-orange-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Fee</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      ₹{payments.reduce((acc, p) => acc + p.amount, 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {student.feeStatus === 'Paid' ? 'Fully Paid' :
                        student.feeStatus === 'Partial' ? `Remaining: ₹${student.feeRemaining || '0'}` :
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
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CalendarCheck className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Attended Physics Class</p>
                    <p className="text-sm text-gray-500">May 10, 2025 • 10:30 AM</p>
                  </div>
                </div>
                <div className="p-4 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-700" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Scored 92% in Monthly Test</p>
                    <p className="text-sm text-gray-500">May 8, 2025 • Chemistry</p>
                  </div>
                </div>
                <div className="p-4 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-orange-700" />
                    </div>
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
