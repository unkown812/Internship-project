import React, { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import supabase from '../lib/supabase';
import TabNav from '../components/ui/TabNav';

interface Student {
  id: number;
  name: string;
  category: string;
}

const AttendancePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<string>('mark');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<Record<number, string>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
        if (studentsError) throw studentsError;
        await supabase.from('attendance').select('*'); // fetch attendance but do not store as unused
        setStudents(studentsData || []);
        const initialStatus: Record<number, string> = {};
        (studentsData || []).forEach((student: Student) => {
          initialStatus[student.id] = 'Present';
        });
        setAttendanceStatusMap(initialStatus);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error');
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSaveAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const recordsToInsert = students
        .filter(student => selectedCategory === 'All' || student.category === selectedCategory)
        .map((student: Student) => ({
          student_id: student.id,
          date: selectedDate,
          status: attendanceStatusMap[student.id] || 'Present'
        }));

      const { error: upsertError } = await supabase.from('attendance').upsert(recordsToInsert, {
        onConflict: 'student_id,date'
      });
      if (upsertError) throw upsertError;

      const { error: fetchError } = await supabase.from('attendance').select('*');
      if (fetchError) throw fetchError;
      alert('Attendance saved successfully.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
      alert('Failed to save attendance');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'mark', label: 'Mark Attendance' },
    { id: 'summary', label: 'Summary' }
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toString().includes(searchTerm);
    const matchCategory = selectedCategory === 'All' || student.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow">
          <div className="absolute left-3 top-2.5">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 input-field"
            placeholder="Search students..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="input-field pr-8"
            title="Category Filter"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {['All', 'School (8-10th)', 'Junior College (11-12th)', 'Diploma', 'Degree', 'JEE', 'NEET', 'MHCET'].map(cat => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute right-2 top-2.5">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {activeTab === 'summary' && (
          <button className="btn-secondary flex items-center">
            <Download className="h-5 w-5 mr-2" />Export
          </button>
        )}
      </div>

      {activeTab === 'mark' && (
        <>
          <div className="flex justify-between bg-white p-4 rounded shadow">
            <div>
              <label htmlFor="date" className="text-sm text-gray-500">Date</label>
              <input type="date" id="date" className="input-field mt-1" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <div className="space-x-2">
              <button className="btn-secondary" disabled={loading} onClick={() => {
                const allPresent: Record<number, string> = {};
                students.forEach(s => allPresent[s.id] = 'Present');
                setAttendanceStatusMap(allPresent);
              }}>Mark All Present</button>
              <button className="btn-primary" disabled={loading} onClick={handleSaveAttendance}>Save Attendance</button>
            </div>
          </div>

          <table className="data-table mt-6">
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.category}</td>
                  <td>
                    <select
                      className="input-field"
                      title="Attendance Status"
                      value={attendanceStatusMap[student.id] || 'Present'}
                      onChange={e => setAttendanceStatusMap(prev => ({ ...prev, [student.id]: e.target.value }))}
                    >
                      <option key="present" value="Present">Present</option>
                      <option key="absent" value="Absent">Absent</option>
                      <option key="late" value="Late">Late</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr><td colSpan={3} className="text-center py-4 text-gray-500">No students found</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AttendancePage;
