import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, Download } from 'lucide-react';
import supabase from '../lib/supabase';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
  total_fee: number;
  paid_fee: number;
  // Add other fields if needed
}

interface FeeSummary {
  id: number;
  name: string;
  category: string;
  course: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  // lastPaymentDate?: string;
}

const Fees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [feeSummary, setFeeSummary] = useState<FeeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // yyyy-mm-dd format
  });
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New state for view modal
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedFeeForView, setSelectedFeeForView] = useState<FeeSummary | null>(null);

  // Function to handle button action
  const handleFeeAction = (fee: FeeSummary) => {
    if (fee.amountDue > 0) {
      // Open payment modal with selected student
      setSelectedStudentId(fee.id);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setSubmitError(null);
      setShowPaymentModal(true);
    } else {
      // Open view modal with fee details
      setSelectedFeeForView(fee);
      setShowViewModal(true);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedFeeForView(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
      if (studentsError) throw studentsError;
      const summary = (studentsData || []).map((student: any) => {
        const totalAmount = student.total_fee || 0;
        const amountPaid = student.paid_fee || 0;
        const amountDue = totalAmount - amountPaid;

        let actualStatus: 'Paid' | 'Partial' | 'Unpaid';
        if (amountDue === 0 && totalAmount > 0) {
          actualStatus = 'Paid';
        } else if (amountPaid > 0) {
          actualStatus = 'Partial';
        } else {
          actualStatus = 'Unpaid';
        }

        return {
          id: student.id,
          name: student.name,
          category: student.category,
          course: student.course,
          totalAmount,
          amountPaid,
          amountDue,
          // status: student.fee_status,
          status: actualStatus,
          // lastPaymentDate: student.lastPaymentDate || '-'
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

    setSubmitLoading(true);
    try {
      // Fetch current amountPaid and lastPaymentDate for the student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('amountPaid, lastPaymentDate')
        .eq('id', selectedStudentId)
        .single();
      if (studentError) throw studentError;
      const newAmountPaid = (studentData.amountPaid || 0) + amountNum;
      const { error: updateError } = await supabase
        .from('students')
        .update({
          amountPaid: newAmountPaid,
          lastPaymentDate: paymentDate
        })
        .eq('id', selectedStudentId);

      if (updateError) throw updateError;

      // Refresh data and close modal
      // await fetchData();
      setFeeSummary(prevFeeSummary => {
        return prevFeeSummary.map(fee => {
          if (fee.id === selectedStudentId) {
            const newAmountPaid = fee.amountPaid + amountNum;
            const newAmountDue = fee.totalAmount - newAmountPaid;
            let newStatus: 'Paid' | 'Partial' | 'Unpaid';
            if (newAmountDue === 0 && fee.totalAmount > 0) {
              newStatus = 'Paid';
            } else if (newAmountPaid > 0) {
              newStatus = 'Partial';
            } else {
              newStatus = 'Unpaid';
            }
            return {
              ...fee,
              amountPaid: newAmountPaid,
              amountDue: newAmountDue,
              status: newStatus,
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

  const filteredFeeSummary = feeSummary.filter(fee => {
    const matchesSearch =
      fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.id.toString().includes(searchTerm) ||
      fee.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || fee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalFees = filteredFeeSummary.reduce((sum, fee) => sum + fee.totalAmount, 0);
  const totalCollected = filteredFeeSummary.reduce((sum, fee) => sum + fee.amountPaid, 0);
  const totalPending = filteredFeeSummary.reduce((sum, fee) => sum + fee.amountDue, 0);

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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Record New Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label htmlFor="student" className="block text-sm font-medium text-gray-700">Student</label>
                <select
                  id="student"
                  className="input-field w-full"
                  value={selectedStudentId ?? ''}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Payment Amount</label>
                <input
                  type="number"
                  id="amount"
                  className="input-field w-full"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Payment Date</label>
                <input
                  type="date"
                  id="date"
                  className="input-field w-full"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              {submitError && <div className="text-red-500">{submitError}</div>}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closePaymentModal}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Fee Details Modal */}
      {showViewModal && selectedFeeForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Fee Details for {selectedFeeForView.name}</h2>
            <div className="space-y-2">
              <p><strong>Category:</strong> {selectedFeeForView.category}</p>
              <p><strong>Course:</strong> {selectedFeeForView.course}</p>
              <p><strong>Total Amount:</strong> ₹{selectedFeeForView.totalAmount.toLocaleString()}</p>
              <p><strong>Amount Paid:</strong> ₹{selectedFeeForView.amountPaid.toLocaleString()}</p>
              <p><strong>Amount Due:</strong> ₹{selectedFeeForView.amountDue.toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedFeeForView.status}</p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="btn-primary"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-none">
          <div className="flex items-center">
            <div className="p-5 font-medium">
              <p className="text-xl text-gray-500 text-center">Total Fees</p>
              <p className="text-3xl font-semibold text-primary-dark">₹{totalFees.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-none">
          <div className="flex items-center">
            <div className="p-5">
              <p className="text-xl text-gray-500 text-center">Collected</p>
              <p className="text-3xl font-semibold text-green-700">₹{totalCollected.toLocaleString()}</p>
              <p className="text-sm text-green-700 text-center">
                {totalFees > 0 ? `${Math.round((totalCollected / totalFees) * 100)}% of total` : '0% of total'}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-none">
          <div className="flex items-center">
            <div className="p-5">
              <p className="text-xl text-gray-500 text-center">Pending</p>
              <p className="text-3xl font-semibold text-red-700">₹{totalPending.toLocaleString()}</p>
              <p className="text-sm text-red-700 text-center">
                {totalFees > 0 ? `${Math.round((totalPending / totalFees) * 100)}% of total` : '0% of total'}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                <td className="text-red-700">₹{fee.amountDue.toLocaleString()}</td>
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
                    onClick={() => handleFeeAction(fee)}
                  >
                    {fee.amountDue > 0 ? 'Update' : 'View'}
                  </button>
                </td>
              </tr>
              ))}
            {filteredFeeSummary.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  No fee records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium"> {' '}</span> 
          <span className="font-medium">{filteredFeeSummary.length}</span> results
        </div>
      </div>
    </div>
  );
};

export default Fees;