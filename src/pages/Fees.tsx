import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, Download } from 'lucide-react';
import supabase from '../lib/supabase';

interface Student {
  id: string;
  name: string;
  category: string;
  course: string;
  total_fee: number;
  paid_fee: number;
  due_amount: number;
  fee_status: 'Paid' | 'Partial' | 'Unpaid' | null;
  last_payment: string | null;
}

interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  description: string | null;
  created_at: string;
}

interface FeeSummary {
  id: string;
  name: string;
  category: string;
  course: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | null;
  lastPayment: string | null;
}

const Fees: React.FC = () => {
  const calculateDueAmount = (totalAmount: number, amountPaid: number): number => {
    return totalAmount - amountPaid;
  };

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [studentCourses, setStudentCourses] = useState<string[]>([]);
  const [studentYear, setStudentYear] = useState<number>(0);
  const [feeSummary, setFeeSummary] = useState<FeeSummary[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // yyyy-mm-dd format
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentDescription, setPaymentDescription] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedFeeForView, setSelectedFeeForView] = useState<FeeSummary | null>(null);
  
  // Add modal rendering for payment and view modals
  const PaymentModal = () => {
    if (!showPaymentModal || !selectedStudentId) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
          <form onSubmit={handlePaymentSubmit}>
            <div className="mb-4">
              <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="input-field mt-1"
                min={0}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="paymentDate"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="input-field mt-1"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-field mt-1"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="paymentDescription" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="paymentDescription"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
                className="input-field mt-1"
              />
            </div>
            {submitError && <div className="text-red-600 mb-4">{submitError}</div>}
            <div className="flex justify-end space-x-4">
              <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ViewModal = () => {
    if (!showViewModal || !selectedFeeForView) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <div>
            <p><strong>Name:</strong> {selectedFeeForView.name}</p>
            <p><strong>Category:</strong> {selectedFeeForView.category}</p>
            <p><strong>Course:</strong> {selectedFeeForView.course}</p>
            <p><strong>Total Amount:</strong> ₹{selectedFeeForView.totalAmount.toLocaleString()}</p>
            <p><strong>Amount Paid:</strong> ₹{selectedFeeForView.amountPaid.toLocaleString()}</p>
            <p><strong>Amount Due:</strong> ₹{selectedFeeForView.amountDue.toLocaleString()}</p>
            <p><strong>Status:</strong> {selectedFeeForView.status}</p>
            <p><strong>Last Payment:</strong> {selectedFeeForView.lastPayment}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="btn-primary" onClick={() => setShowViewModal(false)}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedFeeForView(null);
  };

  const handleFeeAction = (fee: FeeSummary) => {
    if (fee.amountDue > 0) {
      setSelectedStudentId(fee.id);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setSubmitError(null);
      setShowPaymentModal(true);
    } else {
      setSelectedFeeForView(fee);
      setShowViewModal(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to update due_amount in the database for all students based on total_fee and paid_fee
  const updateDueAmountsInDB = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('id, total_fee, paid_fee');
      if (studentsError) throw studentsError;

      if (studentsData && studentsData.length > 0) {
        for (const student of studentsData) {
          const dueAmount = calculateDueAmount(student.total_fee || 0, student.paid_fee || 0);
          await supabase
            .from('students')
            .update({ due_amount: dueAmount })
            .eq('id', student.id);
        }
      }
    } catch (err) {
      console.error('Error updating due amounts in DB:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Update due_amount in DB to keep it consistent
      await updateDueAmountsInDB();

      const summary = (studentsData || []).map((student: Student) => {
        return {
          id: student.id,
          name: student.name,
          category: student.category,
          course: student.course,
          totalAmount: student.total_fee || 0,
          amountPaid: student.paid_fee || 0,
          amountDue: student.due_amount || 0,
          status: student.fee_status,
          lastPayment: student.last_payment,
        };
      });
      setFeeSummary(summary);
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
    }
    setLoading(false);
  };

  const openPaymentModal = () => {
    setSelectedStudentId(null);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Cash');
    setPaymentDescription('');
    setSubmitError(null);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedStudentId) {
      setSubmitError('Please select a student.');
      return;
    }
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setSubmitError('Please enter a valid payment amount.');
      return;
    }
    if (!paymentDate) {
      setSubmitError('Please select a payment date.');
      return;
    }
    if (!paymentMethod) {
      setSubmitError('Please select a payment method.');
      return;
    }

    setSubmitLoading(true);

    try {
      const student = students.find(s => s.id === selectedStudentId);
      const totalFee = student?.total_fee || 0;
      const { error: insertError } = await supabase
        .from('payments')
        .insert([{
          student_id: selectedStudentId,
          amount: amountNum,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          status: 'Completed',
          description: paymentDescription || null,
        }]);
      if (insertError) throw insertError;

      // Recalculate total paid amount from payments table
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('student_id', selectedStudentId);
      if (paymentsError) throw paymentsError;
      const totalPaid = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Calculate new due amount
      const newDueAmount = totalFee - totalPaid;

      // Determine fee status
      let newFeeStatus: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
      if (newDueAmount <= 0 && totalFee > 0) {
        newFeeStatus = 'Paid';
      } else if (totalPaid > 0) {
        newFeeStatus = 'Partial';
      }

      // Update students table with new paid_fee, due_amount, fee_status, and last_payment
      const { error: updateError } = await supabase
        .from('students')
        .update({
          paid_fee: totalPaid,
          due_amount: newDueAmount,
          fee_status: newFeeStatus,
          last_payment: paymentDate,
        })
        .eq('id', selectedStudentId);
      if (updateError) throw updateError;

      // Update feeSummary state
      setFeeSummary(prevFeeSummary => {
        return prevFeeSummary.map(fee => {
          if (fee.id === selectedStudentId) {
            return {
              ...fee,
              amountPaid: totalPaid,
              amountDue: newDueAmount,
              status: newFeeStatus,
              lastPayment: paymentDate,
            };
          }
          return fee;
        });
      });
      setShowPaymentModal(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Error recording payment');
    }
    setSubmitLoading(false);
  };

  // Function to update fee status directly from table or view details
  const updateFeeStatus = async (studentId: string, newStatus: 'Paid' | 'Partial' | 'Unpaid') => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ fee_status: newStatus })
        .eq('id', studentId);
      if (error) throw error;

      setFeeSummary(prevFeeSummary =>
        prevFeeSummary.map(fee =>
          fee.id === studentId ? { ...fee, status: newStatus } : fee
        )
      );
    } catch (err: any) {
      alert('Error updating fee status: ' + err.message);
    }
  };

  // Define courses for each category
  const schoolCourses = [
    'SSC',
    'CBSE',
    'ICSE',
    'Others',
  ];

  // const schoolYears = ['5th','6th','7th','8th','9th','10th'];

  const juniorCollegeCourses = ['Science', 'Commerce', 'Arts'];
  // const juniorCollegeYears = ['11th ', '12th'];

  const diplomaCourses = ['Computer Science', 'Mechanical', 'Electrical', 'Civil'];
  // const diplomaYears = ['1st Year', '2nd Year', '3rd Year'];

  const degreeCourses = ['B.Tech Computer Science', 'B.Tech Mechanical', 'B.Com', 'B.A'];
  // const degreeYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const entranceExamCourses = ['NEET', 'JEE', 'MHTCET', 'Boards'];

  // Extract unique categories from feeSummary
  const categories = Array.from(new Set(feeSummary.map(fee => fee.category))).sort();

  // Filter feeSummary by searchTerm, statusFilter, selectedCategory, and selectedCourse
  const filteredFeeSummary = feeSummary.filter(fee => {
    const matchesSearch =
      fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.id.toString().includes(searchTerm) ||
      fee.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || fee.status === statusFilter;
    const matchesCategory = selectedCategory === 'All' || fee.category === selectedCategory;
    const matchesCourse = selectedCourse === 'All' || fee.course === selectedCourse;

    return matchesSearch && matchesStatus && matchesCategory && matchesCourse;
  });

  // Update studentCourses based on selectedCategory
  React.useEffect(() => {
    switch (selectedCategory) {
      case 'School': {
        setStudentCourses(schoolCourses);
        break;
      }
      case 'Junior College': {
        setStudentCourses(juniorCollegeCourses);
        break;
      }
      case 'Diploma': {
        setStudentCourses(diplomaCourses);
        break;
      }
      case 'Degree': {
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

  const totalFees = filteredFeeSummary.reduce((sum, fee) => sum + fee.totalAmount, 0);
  const totalCollected = filteredFeeSummary.reduce((sum, fee) => sum + fee.amountPaid, 0);
  const totalPending = filteredFeeSummary.reduce((sum, fee) => sum + calculateDueAmount(fee.totalAmount, fee.amountPaid), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fee Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage fee payments for all students
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn-primary flex items-center" onClick={openPaymentModal}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Record New Payment
          </button>
        </div>
      </div>

      {/* Loading and Error */}
      {loading && <div>Loading fee data...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {/* Category Filter Buttons */}
      <div className="flex space-x-2 mb-4">
        {['All', ...categories].map((category) => (
          <button
            key={category}
            className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Course Filter Buttons */}
      <div className="flex space-x-2 mb-4">
        {['All', ...studentCourses].map((course) => (
          <button
            key={course}
            className={`btn ${selectedCourse === course ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCourse(course)}
          >
            {course}
          </button>
        ))}
      </div>

      {/* Year Filter Buttons */}
      <div className="flex space-x-2 mb-4">
        {['All', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())].map((year) => (
          <button
            key={year}
            className={`btn ${studentYear.toString() === year ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStudentYear(year === 'All' ? 0 : parseInt(year))}
          >
            {year}
          </button>
        ))}
      </div>


      {/* Search and Status Filter */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by student name, ID, or category..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-4">
          <div className="relative">
            <select
              title='filter'
              className="input-field appearance-none pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button className="btn-secondary flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Fee Management table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Total Amount</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFeeSummary.map((fee) => (
              <tr key={fee.id} onClick={() => handleFeeAction(fee)}>
                <td className="font-medium">{fee.name}</td>
                <td>
                  <span className="text-sky-800  font-bold">{fee.category}</span>
                </td>
                <td>₹{fee.totalAmount.toLocaleString()}</td>
                <td className="text-green-700">₹{fee.amountPaid.toLocaleString()}</td>
                <td className="text-red-700">₹{calculateDueAmount(fee.totalAmount, fee.amountPaid).toLocaleString()}</td>
                <td>
                  <span
                    className={`badge text-xs ${
                      fee.status === 'Paid' ? 'text-green-700' :
                      fee.status === 'Partial' ? 'text-orange-300' :
                      'text-red-600'
                    }`}
                  >
                    {fee.status}
                  </span>
                </td>
                <td>
                  <button
                    className="text-primary hover:text-primary-dark font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeeAction(fee);
                    }}
                  >
                    {calculateDueAmount(fee.totalAmount, fee.amountPaid) > 0 ? 'Update' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredFeeSummary.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No fee records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fees;