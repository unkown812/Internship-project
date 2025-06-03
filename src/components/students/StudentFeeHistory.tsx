import React, { useEffect, useState } from 'react';
import { CreditCard, FileText, Printer } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import type { Database } from '../../lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];

interface StudentFeeHistoryProps {
  studentId: string;
}

const StudentFeeHistory: React.FC<StudentFeeHistoryProps> = ({ studentId }) => {
  const [feeHistory, setFeeHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeHistory = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getByStudentId(studentId);
        setFeeHistory(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch fee history');
      } finally {
        setLoading(false);
      }
    };

    fetchFeeHistory();
  }, [studentId]);

  // Calculate total paid and total due
  const totalAmount = feeHistory.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = feeHistory
    .filter(fee => fee.status === 'Paid')
    .reduce((sum, fee) => sum + fee.amount, 0);
  const totalDue = totalAmount - totalPaid;

  if (loading) return <div>Loading fee history...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Fee summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Fee</p>
              <p className="text-2xl font-semibold">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="text-2xl font-semibold text-green-700">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FileText className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Amount Due</p>
              <p className="text-2xl font-semibold text-red-700">₹{totalDue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <CreditCard className="h-6 w-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Fee receipt list */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Payment History</h3>
          <button className="btn-secondary text-sm flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Print Statement
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt No.</th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feeHistory.map((fee) => (
                <tr key={fee.id}>
                  <td>R-{fee.id.toString().padStart(4, '0')}</td>
                  <td>{new Date(fee.payment_date).toLocaleDateString()}</td>
                  <td>{fee.description}</td>
                  <td>₹{fee.amount.toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${fee.status === 'Paid' ? 'badge-green' : 'badge-yellow'}`}
                    >
                      {fee.status}
                    </span>
                  </td>
                  <td>
                    <button className="text-primary hover:text-primary-dark">
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
              {feeHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No fee history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment options (if there is due amount) */}
      {totalDue > 0 && (
        <div className="mt-6 card bg-blue-50 border-blue-100">
          <h3 className="text-lg font-medium mb-4">Make a Payment</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder="Enter amount"
                className="input-field"
                defaultValue={totalDue}
              />
            </div>

            <div>
              <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select id="payment-method" name="payment-method" className="input-field">
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                id="payment-date"
                name="payment-date"
                className="input-field"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="payment-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="payment-notes"
                name="payment-notes"
                rows={2}
                placeholder="Add any notes about this payment"
                className="input-field"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button type="button" className="btn-primary">
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeHistory;
