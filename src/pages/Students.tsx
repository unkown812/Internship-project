import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Download,
  Users,
  XCircle,
} from 'lucide-react';
import supabase from '../lib/supabase';

interface Student {
  id?: number;
  name: string;
  category: string;
  course: string;
  email: string;
  phone: string;
  enrollment_date: string;
  fee_status: string;
  total_fee: number; // total fee amount for the student
  paid_fee: number;  // amount paid so far
}

const Students: React.FC = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [studentCourses, setStudentCourses] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Student>({
    name: '',
    category: 'School',
    course: '',
    email: '',
    phone: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    fee_status: 'Unpaid',
    total_fee: 0,
    paid_fee: 0,
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [feeAmount, setFeeAmount] = useState<number>(0);

  // Function to handle row click and navigate to student detail page
  const handleRowClick = (studentId?: number) => {
    if (studentId) {
      navigate(`/students/${studentId}`);
    }
  };

  // Function to convert data to CSV and trigger download
  const exportToCSV = () => {
    if (filteredStudents.length === 0) {
      alert('No student data to export.');
      return;
    }

    const headers = [
      'ID',
      'Name',
      'Category',
      'Course',
      'Email',
      'Phone',
      'Enrollment Date',
      'Fee Status',
      'Total Fee',
      'Paid Fee',
      'Remaining Fee',
    ];

    const csvRows = [
      headers.join(','), // header row first
      ...filteredStudents.map((student) => {
        const row = [
          student.id ?? '',
          `"${student.name.replace(/"/g, '""')}"`,
          `"${student.category.replace(/"/g, '""')}"`,
          `"${student.course.replace(/"/g, '""')}"`,
          `"${student.email.replace(/"/g, '""')}"`,
          `"${student.phone.replace(/"/g, '""')}"`,
          student.enrollment_date,
          student.fee_status,
          student.total_fee,
          student.paid_fee,
          (student.total_fee || 0) - (student.paid_fee || 0),
        ];
        return row.join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('students').select('*');

    if (error) {
      setError(error.message);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  const studentCategories = [
    'School',
    'Junior College',
    'Diploma',
    'Degree',
    'Entrance Exams'
  ];

  // Define courses for each category
  const schoolCourses = [
    'SSC 8th',
    'SSC 9th',
    'SSC 10th',
    'CBSE 8th',
    'CBSE 9th',
    'CBSE 10th',
    'ICSE 8th',
    'ICSE 9th',
    'ICSE 10th',
    'Others',
  ];

  const juniorCollegeCourses = ['Science', 'Commerce', 'Arts'];

  const diplomaBranches = ['Computer Science', 'Mechanical', 'Electrical', 'Civil'];
  const diplomaYears = ['1st Year', '2nd Year', '3rd Year'];

  const degreeBranches = ['B.Tech Computer Science', 'B.Tech Mechanical', 'B.Com', 'B.A'];
  const degreeYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const entranceExamCourses = ['NEET', 'JEE', 'MHTCET', 'Boards'];

  useEffect(() => {
    switch (selectedCategory) {
      case 'School':
        setStudentCourses(schoolCourses);
        break;
      case 'Junior College':
        setStudentCourses(juniorCollegeCourses);
        break;
      case 'Diploma': {
        const diplomaCourses: string[] = [];
        for (const branch of diplomaBranches) {
          for (const year of diplomaYears) {
            diplomaCourses.push(`${branch} - ${year}`);
          }
        }
        setStudentCourses(diplomaCourses);
        break;
      }
      case 'Degree': {
        const degreeCourses: string[] = [];
        for (const branch of degreeBranches) {
          for (const year of degreeYears) {
            degreeCourses.push(`${branch} - ${year}`);
          }
        }
        setStudentCourses(degreeCourses);
        break;
      }
      case 'Entrance Exams':
        setStudentCourses(entranceExamCourses);
        break;
      default:
        setStudentCourses([]);
    }
  }, [selectedCategory]);

  const feeStatuses = ['Paid', 'Partial', 'Unpaid'];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.id && student.id.toString().includes(searchTerm)) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || student.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddNewStudent = () => {
    setShowAddModal(true);
    setNewStudent({
      name: '',
      category: 'School',
      course: '',
      email: '',
      phone: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      fee_status: 'Unpaid',
      total_fee: null, 
      paid_fee: null,
    });
    setAddError(null);
    setStudentCourses(schoolCourses);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: name === 'total_fee' || name === 'paid_fee' ? Number(value) : value,
    }));
  };

  const handleAddStudentSubmit = async () => {
    setAdding(true);
    setAddError(null);
    try {
      if (!newStudent.name || !newStudent.email || !newStudent.phone || !newStudent.course) {
        setAddError('Please fill in all required fields.');
        setAdding(false);
        return;
      }

      const { error } = await supabase.from('students').insert([newStudent]);
      if (error) {
        setAddError(error.message);
      } else {
        setShowAddModal(false);
        fetchStudents();
      }
    } catch (err: any) {
      setAddError(err.message);
    }
    setAdding(false);
  };

  // Open fee update modal
  const handleOpenFeeModal = (student: Student) => {
    setNewStudent(student);
    setFeeAmount(null);
    setAddError(null);
    setShowFeeModal(true);
  };

  // Handle fee amount change
  const handleFeeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeeAmount(Number(e.target.value));
  };

  // Save fee status and update paid_fee
  const handleFeeUpdate = async () => {
    if (feeAmount <= 0) {
      setAddError('Please enter a positive amount.');
      return;
    }
    const updatedPaidFee = (newStudent.paid_fee || 0) + feeAmount;
    const updatedFeeStatus = updatedPaidFee >= (newStudent.total_fee || 0) ? 'Paid' : 'Partial';

    setAdding(true);
    setAddError(null);
    try {
      const { error } = await supabase
        .from('students')
        .update({ paid_fee: updatedPaidFee, fee_status: updatedFeeStatus })
        .eq('id', newStudent.id);

      if (error) {
        setAddError(error.message);
      } else {
        setShowFeeModal(false);
        fetchStudents();
      }
    } catch (err: any) {
      setAddError(err.message);
    }
    setAdding(false);
  };

  // Calculate remaining fee
  const getRemainingFee = (student: Student) => {
    return (student.total_fee || 0) - (student.paid_fee || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Student Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all students</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn-primary flex items-center" onClick={handleAddNewStudent}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Search Input */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students by name, ID, or email..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter & Export */}
        <div className="flex space-x-4">
          <div className="relative">
            <select
              title="SelectCat"
              className="input-field appearance-none pr-8"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {studentCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <button className="btn-secondary flex items-center" onClick={exportToCSV}>
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Loading and Error Messages */}
      {loading && <div>Loading students...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {/* Students Count */}
      <div className="flex items-center text-sm text-gray-500">
        <Users className="h-4 w-4 mr-1" />
        <span>
          Showing {filteredStudents.length} out of {students.length} students
        </span>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Category</th>
              {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Course</th> */}
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Contact</th>
              {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Enrollment</th> */}
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Fee Status</th>
              {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Remaining Fee</th> */}
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} onClick={() => handleRowClick(student.id)} className="cursor-pointer">
                <td className="px-4 py-2 font-medium">{student.name}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 text-x text-blue-800">{student.category}</span>
                </td>
                {/* <td className="px-4 py-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{student.course}</span>
                </td> */}
                <td className="px-4 py-2">
                  <div>{student.phone}</div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </td>
                {/* <td className="px-4 py-2">{new Date(student.enrollment_date).toLocaleDateString()}</td> */}
                <td className={`px-10  py-1  m-3 text-xs font-medium ${student.fee_status === 'Paid' ? ' text-green-800' : student.fee_status === 'Partial' ? ' text-yellow-500' : ' text-red-800'}`}>
                  {student.fee_status}
                </td>
                {/* <td className="px-4 py-2 font-medium text-gray-700">₹{getRemainingFee(student)}</td> */}
                <td className="px-1 py-1">
                  <Link to={`/students/${student.id}`} className="text-blue-600 hover:text-blue-800 font-small">
                    Details 
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenFeeModal(student);
                    }}
                    className="text-blue-400 hover:text-black-800 font-small inline-block ml-2"
                  >
                    Fees
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-700 space-y-2 md:space-y-0">
        <div>
          Showing {' '}
          <span className="font-medium text-primary">{filteredStudents.length}</span> students
        </div>
        {/* <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded bg-gray-50">Previous</button>
          <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
          <button className="px-3 py-1 border rounded">2</button>
          <button className="px-3 py-1 border rounded">3</button>
          <button className="px-3 py-1 border rounded bg-gray-50">Next</button>
        </div> */}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Student</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            {addError && <div className="mb-4 text-red-600 font-medium">{addError}</div>}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  id="category"
                  value={newStudent.category}
                  onChange={(e) => {
                    handleInputChange(e);
                    setNewStudent(prev => ({ ...prev, course: '' }));
                    setSelectedCategory(e.target.value);
                  }}
                  className="input-field mt-1"
                >
                  {studentCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
                <select
                  name="course"
                  id="course"
                  value={newStudent.course}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                  disabled={studentCourses.length === 0}
                >
                  <option value="" disabled>Select course</option>
                  {studentCourses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={newStudent.phone}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="enrollment_date" className="block text-sm font-medium text-gray-700">Enrollment Date</label>
                <input
                  type="date"
                  name="enrollment_date"
                  id="enrollment_date"
                  value={newStudent.enrollment_date}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="total_fee" className="block text-sm font-medium text-gray-700">Total Fee (₹)</label>
                <input
                  type="number"
                  name="total_fee"
                  id="total_fee"
                  value={newStudent.total_fee}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={0}
                />
              </div>
              <div>
                <label htmlFor="fee_status" className="block text-sm font-medium text-gray-700">Fee Status</label>
                <select
                  name="fee_status"
                  id="fee_status"
                  value={newStudent.fee_status}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                >
                  {feeStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)} disabled={adding}>Cancel</button>
              <button className="btn-primary" onClick={handleAddStudentSubmit} disabled={adding}>
                {adding ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Update Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Update Fee for {newStudent.name}</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowFeeModal(false)}
                aria-label="Close fee modal"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            {addError && <div className="mb-4 text-red-600 font-medium">{addError}</div>}
            <div className="space-y-4">
              <p>Total Fee: ₹{newStudent.total_fee}</p>
              <p>Paid Fee: ₹{newStudent.paid_fee}</p>
              <p>Remaining Fee: ₹{getRemainingFee(newStudent)}</p>
              {(newStudent.fee_status === 'Unpaid' || newStudent.fee_status === 'Partial') && (
                <div>
                  <label htmlFor="feeAmount" className="block text-sm font-medium text-gray-700">
                    Add Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="feeAmount"
                    min={0}
                    value={feeAmount}
                    onChange={handleFeeAmountChange}
                    className="input-field mt-1"
                    placeholder="Enter amount to add"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button className="btn-secondary" onClick={() => setShowFeeModal(false)} disabled={adding}>Cancel</button>
              {(newStudent.fee_status === 'Unpaid' || newStudent.fee_status === 'Partial') && (
                <button className="btn-primary" onClick={handleFeeUpdate} disabled={adding}>
                  {adding ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;