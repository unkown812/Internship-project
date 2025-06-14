import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

interface Exam {
  id: number;
  name: string;
  date: string;
  category: string;
}

const UpcomingExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamCourses, setNewExamCourses] = useState('');
  // const [showAddExamForm, setShowAddExamForm] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('date', { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setExams(data as Exam[]);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async () => {
    if (!newExamName || !newExamDate) {
      setError('Please provide exam name and date.');
      return;
    }
    setLoading(true);
    const coursesArray = newExamCourses.split(',').filter(c => c.length > 0);
    const { error } = await supabase
      .from('exams')
      .insert([{ name: newExamName, date: newExamDate, category: coursesArray }]);
    if (error) {
      setError(error.message);
    } else {
      setNewExamName('');
      setNewExamDate('');
      setNewExamCourses('');
      setError(null);
      fetchExams();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-white">
        <h2 className="text-lg font-semibold mb-2">Create New Exam</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Exam Name</label>
          <input
            type="text"
            value={newExamName}
            onChange={e => setNewExamName(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="Enter exam name"
            title="Exam Name"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={newExamDate}
            onChange={e => setNewExamDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
            title="Exam Date"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Courses </label>
          <input
            type="text"
            value={newExamCourses}
            onChange={e => setNewExamCourses(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="e.g. Math, Science"
            title="Courses"
          />
        </div>
        <button
          onClick={handleCreateExam}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Creating...' : 'Create Exam'}
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Upcoming Exams</h2>
        {loading && <p>Loading exams...</p>}
        {!loading && exams.length === 0 && <p>No upcoming exams.</p>}
        {!loading && exams.length > 0 && (
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Exam Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Categories</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{exam.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {/* {exam.category.join(', ')} */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UpcomingExams;
