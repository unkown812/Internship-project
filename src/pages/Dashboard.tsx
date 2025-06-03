import React, { useEffect, useState } from 'react';
import { Users, CreditCard } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentFeePayments from '../components/dashboard/RecentFeePayments';
import AttendanceChart from '../components/dashboard/AttendanceChart';
import PerformanceWidget from '../components/dashboard/PerformanceWidget';
import UpcomingExams from '../components/dashboard/UpcomingExams';
import { studentService } from '../services/studentService';
import supabase from '../lib/supabase';

const Dashboard: React.FC = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalFeesCollected, setTotalFeesCollected] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //total students
        const students = await studentService.getAll();
        setTotalStudents(students.length);

        // Fetch fee summary from students table for fee collection using supabase client
        const { data: studentsData, error } = await supabase
          .from('students')
          .select('total_fee, paid_fee');

        if (error) throw error;

        if (studentsData && studentsData.length > 0) {
          const totalFeesCollected = studentsData.reduce((sum: number, student: any) => sum + (student.total_fee || 0), 0);
          setTotalFeesCollected(totalFeesCollected);
        } else {
          setTotalFeesCollected(0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of SK Tutorials management system
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          change={+1}
          icon={<Users className="size-10" />}
          color="text-blue-800"
          bgcolor="bg-blue-50"
        />
        <StatCard
          title="Fee Collection"
          value={`₹${totalFeesCollected.toLocaleString()}`}
          change={+8.2}
          icon={<CreditCard className="size-10" />}
          color="text-green-800"
          bgcolor="bg-green-50"
        />
      </div>

      {/* Charts and tables section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Overview</h2>
          <AttendanceChart />
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h2>
          <PerformanceWidget />
        </div>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Fee Payments</h2>
          <RecentFeePayments />
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Exams</h2>
          <UpcomingExams />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
