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
  id?: string;
  name: string;
  category: string;
  course: string;
  year: number;
  email: string;
  phone: string;
  enrollment_date: string;
  fee_status: string;
  total_fee: number;
  paid_fee: number;
  installment_amt: number;
  installments: number;
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
    year: 0,
    email: '',
    phone: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    fee_status: 'Unpaid',
    total_fee: 0,
    paid_fee: 0,
    installment_amt: 0,
    installments: 1,
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [feeAmount, setFeeAmount] = useState<number | null>(0);

  // Function to handle row click and navigate to student detail page
  const handleRowClick = (studentId?: string) => {
    if (studentId) {
      navigate(`/students/${studentId}`);
    }
  };

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
      'Year',
      'Email',
      'Phone',
      'Enrollment Date',
      'Fee Status',
      'Total Fee',
      'Paid Fee',
      'Remaining Fee',
      'Installment Amount',
      'Installments'
    ];

    const csvRows = [
      headers.join(','), // header row first
      ...filteredStudents.map((student) => {
        const row = [
          student.id ?? '',
          `"${student.name.replace(/"/g, '""')}"`,
          `"${student.category.replace(/"/g, '""')}"`,
          `"${student.course.replace(/"/g, '""')}"`,
          student.year,
          `"${student.email.replace(/"/g, '""')}"`,
          `"${student.phone.replace(/"/g, '""')}"`,
          student.enrollment_date,
          student.fee_status,
          student.total_fee,
          student.paid_fee,
          (student.total_fee || 0) - (student.paid_fee || 0),
          student.installment_amt,
          student.installments,
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
    'Entrance Exams'
  ];

  const schoolCourses = [
    'SSC',
    'CBSE',
    'ICSE',
    'Others',
  ];

  const juniorCollegeCourses = ['Science', 'Commerce', 'Arts'];

  const diplomaBranches = ['Computer Science', 'Mechanical', 'Electrical', 'Civil'];



  const entranceExamCourses = ['NEET', 'JEE', 'MHTCET', 'Boards'];

  useEffect(() => {
    switch (selectedCategory) {
      case 'School':
        setStudentCourses(schoolCourses);
        break;
      case 'Junior College':
        setStudentCourses(juniorCollegeCourses);
        break;
      case 'Diploma':
        setStudentCourses(diplomaBranches);
        break;
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
      year: 0,
      email: '',
      phone: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      fee_status: 'Unpaid',
      total_fee: 0,
      paid_fee: 0,
      installment_amt: 0,
      installments: 1
    });
    setAddError(null);
    setStudentCourses(schoolCourses);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'total_fee') {
      const totalFeeNum = Number(value);
      let installmentsNum = newStudent.installments;
      if (installmentsNum < 1) installmentsNum = 1;
      if (installmentsNum > 24) installmentsNum = 24;
      const installmentAmt = installmentsNum > 0 ? totalFeeNum / installmentsNum : 0;
      setNewStudent((prev) => ({
        ...prev,
        total_fee: totalFeeNum,
        installment_amt: installmentAmt,
      }));
    } else if (name === 'installments') {
      let installmentsNum = Number(value);
      if (installmentsNum < 1) installmentsNum = 1;
      if (installmentsNum > 24) installmentsNum = 24;
      const installmentAmt = installmentsNum > 0 ? (newStudent.total_fee || 0) / installmentsNum : 0;
      setNewStudent((prev) => ({
        ...prev,
        installments: installmentsNum,
        installment_amt: installmentAmt,
      }));
    } else {
      setNewStudent((prev) => ({
        ...prev,
        [name]: name === 'paid_fee' ? Number(value) : value,
      }));
    }
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

      // parse numeric fields before submit
      const totalFeeNum = Number(newStudent.total_fee);
      const installmentsNum = Math.min(Math.max(Number(newStudent.installments), 1), 24);
      const installmentAmtNum = installmentsNum > 0 ? totalFeeNum / installmentsNum : 0;

      const studentToInsert = {
        ...newStudent,
        total_fee: totalFeeNum,
        installments: installmentsNum,
        installment_amt: installmentAmtNum,
      };

      const { error } = await supabase.from('students').insert([studentToInsert]);
      if (error) {
        setAddError(error.message);
      } else {
        setShowAddModal(false);
        fetchStudents();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAddError(err.message);
      } else {
        setAddError(String(err));
      }
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

  const handleFeeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeeAmount(Number(e.target.value));
  };

  const handleFeeUpdate = async () => {
    if (feeAmount === null || feeAmount <= 0) {
      setAddError('Please enter a positive amount.');
      return;
    }
    const updatedPaidFee = (newStudent.paid_fee || 0) + feeAmount;
    const totalFeeNum = Number(newStudent.total_fee) || 0;
    const updatedFeeStatus = updatedPaidFee >= totalFeeNum ? 'Paid' : 'Partial';

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAddError(err.message);
      } else {
        setAddError(String(err));
      }
    }
    setAdding(false);
  };

  const getRemainingFee = (student: Student) => {
    const totalFeeNum = Number(student.total_fee) || 0;
    return totalFeeNum - (student.paid_fee || 0);
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
              title="text"
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
      <div className="table-container overflow-x-auto">
        <table className="data-table rounded-xl">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Category</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Course</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Year</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Contact</th>
              {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Enrollment</th> */}
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Fee Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Installments</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Installment Amount</th>
              {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Remaining Fee</th> */}
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Object.entries(
              filteredStudents.reduce((acc, student) => {
                if (!acc[student.category]) {
                  acc[student.category] = {};
                }
                if (!acc[student.category][student.course]) {
                  acc[student.category][student.course] = [];
                }
                acc[student.category][student.course].push(student);
                return acc;
              }, {} as Record<string, Record<string, Student[]>>)
            ).map(([category, courses]) => (
              <React.Fragment key={category}>
                <tr className="bg-gray-200">
                  <td colSpan={9} className="px-4 py-2 font-bold text-xl text-blue-800">
                    {category}
                  </td>
                </tr>
                {Object.entries(courses).map(([course, students]) => (
                  <React.Fragment key={course}>
                    <tr className="bg-gray-100">
                      <td colSpan={9} className="px-6 py-1 font-small text-md text-blue-200">
                        {course}
                      </td>
                    </tr>
                    {students.map((student) => (
                      <tr key={student.id} onClick={() => handleRowClick(student.id)} className="cursor-pointer">
                        <td className="px-4 py-2 font-medium">{student.name}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 text-sm  text-blue-800">{student.category}</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 text-sm text-purple-800">{student.course}</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 text-sm text-purple-800">{student.year}</span>
                        </td>
                        <td className="px-4 py-2">
                          <div>{student.phone}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className={`px-4 py-2 text-xs font-medium ${student.fee_status === 'Paid' ? 'text-green-700' :
                          student.fee_status === 'Partial' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                          {student.fee_status}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">{student.installments}</td>
                        <td className="px-4 py-2 text-sm font-medium">₹{student.installment_amt.toFixed(2)}</td>
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
                  </React.Fragment>
                ))}
              </React.Fragment>
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
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={newStudent.year}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={1}
                  max={13}
                  required
                />
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
                  required
                />
              </div>
              <div>
                <label htmlFor="installments" className="block text-sm font-medium text-gray-700">Installments (1-24)</label>
                <input
                  type="number"
                  name="installments"
                  id="installments"
                  value={newStudent.installments || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={1}
                  max={24}
                  required
                />
              </div>
              <div>
                <label htmlFor="installment_amt" className="block text-sm font-medium text-gray-700">Installment Amount (₹)</label>
                <input
                  type="number"
                  name="installment_amt"
                  id="installment_amt"
                  value={isNaN(newStudent.installment_amt) ? '' : Number(newStudent.installment_amt.toFixed(2))}
                  readOnly
                  className="input-field mt-1 bg-gray-100 cursor-not-allowed"
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
                    value={feeAmount ?? ''}
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