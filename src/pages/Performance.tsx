import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, Download, X } from 'lucide-react';
import supabase from '../lib/supabase';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
}

interface ExamRecord {
  id: number;
  examName: string;
  date: string;
  marks: number;
  totalMarks: number;
  percentage: number;
}

const Performance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for modal and form inputs
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newExamName, setNewExamName] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [newTotalMarks, setNewTotalMarks] = useState<number | ''>('');
  const [studentMarks, setStudentMarks] = useState<{ [studentId: number]: number | '' }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Categories for filters
  const categories = ['All', 'School (8-10th)', 'Junior College (11-12th)', 'Diploma', 'JEE', 'NEET', 'MHCET'];



  useEffect(() => {
    fetchData();
  }, []);

  // Fix JSX parsing error by ensuring all tags are properly closed

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
      if (studentsError) throw studentsError;
      const { data: examsData, error: examsError } = await supabase.from('exams').select('*');
      if (examsError) throw examsError;
      setStudents(studentsData || []);
      // Map snake_case to camelCase for exams
      const mappedExams = (examsData || []).map((exam: any) => ({
        id: exam.id,
        studentId: exam.student_id,
        examName: exam.exam_name,
        date: exam.date,
        marks: exam.marks,
        totalMarks: exam.total_marks,
        percentage: exam.percentage,
      }));
      setExams(mappedExams);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  // Create performance summary data by student
  const performanceSummary = students.map((student: Student) => {
    const records = exams.filter(record => record.studentId === student.id);
    const totalExams = records.length;
    const avgPerformance = totalExams > 0
      ? Math.round(records.reduce((sum, record) => sum + record.percentage, 0) / totalExams)
      : 0;
    const highestScore = totalExams > 0
      ? Math.max(...records.map(record => record.percentage))
      : 0;
    const lowestScore = totalExams > 0
      ? Math.min(...records.map(record => record.percentage))
      : 0;
    const latestExam = records.length > 0
      ? records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null;

    return {
      id: student.id,
      name: student.name,
      category: student.category,
      course: student.course,
      totalExams,
      avgPerformance,
      highestScore,
      lowestScore,
      latestExam: latestExam ? {
        name: latestExam.examName,
        date: latestExam.date,
        percentage: latestExam.percentage
      } : null
    };
  });


  const filteredPerformanceSummary = performanceSummary.filter(summary => {
    const matchesSearch =
      summary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.id.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || summary.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const overallPerformance = performanceSummary.length > 0
    ? Math.round(performanceSummary.reduce((sum, summary) => sum + summary.avgPerformance, 0) / performanceSummary.length) : 0;

  const topPerformer = performanceSummary.length > 0
    ? performanceSummary.reduce((prev, current) =>
      prev.avgPerformance > current.avgPerformance ? prev : current) : null;

  const saveNewPerformance = async () => {
    setFormError(null);
    if (!newExamName.trim()) {
      setFormError('Please enter the subject/exam name.');
      return;
    }
    if (!newDate) {
      setFormError('Please select the date of the test.');
      return;
    }
    if (newTotalMarks === '' || newTotalMarks <= 0) {
      setFormError('Please enter valid total marks.');
      return;
    }
    // Validate marks for each student
    for (const studentId of Object.keys(studentMarks)) {
      const marks = studentMarks[Number(studentId)];
      if (marks === '' || marks < 0 || marks > Number(newTotalMarks)) {
        setFormError(`Please enter valid marks for student ID ${studentId}.`);
        return;
      }
    }

    setSaving(true);
    try {
      const recordsToInsert = Object.entries(studentMarks).map(([studentIdStr, marks]) => {
        const studentId = Number(studentIdStr);
        const percentage = (Number(marks) / Number(newTotalMarks)) * 100;
        return {
          student_id: studentId,
          exam_name: newExamName.trim(),
          date: newDate,
          marks: Number(marks),
          total_marks: Number(newTotalMarks),
          percentage,
        };
      });
      const { error } = await supabase.from('exams').insert(recordsToInsert);
      if (error) throw error;
      await fetchData();
      setShowAddModal(false);
      setNewExamName('');
      setNewDate('');
      setNewTotalMarks('');
      setStudentMarks({});
      setFormError(null);
    } catch (err) {
      setFormError((err as Error).message || 'Failed to save performance records.');
    }
    setSaving(false);
  };

  if (loading) {
    return <div>Loading performance data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading data: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Performance Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor student academic performance and progress
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn-primary flex items-center" onClick={() => setShowAddModal(true)}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Exam Result
          </button>
        </div>
      </div>

      {/* Add New Exam Result Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddModal(false)}
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Add New Exam Result</h2>
            {formError && <div className="mb-4 text-red-600">{formError}</div>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveNewPerformance();
              }}
            >
              <div className="mb-4">
                <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject / Exam Name
                </label>
                <input
                  type="text"
                  id="examName"
                  className="input-field w-full"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Test
                </label>
                <input
                  type="date"
                  id="date"
                  className="input-field w-full"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  id="totalMarks"
                  className="input-field w-full"
                  value={newTotalMarks}
                  onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                  min={0}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Marks
                </label>
                <div className="max-h-64 overflow-y-auto border rounded p-2">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 mb-2">
                      <div className="flex-grow">
                        <span>{student.name} ({student.category})</span>
                      </div>
                      <input
                        type="number"
                        className="input-field w-24"
                        min={0}
                        max={newTotalMarks || undefined}
                        value={studentMarks[student.id] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setStudentMarks((prev) => ({
                            ...prev,
                            [student.id]: val,
                          }));
                        }}
                        placeholder="Marks"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn-secondary mr-2"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Removed duplicated form with undefined state variables newObtainedMarks, newPercentage */}
{/* Performance stats */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="card bg-blue-50 border-none">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Average Performance</p>
        <p className="text-2xl font-semibold">{overallPerformance}%</p>
      </div>
    </div>
  </div>

  <div className="card bg-purple-50 border-none">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Total Students</p>
        <p className="text-2xl font-semibold">{students.length}</p>
      </div>
    </div>
  </div>

  <div className="card bg-yellow-50 border-none">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Top Performer</p>
        <p className="text-xl font-semibold">{topPerformer?.name || 'N/A'}</p>
        <p className="text-sm text-yellow-700">{topPerformer ? `${topPerformer.avgPerformance}%` : 'N/A'}</p>
      </div>
    </div>
  </div>
</div>

{/* Filters and search */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by student name or ID..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-4">
          <div className="relative">
            <select
              title="cat"
              className="input-field appearance-none pr-8"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
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

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Average</th>
              <th>Highest</th>
              <th>Lowest</th>
              <th>Latest Exam</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPerformanceSummary.map((summary) => (
              <tr key={summary.id}>
                <td className="font-medium">{summary.name}</td>
                <td>
                  <span className="badge badge-blue">{summary.category}</span>
                </td>
                <td>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                      <div
                        className={`h-2.5 rounded-full ${
                          summary.avgPerformance >= 80 ? 'bg-green-600' :
                          summary.avgPerformance >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                        }`}
                        style={{ width: `${summary.avgPerformance}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{summary.avgPerformance}%</span>
                  </div>
                </td>
                <td className="text-green-700">{summary.highestScore}%</td>
                <td className="text-red-700">{summary.lowestScore}%</td>
                <td>
                  {summary.latestExam ? (
                    <div>
                      <div className="text-sm font-medium">{summary.latestExam.name}</div>
                      <div className="flex items-center">
                        <span
                          className={`badge ${
                            summary.latestExam.percentage >= 80 ? 'badge-green' :
                            summary.latestExam.percentage >= 60 ? 'badge-yellow' : 'badge-red'
                          }`}
                        >
                          {summary.latestExam.percentage}%
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {summary.latestExam.date}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No exams yet</span>
                  )}
                </td>
                <td>
                  <button className="text-primary hover:text-primary-dark font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredPerformanceSummary.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No performance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div >

   <div className="flex items-center justify-between">
     <div className="text-sm text-gray-700">
       Showing {' '}
       <span className="font-medium">{filteredPerformanceSummary.length}</span> results
     </div>
     <div className="flex space-x-2">
       <button className="px-3 py-1 border rounded text-sm font-medium bg-gray-50">Previous</button>
       <button className="px-3 py-1 border rounded text-sm font-medium bg-primary text-white">1</button>
       <button className="px-3 py-1 border rounded text-sm font-medium">2</button>
       <button className="px-3 py-1 border rounded text-sm font-medium">Next</button>
     </div>
   </div>
  </div >
 );
};

export default Performance;
