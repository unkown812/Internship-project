import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
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
  year: number;
  email: string;
  phone: string;
  enrollment_date: string;
  fee_status: string;
  total_fee: number; // total fee amount for the student
  paid_fee: number;  // amount paid so far
  due_amount: number;
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
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState(0);
  const [yearOptionsJuniorCollege] = useState<number[]>([1, 2]);
  const [yearOptionsDiploma] = useState<number[]>([1, 2, 3]);
  const [yearOptionsSchool] = useState<number[]>([5,6,7,8,9,10]);
  const [studentCourses, setStudentCourses] = useState<string[]>([]);
  // Removed unused studentYear and setStudentYear
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Student>({
    name: '',
    category: 'School',
    course: '',
    year: 1,
    email: '',
    phone: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    fee_status: 'Unpaid',
    total_fee: 0,
    paid_fee: 0,
    due_amount: 0,
    installment_amt: 0,
    installments: 1,
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [feeAmount, setFeeAmount] = useState<number | null>(null);

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
      // Calculate due_amount as total_fee - paid_fee for each student
      const studentsWithDue = (data || []).map(student => ({
        ...student,
        due_amount: (student.total_fee || 0) - (student.paid_fee || 0),
      }));
      setStudents(studentsWithDue);
    }
    setLoading(false);
  };

  const studentCategories = [
    'School',
    'Junior College',
    'Diploma',
    'Entrance Exams'
  ];

  // Define courses for each category
  const schoolCourses = [
    'SSC',
    'CBSE',
    'ICSE',
    'Others',
  ];

  const juniorCollegeCourses = ['Science', 'Commerce', 'Arts'];

  const diplomaCourses = ['Computer Science', 'Mechanical', 'Electrical', 'Civil'];

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
        setStudentCourses(diplomaCourses);
        break;
      }
      case 'Entrance Exams':
        setStudentCourses(entranceExamCourses);
        break;
      default:
        setStudentCourses([]);
    }
    setSelectedCourse('All');
    setSelectedYear(0);
  }, [selectedCategory]);

  const feeStatuses = ['Paid', 'Partial', 'Unpaid'];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.id && student.id.toString().includes(searchTerm)) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || student.category === selectedCategory;

    const matchesCourse =
      selectedCourse === 'All' || student.course === selectedCourse;

    const matchesYear =
      selectedYear === 0 || student.year === selectedYear;

    return matchesSearch && matchesCategory && matchesCourse && matchesYear;
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
      due_amount: 0,
      installment_amt: 0,
      installments: 0,
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
    } else if (name === 'year') {
      setNewStudent((prev) => ({
        ...prev,
        year: Number(value),
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

      const totalFeeNum = Number(newStudent.total_fee);
      const installmentsNum = Math.min(Math.max(Number(newStudent.installments), 1), 24);
      const installmentAmtNum = installmentsNum > 0 ? totalFeeNum / installmentsNum : 0;
      const dueAmountNum = totalFeeNum - (newStudent.paid_fee || 0);

      const studentToInsert = {
        ...newStudent,
        total_fee: totalFeeNum,
        installments: installmentsNum,
        installment_amt: installmentAmtNum,
        due_amount: dueAmountNum,
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
        setAddError('An unknown error occurred.');
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

  // Handle fee amount change
  const handleFeeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeeAmount(Number(e.target.value));
  };

  // Save fee status and update paid_fee
  const handleFeeUpdate = async () => {
    if (!feeAmount || feeAmount <= 0) {
      setAddError('Please enter a positive amount.');
      return;
    }
    const updatedPaidFee = (newStudent.paid_fee || 0) + feeAmount;
    const updatedFeeStatus = updatedPaidFee >= (newStudent.total_fee || 0) ? 'Paid' : 'Partial';
    const updatedDueAmount = (newStudent.total_fee || 0) - updatedPaidFee;

    setAdding(true);
    setAddError(null);
    try {
      const { error } = await supabase
        .from('students')
        .update({ paid_fee: updatedPaidFee, fee_status: updatedFeeStatus, due_amount: updatedDueAmount })
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
        setAddError('An unknown error occurred.');
      }
    }
    setAdding(false);
  };

  // Calculate remaining fee
  const getRemainingFee = (student: Student) => {
    return (student.total_fee || 0) - (student.paid_fee || 0);
  };

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 ">
        {/* Search Input */}
        <div className="relative flex-grow flex items-center">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students by name, ID, or email..."
            className="input-field pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <button
            className={`btn text- ${selectedCategory === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>
          {studentCategories.map((category) => (
            <button
              key={category}
              className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Course selection based on category */}
        <div className="flex space-x-2 pl-4">
          <button
            className={`btn ${selectedCourse === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCourse('All')}
          >
            All
          </button>
          {studentCourses.map((course) => (
            <button
              key={course}
              className={`btn ${selectedCourse === course ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCourse(course)}
            >
              {course}
            </button>
          ))}
        </div>

        {/* Year selection based on course */}
        <div className="flex space-x-2 pl-8">
          <button
            className={`btn ${selectedYear === 0 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedYear(0)}
          >
            All
          </button>
          {(() => {
            const yearOptions = selectedCategory === 'School' ? yearOptionsSchool
              : selectedCategory === 'Diploma' ? yearOptionsDiploma
              : selectedCategory === 'Junior College' ? yearOptionsJuniorCollege
              : [];
            return yearOptions.map((year) => (
              <button
                key={year}
                className={`btn ${selectedYear === year ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ));
          })()}
        </div>

        <button className="btn-secondary flex items-center" onClick={exportToCSV}>
          <Download className="h-5 w-5 mr-2" />
          Export
        </button>
      </div>


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
      <div className="overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Category</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Course</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Year</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Contact</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Fee Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total Fee</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount Paid</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Due</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Installment Amount</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Installments</th>
              {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Remaining Fee</th> */}
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(() => {
              // Group students by category, then course, then year
              const grouped: Record<string, Record<string, Record<number, Student[]>>> = {};
              filteredStudents.forEach(student => {
                if (!grouped[student.category]) grouped[student.category] = {};
                if (!grouped[student.category][student.course]) grouped[student.category][student.course] = {};
                if (!grouped[student.category][student.course][student.year]) grouped[student.category][student.course][student.year] = [];
                grouped[student.category][student.course][student.year].push(student);
              });

              const rows: JSX.Element[] = [];
              Object.keys(grouped).forEach(category => {
                // rows.push(
                //   <tr key={`category-${category}`} className="bg-white">
                //     <td colSpan={8} className="px-4 py-2 font-bold text-lg text-gray-700 text-center">
                //       Category: {category}
                //     </td>
                //   </tr>
                // );
                Object.keys(grouped[category]).forEach(course => {
                  // rows.push(
                  //   <tr key={`course-${category}-${course}`} className="bg-white">
                  //     <td colSpan={8} className="px-6 py-1 font-semibold text-md text-gray-600 text-center">
                  //       Course: {course}
                  //     </td>
                  //   </tr>
                  // );
                  Object.keys(grouped[category][course]).sort((a, b) => Number(a) - Number(b)).forEach(yearStr => {
                    const year = Number(yearStr);
                    rows.push(
                      <tr key={`year-${category}-${course}-${year}`} className="bg-white">
                        <td colSpan={8} className="px-8 py-1 font-medium text-sm text-gray-500 text-center">
                          {category}  {course}  {year}
                        </td>
                      </tr>
                    );
                    grouped[category][course][year].forEach(student => {
                      rows.push(
                        <tr key={student.id} onClick={() => handleRowClick(student.id)} className="cursor-pointer">
                          <td className="px-4 py-2 font-medium">{student.name}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-x text-blue-800">{student.category}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-x text-blue-600">{student.course}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-x text-blue-400">{student.year}</span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-xs">{student.phone}</div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </td>
                          <td className={`px-10 py-1 m-3 text-x ${student.fee_status === 'Paid' ? 'text-green-800' : student.fee_status === 'Partial' ? 'text-yellow-500' : 'text-red-800'}`}>
                            {student.fee_status}
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-x text-secondary">{student.total_fee}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-x text-green-600">{student.paid_fee}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-x text-red-600">{student.due_amount}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-x text-purple-800">{student.installment_amt}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-x text-purple-800">{student.installments}</span>
                          </td>
                          <td className="px-1 py-1">
                            {/* <Link to={`/students/${student.id}`} className="text-blue-600 hover:text-blue-800 font-small">
                              Details
                            </Link> */}
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
                      );
                    });
                  });
                });
              });
              return rows;
            })()}
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
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={newStudent.year}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={1}
                  max={10}
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
                />
              </div>
              <div>
                <label htmlFor="installments" className="block text-sm font-medium text-gray-700">Installments (1-24)</label>
                <input
                  type="number"
                  name="installments"
                  id="installments"
                  value={newStudent.installments}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={1}
                  max={24}
                />
              </div>
              <div>
                <label htmlFor="installment_amt" className="block text-sm font-medium text-gray-700">Installment Amount (₹)</label>
                <input
                  type="number"
                  name="installment_amt"
                  id="installment_amt"
                  value={newStudent.installment_amt.toFixed(2)}
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