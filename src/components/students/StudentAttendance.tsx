import React, { useEffect, useState } from 'react';
import { CalendarCheck, Calendar, Filter } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import type { Database } from '../../lib/database.types';

type Attendance = Database['public']['Tables']['attendance']['Row'];

interface StudentAttendanceProps {
  studentId: string;
}

const StudentAttendance: React.FC<StudentAttendanceProps> = ({ studentId }) => {
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getByStudentId(studentId);
        setAttendance(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  const filteredAttendance = attendance.filter(
    item =>
      (selectedSubject === 'All' || item.subject === selectedSubject) &&
      (selectedMonth === 'All' || new Date(item.date).toLocaleString('default', { month: 'long' }) === selectedMonth)
  );

  // Calculate attendance statistics
  const totalClasses = filteredAttendance.length;
  const presentClasses = filteredAttendance.filter(item => item.status.toLowerCase() === 'present').length;
  const absentClasses = totalClasses - presentClasses;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  // Get unique subjects for filter
  const subjects = ['All', ...Array.from(new Set(attendance.map(item => item.subject)))];

  if (loading) return <div>Loading attendance data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Attendance summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-none">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <CalendarCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm text-gray-500">Attendance Rate</h3>
              <p className="mt-1 text-2xl font-semibold">{Math.round(attendancePercentage)}%</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-none">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Present</span>
            <span className="mt-1 text-2xl font-semibold text-green-700">{presentClasses}</span>
            <span className="text-sm text-gray-500">out of {totalClasses} classes</span>
          </div>
        </div>

        <div className="card bg-red-50 border-none">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Absent</span>
            <span className="mt-1 text-2xl font-semibold text-red-700">{absentClasses}</span>
            <span className="text-sm text-gray-500">out of {totalClasses} classes</span>
          </div>
        </div>

        <div className="card border-none">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Current Month</span>
            <span className="mt-1 text-2xl font-semibold">{selectedMonth}</span>
            <span className="text-sm text-gray-500">2025</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <select
            title="selectMonth"
            className="input-field appearance-none pr-8"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="All">All</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <select
            className="input-field appearance-none pr-8"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Subject-wise attendance */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Subject-wise Attendance</h3>

        <div className="space-y-4">
          {subjectWiseAttendance.map((item) => (
            <div key={item.subject} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.subject}</span>
                <span className="text-gray-500">
                  {item.present}/{item.total} classes ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${
                    item.percentage >= 75 ? 'bg-green-600' :
                    item.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance details table */}
      <div>
        <h3 className="text-lg font-medium mb-4">Attendance Details</h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttendance.map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.subject}</td>
                  <td>
                    <span
                      className={`badge ${item.status.toLowerCase() === 'present' ? 'badge-green' : 'badge-red'}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
