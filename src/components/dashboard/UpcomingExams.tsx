import React from 'react';
import { Calendar } from 'lucide-react';

const UPCOMING_EXAMS = [
  { id: 1, name: 'Monthly Test - Physics', date: '2025-05-18', courses: ['12th PCM', 'JEE Advanced'] },
  { id: 2, name: 'Biology Quarterly Exam', date: '2025-05-22', courses: ['NEET', '10th Science'] },
  { id: 3, name: 'Mathematics Mock Test', date: '2025-05-25', courses: ['JEE Mains', '12th PCM'] },
  { id: 4, name: 'Chemistry Unit Test', date: '2025-05-29', courses: ['12th PCB', 'NEET'] }
];

const UpcomingExams: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* {UPCOMING_EXAMS.map((exam) => (
        <div key={exam.id} className="flex space-x-4 p-3 border rounded-lg hover:bg-gray-50">
          <div className="flex-shrink-0 bg-blue-100 text-blue-800 rounded-lg p-3 text-center">
            <Calendar className="h-5 w-5 mx-auto" />
            <div className="text-xs mt-1 font-medium">
              {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div>
            <h3 className="font-medium">{exam.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {exam.courses.map((course, idx) => (
                <span key={idx} className="badge badge-blue">{course}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="mt-2">
        <button className="text-sm text-primary font-medium hover:underline">
          View all exams →
        </button>
      </div> */}
    </div>
  );
};

export default UpcomingExams;