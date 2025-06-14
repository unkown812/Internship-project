import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import supabase from '../lib/supabase';
import TabNav from '../components/ui/TabNav';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
  year: string;
}

interface AttendanceRecord {
  student_id: number;
  date: string;
  status: string;
}

const AttendancePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>(''); // Unused state, consider removing
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<string>('mark');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, Record<number, string>>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM
  });
  const [daysInMonth, setDaysInMonth] = useState<number>(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate());

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const startDate = selectedMonth + '-01';
        const endDate = new Date(new Date(selectedMonth + '-01').getFullYear(), new Date(selectedMonth + '-01').getMonth() + 1, 0);
        setDaysInMonth(endDate.getDate());

        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate.toISOString().slice(0, 10));

        if (attendanceError) throw attendanceError;

        // Map attendance by student_id and day
        const map: Record<number, Record<number, string>> = {};
        attendanceData?.forEach((record: AttendanceRecord) => {
          const day = new Date(record.date).getDate();
          if (!map[record.student_id]) map[record.student_id] = {};
          map[record.student_id][day] = record.status;
        });
        setAttendanceMap(map);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      }
      setLoading(false);
    };
    fetchAttendance();
  }, [selectedMonth]);

  const groupedStudents = React.useMemo(() => {
    const groups: Record<string, Record<string, Record<string, Student[]>>> = {};
    students.forEach(student => {
      // Apply search filter
      if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase()) && !student.id.toString().includes(searchTerm)) return;
      if (selectedCategory !== 'All' && student.category !== selectedCategory) return;
      if (!groups[student.category]) groups[student.category] = {};
      if (!groups[student.category][student.course]) groups[student.category][student.course] = {};
      if (!groups[student.category][student.course][student.year]) groups[student.category][student.course][student.year] = [];
      groups[student.category][student.course][student.year].push(student);
    });
    return groups;
  }, [students, selectedCategory, searchTerm]);

  const handleStatusChange = (studentId: number, day: number, status: string) => {
    setAttendanceMap(prev => {
      const newMap = { ...prev };
      if (!newMap[studentId]) newMap[studentId] = {};
      newMap[studentId][day] = status;
      return newMap;
    });
  };

  // Sorting handlers
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedGroupedStudents = React.useMemo(() => {
    if (!sortConfig) return groupedStudents;

    const sortedGroups: Record<string, Record<string, Record<string, Student[]>>> = {};

    // Sort categories
    const categories = Object.keys(groupedStudents).sort((a, b) => {
      if (sortConfig.key === 'category') {
        return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      }
      return 0;
    });

    categories.forEach(category => {
      sortedGroups[category] = {};
      const courses = Object.keys(groupedStudents[category]).sort((a, b) => {
        if (sortConfig.key === 'course') {
          return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
        }
        return 0;
      });
      courses.forEach(course => {
        sortedGroups[category][course] = {};
        const years = Object.keys(groupedStudents[category][course]).sort((a, b) => {
          if (sortConfig.key === 'year') {
            return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
          }
          return 0;
        });
        years.forEach(year => {
          let studentsList = groupedStudents[category][course][year];
          if (sortConfig.key === 'name') {
            studentsList = [...studentsList].sort((a, b) => {
              return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            });
          }
          sortedGroups[category][course][year] = studentsList;
        });
      });
    });

    return sortedGroups;
  }, [groupedStudents, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const recordsToInsert: AttendanceRecord[] = [];
      Object.entries(attendanceMap).forEach(([studentIdStr, days]) => {
        const studentId = parseInt(studentIdStr);
        Object.entries(days).forEach(([dayStr, status]) => {
          const day = parseInt(dayStr);
          const date = new Date(selectedMonth + '-01');
          date.setDate(day);
          recordsToInsert.push({
            student_id: studentId,
            date: date.toISOString().slice(0, 10),
            status
          });
        });
      });

      const { error: upsertError } = await supabase.from('attendance').upsert(recordsToInsert);
      if (upsertError) throw upsertError;
      alert('Attendance saved successfully.');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error');
      alert('Failed to save attendance');
    }
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['Category', 'Course', 'Year', 'Student ID', 'Name'];
    for (let day = 1; day <= daysInMonth; day++) {
      headers.push(day.toString());
    }
    const rows: string[][] = [];
    Object.entries(groupedStudents).forEach(([category, courses]) => {
      Object.entries(courses).forEach(([course, years]) => {
        Object.entries(years).forEach(([year, studentsList]) => {
          studentsList.forEach(student => {
            const row = [category, course, year, student.id.toString(), student.name];
            for (let day = 1; day <= daysInMonth; day++) {
              row.push(attendanceMap[student.id]?.[day] || '');
            }
            rows.push(row);
          });
        });
      });
    });

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'mark', label: 'Mark Attendance' },
    { id: 'summary', label: 'Summary' }
  ];

  // Prepare summary data grouped by category
  const summaryData = React.useMemo(() => {
    const summaryGroups: Record<string, { studentCount: number; presentCount: number }> = {};
    students.forEach(student => {
      if (selectedCategory !== 'All' && student.category !== selectedCategory) return;
      if (!summaryGroups[student.category]) {
        summaryGroups[student.category] = { studentCount: 0, presentCount: 0 };
      }
      summaryGroups[student.category].studentCount += 1;
      // Count present days for the student in the selected month
      const attendanceDays = attendanceMap[student.id] || {};
      const presentDays = Object.values(attendanceDays).filter(status => status === 'Present').length;
      summaryGroups[student.category].presentCount += presentDays;
    });
    return summaryGroups;
  }, [students, attendanceMap, selectedCategory]);

  // Render summary tab content
  const renderSummaryTab = () => {
    return (
      <div className="overflow-auto max-h-[600px] border rounded shadow bg-white">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="border px-2 py-1 text-left">Category</th>
              <th className="border px-2 py-1 text-left">Course</th>
              <th className="border px-2 py-1 text-left">Year</th>
              <th className="border px-2 py-1 text-left">Name</th>
              {[...Array(daysInMonth)].map((_, i) => (
                <th key={i} className="border px-1 py-1 text-center">{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(sortedGroupedStudents).map(([category, courses]) =>
              Object.entries(courses).map(([course, years]) =>
                Object.entries(years).map(([year, studentsList]) =>
                  studentsList.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="border px-2 py-1">{category}</td>
                      <td className="border px-2 py-1">{course}</td>
                      <td className="border px-2 py-1">{year}</td>
                      <td className="border px-2 py-1">{student.name}</td>
                      {[...Array(daysInMonth)].map((_, dayIndex) => {
                        const day = dayIndex + 1;
                        const status = attendanceMap[student.id]?.[day] || 'Absent';
                        return (
                          <td key={day} className="border px-1 py-1 text-center">
                            {status}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )
              )
            )}
            {students.length === 0 && (
              <tr><td colSpan={4 + daysInMonth} className="text-center py-4 text-gray-500">No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeTab === 'summary' && (
        <div className="overflow-auto max-h-[600px] border rounded shadow bg-white p-4">
          <h2 className="text-lg font-semibold mb-4">Monthly Attendance Summary - {selectedMonth}</h2>
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-2 py-1 text-left">Category</th>
                <th className="border px-2 py-1 text-left">Total Students</th>
                <th className="border px-2 py-1 text-left">Total Present Days</th>
                <th className="border px-2 py-1 text-left">Average Attendance (%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summaryData).map(([category, data]) => {
                const totalPossibleDays = data.studentCount * daysInMonth;
                const averageAttendance = totalPossibleDays > 0 ? ((data.presentCount / totalPossibleDays) * 100).toFixed(2) : '0.00';
                return (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{category}</td>
                    <td className="border px-2 py-1">{data.studentCount}</td>
                    <td className="border px-2 py-1">{data.presentCount}</td>
                    <td className="border px-2 py-1">{averageAttendance}%</td>
                  </tr>
                );
              })}
              {Object.keys(summaryData).length === 0 && (
                <tr><td colSpan={4} className="text-center py-4 text-gray-500">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'mark' && (
        <>
          <div className="flex justify-end space-x-2 bg-white p-4 rounded shadow">
            <button className="btn-primary" disabled={loading} onClick={handleSaveAttendance}>Save Attendance</button>
          </div>

          <div className="overflow-auto max-h-[600px] border rounded shadow bg-white">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th
                    className="border px-2 py-1 text-left cursor-pointer"
                    onClick={() => requestSort('category')}
                  >
                    Category
                  </th>
                  <th
                    className="border px-2 py-1 text-left cursor-pointer"
                    onClick={() => requestSort('course')}
                  >
                    Course
                  </th>
                  <th
                    className="border px-2 py-1 text-left cursor-pointer"
                    onClick={() => requestSort('year')}
                  >
                    Year
                  </th>
                  <th
                    className="border px-2 py-1 text-left cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    Name
                  </th>
                  {[...Array(daysInMonth)].map((_, i) => (
                    <th key={i} className="border px-1 py-1 text-center">{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(sortedGroupedStudents).map(([category, courses]) =>
                  Object.entries(courses).map(([course, years]) =>
                    Object.entries(years).map(([year, studentsList]) =>
                      studentsList.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="border px-2 py-1">{category}</td>
                          <td className="border px-2 py-1">{course}</td>
                          <td className="border px-2 py-1">{year}</td>
                          <td className="border px-2 py-1">{student.name}</td>
                          {[...Array(daysInMonth)].map((_, dayIndex) => {
                            const day = dayIndex + 1;
                            const status = attendanceMap[student.id]?.[day] || 'Absent';
                            const checked = status === 'Present';
                            return (
                              <td key={day} className="border px-1 py-1 text-center">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  aria-label={`Mark attendance for day ${day}`}
                                  onChange={e => handleStatusChange(student.id, day, e.target.checked ? 'Present' : 'Absent')}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )
                  )
                )}
                {students.length === 0 && (
                  <tr><td colSpan={4 + daysInMonth} className="text-center py-4 text-gray-500">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendancePage;

//       <div className="flex flex-wrap gap-4 items-center">
//         <div>
//           <label htmlFor="month" className="text-sm font-medium mr-2">Select Month:</label>
//           <input
//             type="month"
//             id="month"
//             className="input-field"
//             value={selectedMonth}
//             onChange={e => setSelectedMonth(e.target.value)}
//           />
//         </div>
//         <div>
//           <label htmlFor="category" className="text-sm font-medium mr-2">Select Category:</label>
//           <select
//             id="category"
//             className="input-field"
//             value={selectedCategory}
//             onChange={e => setSelectedCategory(e.target.value)}
//           >
//             {['All', 'School (8-10th)', 'Junior College (11-12th)', 'Diploma', 'Degree', 'JEE', 'NEET', 'MHCET'].map(cat => (
//               <option key={cat}>{cat}</option>
//             ))}
//           </select>
//         </div>
//         {activeTab === 'summary' && (
//           <button className="btn-secondary flex items-center" onClick={exportToCSV}>
//             <Download className="h-5 w-5 mr-2" />Export
//           </button>
//         )}
//       </div>

//       {activeTab === 'mark' && (
//         <>
//           <div className="flex justify-end space-x-2 bg-white p-4 rounded shadow">
//             <button className="btn-primary" disabled={loading} onClick={handleSaveAttendance}>Save Attendance</button>
//           </div>

//           <div className="overflow-auto max-h-[600px] border rounded shadow bg-white">
//             <table className="min-w-full border-collapse">
//               <thead className="bg-gray-100 sticky top-0">
//                 <tr>
//                   <th
//                     className="border px-2 py-1 text-left cursor-pointer"
//                     onClick={() => requestSort('category')}
//                   >
//                     Category
//                   </th>
//                   <th
//                     className="border px-2 py-1 text-left cursor-pointer"
//                     onClick={() => requestSort('course')}
//                   >
//                     Course
//                   </th>
//                   <th
//                     className="border px-2 py-1 text-left cursor-pointer"
//                     onClick={() => requestSort('year')}
//                   >
//                     Year
//                   </th>
//                   <th
//                     className="border px-2 py-1 text-left cursor-pointer"
//                     onClick={() => requestSort('name')}
//                   >
//                     Name
//                   </th>
//                   {[...Array(daysInMonth)].map((_, i) => (
//                     <th key={i} className="border px-1 py-1 text-center">{i + 1}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.entries(sortedGroupedStudents).map(([category, courses]) =>
//                   Object.entries(courses).map(([course, years]) =>
//                     Object.entries(years).map(([year, studentsList]) =>
//                       studentsList.map(student => (
//                         <tr key={student.id} className="hover:bg-gray-50">
//                           <td className="border px-2 py-1">{category}</td>
//                           <td className="border px-2 py-1">{course}</td>
//                           <td className="border px-2 py-1">{year}</td>
//                           <td className="border px-2 py-1">{student.name}</td>
//                           {[...Array(daysInMonth)].map((_, dayIndex) => {
//                             const day = dayIndex + 1;
//                             const status = attendanceMap[student.id]?.[day] || 'Absent';
//                             const checked = status === 'Present';
//                             return (
//                               <td key={day} className="border px-1 py-1 text-center">
//                                 <input
//                                   type="checkbox"
//                                   checked={checked}
//                                   aria-label={`Mark attendance for day ${day}`}
//                                   onChange={e => handleStatusChange(student.id, day, e.target.checked ? 'Present' : 'Absent')}
//                                 />
//                               </td>
//                             );
//                           })}
//                         </tr>
//                       ))
//                     )
//                   )
//                 )}
//                 {students.length === 0 && (
//                   <tr><td colSpan={4 + daysInMonth} className="text-center py-4 text-gray-500">No students found</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AttendancePage;