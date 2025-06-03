import React, { useEffect, useState } from 'react';
import { TrendingUp, BookOpen, Filter, Award } from 'lucide-react';
import { performanceService } from '../../services/performanceService';
import type { Database } from '../../lib/database.types';

type Performance = Database['public']['Tables']['performance']['Row'];

interface StudentPerformanceProps {
  studentId: string;
}

const StudentPerformance: React.FC<StudentPerformanceProps> = ({ studentId }) => {
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const data: Performance[] = await performanceService.getByStudentId(studentId);
        setPerformance(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch performance data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [studentId]);

  const filteredPerformance = performance.filter(
    item => selectedExamType === 'All' || item.exam_name.includes(selectedExamType)
  );

  // Calculate average performance
  const avgPerformance = filteredPerformance.length > 0
    ? Math.round(filteredPerformance.reduce((sum, item) => sum + item.percentage, 0) / filteredPerformance.length)
    : 0;

  // Find highest and lowest performances
  const highestPerformance = filteredPerformance.length > 0
    ? Math.max(...filteredPerformance.map(item => item.percentage))
    : 0;

  const lowestPerformance = filteredPerformance.length > 0
    ? Math.min(...filteredPerformance.map(item => item.percentage))
    : 0;

  // Get exam types for filter
  const examTypes = ['All', 'Monthly Test', 'Quarterly Exam', 'Mock Test'];

  // Get performance trend data
  const performanceTrend = [...filteredPerformance].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (loading) return <div>Loading performance data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Performance summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-none">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm text-gray-500">Average Score</h3>
              <p className="mt-1 text-2xl font-semibold">{avgPerformance}%</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-none">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Award className="h-6 w-6 text-green-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm text-gray-500">Highest Score</h3>
              <p className="mt-1 text-2xl font-semibold text-green-700">{highestPerformance}%</p>
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-none">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <BookOpen className="h-6 w-6 text-red-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm text-gray-500">Lowest Score</h3>
              <p className="mt-1 text-2xl font-semibold text-red-700">{lowestPerformance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-medium">Performance Details</h3>

        <div className="relative">
          <select
            className="input-field appearance-none pr-8"
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            aria-label="Select exam type"
          >
            {examTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Performance chart */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Performance Trend</h3>

        {performanceTrend.length > 0 ? (
          <div className="h-64 flex items-end space-x-4">
            {performanceTrend.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full ${
                    item.percentage >= 80 ? 'bg-green-500' :
                    item.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  } rounded-t`}
                  style={{ height: `${item.percentage * 0.6}%` }}
                ></div>
                <div className="text-xs mt-2 text-gray-600 truncate w-full text-center">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-sm font-medium">{item.percentage}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No performance data available
          </div>
        )}
      </div>

      {/* Performance details table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Date</th>
              <th>Marks</th>
              <th>Total</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPerformance.map((item) => (
              <tr key={item.id}>
                <td>{item.exam_name}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.marks}</td>
                <td>{item.total_marks}</td>
                <td>
                  <span
                    className={`badge ${
                      item.percentage >= 80 ? 'badge-green' :
                      item.percentage >= 60 ? 'badge-yellow' : 'badge-red'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </td>
              </tr>
            ))}
            {filteredPerformance.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No performance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Analysis and recommendations */}
      <div className="card bg-blue-50 border-blue-100">
        <h3 className="text-lg font-medium mb-4">Performance Analysis</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Strengths</h4>
            <p className="text-gray-700 mt-1">
              {avgPerformance >= 80 ?
                "Excellent overall performance. Consistently scoring high marks across subjects." :
                avgPerformance >= 70 ?
                "Good grasp of core concepts. Strong performance in most subjects with occasional excellence." :
                "Shows potential in specific exams. Can build on successful study techniques."
              }
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Areas for Improvement</h4>
            <p className="text-gray-700 mt-1">
              {avgPerformance >= 80 ?
                "Could focus on achieving greater consistency across all exam types." :
                avgPerformance >= 70 ?
                "Improvement needed in specific challenging areas. Consider more practice tests." :
                "Needs significant work on core concepts and test preparation strategies."
              }
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Recommendations</h4>
            <ul className="list-disc pl-5 mt-1 text-gray-700 space-y-1">
              <li>
                {avgPerformance >= 80 ?
                  "Join advanced study groups for additional challenges" :
                  avgPerformance >= 70 ?
                  "Schedule additional practice sessions for weaker areas" :
                  "Attend remedial sessions and increase study hours"
                }
              </li>
              <li>
                {avgPerformance >= 70 ?
                  "Consider participating in competitive exams" :
                  "Focus on foundational concepts before advancing"
                }
              </li>
              <li>Regular mock tests to simulate exam conditions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;

