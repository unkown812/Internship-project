import React, { useState, useEffect } from 'react';
import { PlusCircle, Download } from 'lucide-react';
import Papa from 'papaparse';
import supabase from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

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
}

const ITEMS_PER_PAGE = 5;

const Performance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [examName, setExamName] = useState('');
  const [marks, setMarks] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const { data: studentData } = await supabase.from('students').select('*');
      const { data: performanceData } = await supabase.from('performance').select('*');

      if (studentData) setStudents(studentData);
      if (performanceData) setPerformance(performanceData);
    };

    fetchData();
  }, []);

  const addPerformance = async () => {
    if (!selectedStudent || !examName || !marks || !totalMarks) return;

    const date = new Date().toISOString().split('T')[0];
    const newRecord: PerformanceRecord = {
      student_name: selectedStudent.name,
      student_category: selectedStudent.category,
      exam_name: examName,
      date,
      marks: parseFloat(marks),
      total_marks: parseFloat(totalMarks),
    };

    const { error } = await supabase.from('performance').insert([newRecord]);
    if (!error) {
      setPerformance([...performance, newRecord]);
      setExamName('');
      setMarks('');
      setTotalMarks('');
      setSelectedStudent(null);
    }
  };

  const filteredPerformance = performance.filter((record) => {
    const matchesSearch =
      record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student_category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || record.student_category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const paginatedData = filteredPerformance.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredPerformance.length / ITEMS_PER_PAGE);

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredPerformance);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'performance_data.csv';
    link.click();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded-md w-64"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="All">All Categories</option>
          {[...new Set(students.map((s) => s.category))].map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
        >
          <Download className="inline-block mr-1" size={16} /> Export CSV
        </button>
      </div>

      <div className="border p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Add Performance</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedStudent?.id || ''}
            onChange={(e) =>
              setSelectedStudent(
                students.find((s) => s.id === parseInt(e.target.value)) || null
              )
            }
            className="border px-3 py-2 rounded-md"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.category}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Exam Name"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="number"
            placeholder="Marks"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="number"
            placeholder="Total"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />
          <button
            onClick={addPerformance}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <PlusCircle className="inline-block mr-1" size={18} /> Add
          </button>
        </div>
      </div>

      {/* 📊 Line Chart */}
      <div className="bg-white border rounded-md p-4">
        <h3 className="font-semibold mb-3">Performance Graph</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={filteredPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="exam_name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="marks" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📋 Table with Pagination */}
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Exam</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Marks</th>
              <th className="px-3 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((record, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="px-3 py-2">{record.student_name}</td>
                  <td className="px-3 py-2">{record.student_category}</td>
                  <td className="px-3 py-2">{record.exam_name}</td>
                  <td className="px-3 py-2">{record.date}</td>
                  <td className="px-3 py-2">{record.marks}</td>
                  <td className="px-3 py-2">{record.total_marks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-3 py-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="py-1">{currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Performance;
