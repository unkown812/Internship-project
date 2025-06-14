import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, X, Download } from 'lucide-react';
import supabase from '../lib/supabase';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
}

interface PerformanceRecord {
  student_name: string;
  student_category: string;
  exam_name: string;
  date: string;
  marks: number;
  total_marks: number;
  percentage: number;
  result_id: number
}

const Performance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [students, setStudents] = useState<Student[]>([]);
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedPerformanceRecord, setSelectedPerformanceRecord] = useState<PerformanceRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editStudentName, setEditStudentName] = useState<string>('');
  const [editStudentCategory, setEditStudentCategory] = useState<string>('');
  const [editExamName, setEditExamName] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editObtainedMarks, setEditObtainedMarks] = useState<number | ''>('');
  const [editTotalMarks, setEditTotalMarks] = useState<number | ''>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const categories = ['All', 'School (8-10th)', 'Junior College (11-12th)', 'Diploma', 'Degree', 'JEE', 'NEET', 'MHCET'];
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
      if (studentsError) throw studentsError;
      const { data: performanceData, error: performanceError } = await supabase.from('performance').select('*');
      if (performanceError) throw performanceError;
      setStudents(studentsData || []);
      setPerformance(performanceData || []);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  const performanceSummary = students.map((student: Student) => {
    const records = performance.filter(record => record.student_name === student.name);
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

    return {
      id: student.id,
      name: student.name,
      category: student.category,
      course: student.course,
      totalExams,
      avgPerformance,
      highestScore,
      lowestScore
    };
  });

  // const filteredPerformanceSummary = performanceSummary.filter(summary => {
  //   const lowerSearchTerm = searchTerm.trim().toLowerCase();
  //   const matchesSearch = summary.name.toLowerCase().includes(lowerSearchTerm);
  //   const matchesCategory = selectedCategory === 'All' || summary.category === selectedCategory;
  //   return matchesSearch && matchesCategory;
  // });


  const overallPerformance = performanceSummary.length > 0
    ? Math.round(performanceSummary.reduce((sum, summary) => sum + summary.avgPerformance, 0) / performanceSummary.length) : 0;
  const topPerformer = performanceSummary.length > 0
    ? performanceSummary.reduce((prev, current) =>
      prev.avgPerformance > current.avgPerformance ? prev : current) : null;

  const filteredPerformance = performance.filter(record => {
    const matchesSearch = record.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || record.student_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  //No Gyaan Found
  const saveNewPerformance = async () => {
    setFormError(null);
    if (newStudentName.trim() == '') {
      setFormError('Please select a student or enter a new student name.');
      return;
    }
    if (!newExamName.trim()) {
      setFormError('Please enter the subject/exam name.');
      return;
    }
    if (!newDate) {
      setFormError('Please select the date of the test.');
      return;
    }
    if (newObtainedMarks === '' || newObtainedMarks < 0) {
      setFormError('Please enter valid obtained marks.');
      return;
    }
    if (newTotalMarks === '' || newTotalMarks <= 0) {
      setFormError('Please enter valid total marks.');
      return;
    }
    setSaving(true);
    const calculatedPercentage = (Number(newObtainedMarks) / Number(newTotalMarks)) * 100;
    console.log('Inserting performance record:', {
      exam_name: newExamName.trim(),
      date: newDate,
      marks: newObtainedMarks,
      total_marks: newTotalMarks,
      percentage: calculatedPercentage,
      student_name: newStudentName.trim(),
      student_category: newStudentCategory.trim()
    });
    const { error } = await supabase.from('performance').insert([{
      exam_name: newExamName.trim(),
      date: newDate,
      marks: newObtainedMarks,
      total_marks: newTotalMarks,
      percentage: calculatedPercentage,
      student_name: newStudentName.trim(),
      student_category: newStudentCategory.trim()
    }]);
    if (error) throw error;
    await fetchData();
    setShowAddModal(false);
    setSearchTerm('');
    setNewStudentName('');
    setNewStudentCategory('');
    setNewExamName('');
    setNewDate('');
    setNewObtainedMarks('');
    setNewTotalMarks('');
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
            Add Result
          </button>
        </div>
      </div>

      {/* Add New Exam Result Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
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
              </div>
              <div className="mb-4">
                <label htmlFor="newStudentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  id="newStudentName"
                  className="input-field w-full"
                  value={newStudentName}
                  onChange={(e) => {
                    setNewStudentName(e.target.value);
                  }}
                  placeholder="Enter student name"
                  aria-label="Student Name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="newStudentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="newStudentCategory"
                  className="input-field w-full"
                  value={newStudentCategory}
                  onChange={(e) => setNewStudentCategory(e.target.value)}
                  required
                  aria-label="Student Category"
                >
                  <option value="" disabled>Select category</option>
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject / Exam Name
                </label>
                <input
                  type="text"
                  id="exam_name"
                  className="input-field w-full"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  required
                  aria-label="Subject or Exam Name"
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
                  aria-label="Date of Test"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">
                  Obtained Marks
                </label>
                <input
                  type="number"
                  id="marks"
                  className="input-field w-full"
                  value={newObtainedMarks}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewObtainedMarks(val === '' ? '' : Number(val));
                  }}
                  min={0}
                  required
                  aria-label="Obtained Marks"
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewTotalMarks(val === '' ? '' : Number(val));
                  }}
                  min={0}
                  required
                  aria-label="Total Marks"
                />
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

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students by name, ID, or email..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-4">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border px-3 py-2 rounded-md"
              aria-label="Filter by category"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <button
            className="btn-secondary flex items-center"
            onClick={() => {
              // Convert filteredPerformance to CSV
              const headers = ['Result ID', 'Student Name', 'Category', 'Exam Name', 'Date', 'Marks Obtained', 'Total Marks', 'Percentage'];
              const rows = filteredPerformance.map(record => [
                record.result_id,
                record.student_name,
                record.student_category,
                record.exam_name,
                record.date,
                record.marks,
                record.total_marks,
                record.percentage.toFixed(2)
              ]);
              const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
              ].join('\r\n');

              // Create a blob and trigger download
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'performance_export.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="table-container hover:bg-teal-200">
        <table className="data-table rounded-xl">
          <thead>
            <tr>
              <th>Result ID</th>
              <th>Student</th>
              <th>Course</th>
              <th>Test</th>
              <th>Date</th>
              <th>Marks</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredPerformance.length > 0 ? (
              filteredPerformance.map((record, index) => {
                return (
                  <tr key={record.result_id}>
                    <td className="font-medium">{index + 1}</td>
                    <td>{record.student_name}</td>
                    <td>{record.student_category}</td>
                    <td>{record.exam_name}</td>
                    <td>{record.date}</td>
                    <td>{record.marks} / {record.total_marks}</td>
                    <td>
                      <button
                        className="text-primary hover:text-primary-dark font-medium"
                        onClick={() => setSelectedPerformanceRecord(record)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No performance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {' '}
          <span className="font-medium"> {filteredPerformance.length}</span> results
        </div>
      </div>
      
      {selectedPerformanceRecord && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={() => {
              setSelectedPerformanceRecord(null);
              setIsEditMode(false);
              setFormError(null);
            }}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold mb-4">
            {isEditMode ? 'Edit Performance Result' : 'Performance Details'}
          </h2>
          {isEditMode ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setFormError(null);
                if (editStudentName.trim() === '') {
                  setFormError('Please enter a student name.');
                  return;
                }
                if (editStudentCategory.trim() === '') {
                  setFormError('Please select a student category.');
                  return;
                }
                if (editExamName.trim() === '') {
                  setFormError('Please enter the subject/exam name.');
                  return;
                }
                if (!editDate) {
                  setFormError('Please select the date of the test.');
                  return;
                }
                if (editObtainedMarks === '' || editObtainedMarks < 0) {
                  setFormError('Please enter valid obtained marks.');
                  return;
                }
                if (editTotalMarks === '' || editTotalMarks <= 0) {
                  setFormError('Please enter valid total marks.');
                  return;
                }
                setSaving(true);
                const calculatedPercentage = (Number(editObtainedMarks) / Number(editTotalMarks)) * 100;
                const { error } = await supabase
                  .from('performance')
                  .update({
                    student_name: editStudentName.trim(),
                    student_category: editStudentCategory.trim(),
                    exam_name: editExamName.trim(),
                    date: editDate,
                    marks: editObtainedMarks,
                    total_marks: editTotalMarks,
                    percentage: calculatedPercentage,
                  })
                  .eq('result_id', selectedPerformanceRecord.result_id);
                if (error) {
                  setFormError(error.message);
                  setSaving(false);
                  return;
                }
                await fetchData();
                setSaving(false);
                setIsEditMode(false);
                setSelectedPerformanceRecord(null);
              }}
            >
              {formError && <div className="mb-4 text-red-600">{formError}</div>}
              <div className="mb-4">
                <label htmlFor="editStudentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  id="editStudentName"
                  className="input-field w-full"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  aria-label="Student Name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editStudentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="editStudentCategory"
                  className="input-field w-full"
                  value={editStudentCategory}
                  onChange={(e) => setEditStudentCategory(e.target.value)}
                  aria-label="Student Category"
                >
                  <option value="" disabled>Select category</option>
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="editExamName" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject / Exam Name
                </label>
                <input
                  type="text"
                  id="editExamName"
                  className="input-field w-full"
                  value={editExamName}
                  onChange={(e) => setEditExamName(e.target.value)}
                  aria-label="Subject or Exam Name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Test
                </label>
                <input
                  type="date"
                  id="editDate"
                  className="input-field w-full"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  aria-label="Date of Test"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editObtainedMarks" className="block text-sm font-medium text-gray-700 mb-1">
                  Obtained Marks
                </label>
                <input
                  type="number"
                  id="editObtainedMarks"
                  className="input-field w-full"
                  value={editObtainedMarks}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditObtainedMarks(val === '' ? '' : Number(val));
                  }}
                  min={0}
                  aria-label="Obtained Marks"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editTotalMarks" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  id="editTotalMarks"
                  className="input-field w-full"
                  value={editTotalMarks}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditTotalMarks(val === '' ? '' : Number(val));
                  }}
                  min={0}
                  aria-label="Total Marks"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn-secondary mr-2"
                  onClick={() => {
                    setIsEditMode(false);
                    setFormError(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-2">
                <p><strong>Student Name:</strong> {selectedPerformanceRecord?.student_name}</p>
                <p><strong>Category:</strong> {selectedPerformanceRecord?.student_category}</p>
                <p><strong>Exam Name:</strong> {selectedPerformanceRecord?.exam_name}</p>
                <p><strong>Date:</strong> {selectedPerformanceRecord?.date}</p>
                <p><strong>Marks:</strong> {selectedPerformanceRecord?.marks} / {selectedPerformanceRecord?.total_marks}</p>
                <p><strong>Percentage:</strong> {selectedPerformanceRecord?.percentage.toFixed(2)}%</p>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setIsEditMode(true);
                    setEditStudentName(selectedPerformanceRecord.student_name);
                    setEditStudentCategory(selectedPerformanceRecord.student_category);
                    setEditExamName(selectedPerformanceRecord.exam_name);
                    setEditDate(selectedPerformanceRecord.date);
                    setEditObtainedMarks(selectedPerformanceRecord.marks);
                    setEditTotalMarks(selectedPerformanceRecord.total_marks);
                    setFormError(null);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setSelectedPerformanceRecord(null);
                    setIsEditMode(false);
                    setFormError(null);
                  }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
  </div>
  );
}

export default Performance;
