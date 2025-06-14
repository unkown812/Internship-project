import React, { useEffect, useState } from 'react';
import { attendanceService } from '../../services/attendanceService';

interface AttendanceData {
  name: string;
  category: string;
  value: number;
}

const AttendanceChart: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getAll();
        const attendanceMap: Record<string, { present: number; total: number }> = {};
        data.forEach((record: { category?: string; status?: string | null }) => {
          const key = record.category || 'Unknown';
          if (!attendanceMap[key]) {
            attendanceMap[key] = { present: 0, total: 0 };
          }
          attendanceMap[key].total += 1;
          if (record.status && record.status.toLowerCase() === 'present') {
            attendanceMap[key].present += 1;
          }
        });

        const aggregatedData = Object.entries(attendanceMap).map(([category, counts]) => ({
          name: category,
          category,
          value: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0,
        }));

        setAttendanceData(aggregatedData);
      } catch (err) {
        const error = err as Error;
        setError(error.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) return <div>Loading attendance data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {attendanceData.map((item) => (
        <div key={item.category} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.name}</span>
            <span className="text-gray-500">{item.value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${item.value}%` }}
            ></div>
          </div>
        </div>
      ))}
      <div className="pt-2 text-sm text-gray-500 text-right">
        Last updated: just now
      </div>
    </div>
  );
};

export default AttendanceChart;
