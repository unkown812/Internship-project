import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import supabase from '../lib/supabase';

interface Student {
  id: number;
  name: string;
  category: string;
}

interface AttendanceRecord {
  id: number;
  student_id: number;
  date: string;
  status: string;
}

function getDaysInMonth(year: number, month: number): string[] {
  const date = new Date(year, month, 1);
  const dates = [];
  while (date.getMonth() === month) {
    dates.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

const Attendance: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Record<number, string>>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const daysInMonth = React.useMemo(() => getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth()), [selectedMonth]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch distinct categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('students')
        .select('category');
      if (categoriesError) throw categoriesError;
      const uniqueCategories = categoriesData ? Array.from(new Set(categoriesData.map((c: any) => c.category))) : [];
      setCategories(uniqueCategories);

      let query = supabase.from('students').select('*');
      if (selectedGrade !== 'All') {
        query = query.eq('category', selectedGrade);
      }
      const { data: studentsData, error: studentsError } = await query;
      if (studentsError) throw studentsError;
      let filteredStudents = studentsData || [];
      if (searchTerm.trim() !== '') {
        const lowerSearch = searchTerm.toLowerCase();
        filteredStudents = filteredStudents.filter(s => s.name.toLowerCase().includes(lowerSearch));
      }
      setStudents(filteredStudents);
      const startDate = daysInMonth[0];
      const endDate = daysInMonth[daysInMonth.length - 1];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .in('id', filteredStudents.map(s => s.id));
      if (attendanceError) throw attendanceError;

      const attendanceMap: Record<string, Record<number, string>> = {};
      daysInMonth.forEach(date => {
        attendanceMap[date] = {};
      });
      (attendanceData || []).forEach((record: AttendanceRecord) => {
        attendanceMap[record.date][record.student_id] = record.status;
      });
      setAttendanceRecords(attendanceMap);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Fetch data error:', err);
        setError(err.message);
      } else {
        console.error('Fetch data unknown error:', err);
        setError('Unknown error');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, searchTerm]);

  const [pendingAttendance, setPendingAttendance] = useState<Record<string, Record<number, string>>>({});

  const handleCheckboxChange = (studentId: number, date: string, checked: boolean) => {
    const newStatus = checked ? 'Present' : 'Absent';
    setPendingAttendance(prev => {
      const updated = { ...prev };
      if (!updated[date]) updated[date] = {};
      updated[date][studentId] = newStatus;
      return updated;
    });
    setAttendanceRecords(prev => {
      const updated = { ...prev };
      if (!updated[date]) updated[date] = {};
      updated[date][studentId] = newStatus;
      return updated;
    });
  };

  // const handleSubmitAttendance = async () => {
  //   try {
  //     const recordsToUpsert: {id: number; date: string; status: string }[] = [];
  //     for (const date in pendingAttendance) {
  //       for (const studentIdStr in pendingAttendance[date]) {
  //         const studentId = Number(studentIdStr);
  //         const status = pendingAttendance[date][studentId];
  //         recordsToUpsert.push({ id: studentId, date, status });
  //       }
  //     }
  //     if (recordsToUpsert.length === 0) return;

  //     const { error } = await supabase.from('attendance').upsert(recordsToUpsert, { onConflict: ['id', 'date'] });
  //     if (error) throw error;
  //     setPendingAttendance({});
  //     setError(null);
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       setError(err.message);
  //     } else {
  //       setError('Failed to update attendance');
  //     }
  //   }
  // }

     const handleSubmitAttendance = async () => {
     try {
       const recordsToUpsert: { student_id: number; date: string; status: string }[] = [];
       for (const date in pendingAttendance) {
         for (const studentIdStr in pendingAttendance[date]) {
           const studentId = Number(studentIdStr);
           const status = pendingAttendance[date][studentId];
           recordsToUpsert.push({ student_id: studentId, date, status });
         }
       }
       if (recordsToUpsert.length === 0) return;

       const { error } = await supabase.from('attendance').upsert(recordsToUpsert);
       if (error) throw new Error(`Failed to update attendance: ${error.message}`);
       
       setPendingAttendance({});
       setError(null);
     } catch (err: unknown) {
       if (err instanceof Error) {
         console.error('Submit attendance error:', err);
         setError(err.message);
       } else {
         console.error('Submit attendance unknown error:', err);
         setError('Failed to update attendance');
       }
     }
   };
   

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedMonth(newDate);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    fetchData();
  };

  if (loading) return <div>Loading attendance data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // Calculate attendance summary for the month

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Attendance</h1>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Select Category</label>
            <select
              id="category"
              className="input-field"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="All">All</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">Select Month</label>
          <input
            type="month"
            id="month"
            className="input-field"
            value={`${selectedMonth.getFullYear()}-${(selectedMonth.getMonth() + 1).toString().padStart(2, '0')}`}
            onChange={handleMonthChange}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Select Date</label>
          <input
            type="date"
            id="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={`${selectedMonth.getFullYear()}-${(selectedMonth.getMonth() + 1).toString().padStart(2, '0')}-01`}
            max={`${selectedMonth.getFullYear()}-${(selectedMonth.getMonth() + 1).toString().padStart(2, '0')}-${daysInMonth.length.toString().padStart(2, '0')}`}
          />
        </div>

        <div className="flex-grow relative">
          <label htmlFor="search" className="sr-only">Search Students</label>
          <input
            type="text"
            id="search"
            className="input-field pl-10"
            placeholder="Search students..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="absolute left-3 top-2.5">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleSearchClick}
        >
          Search
        </button>
        <button
          className="btn-secondary ml-4"
          onClick={handleSubmitAttendance}
          disabled={Object.keys(pendingAttendance).length === 0}
        >
          Submit Attendance
        </button>
      </div>

      <div className="space-y-6 mt-4">
        {(selectedDate ? [selectedDate] : daysInMonth).map(date => (
          <div key={date} className="border border-gray-300 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{new Date(date).toLocaleDateString()}</h2>
            <table className="min-w-full border-collapse table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">Student</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700">Present</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  students.reduce((acc, student) => {
                    if (!acc[student.category]) acc[student.category] = [];
                    acc[student.category].push(student);
                    return acc;
                  }, {} as Record<string, Student[]>)
                ).map(([category, studentsInCategory]) => (
                  <React.Fragment key={category}>
                    <tr>
                      <td
                        colSpan={2}
                        className="bg-gray-200 font-semibold px-3 py-2 text-gray-700"
                      >
                        {category}
                      </td>
                    </tr>
                    {studentsInCategory.map(student => {
                      const status = attendanceRecords[date]?.[student.id] || 'Absent';
                      return (
                        <tr key={student.id} className="hover:bg-gray-100 even:bg-white odd:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-800">{student.name}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              className="cursor-pointer"
                              checked={status === 'Present'}
                              onChange={e => handleCheckboxChange(student.id, date, e.target.checked)}
                              aria-label={`Mark attendance for ${student.name} on ${date}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-6 text-gray-500 italic">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};


export default Attendance;