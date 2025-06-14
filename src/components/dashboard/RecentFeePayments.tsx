import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import type { Database } from '../../lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];

const RecentFeePayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getAll();
        setPayments(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <div>Loading recent fee payments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.student_id}</td>
              <td>{payment.description || '-'}</td>
              <td>₹{payment.amount}</td>
              <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
              <td>
                <span className={`badge ${payment.status === 'Paid' ? 'badge-green' : 'badge-yellow'}`}>
                  {payment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentFeePayments;
