import React, { useState } from 'react';
import { PlusCircle, Search, Filter, BookOpen, Users, Clock } from 'lucide-react';
import TabNav from '../components/ui/TabNav';
const MOCK_COURSES = [
  {
    id: 1,
    name: '10th Science',
    category: 'School (8-10th)',
    students: 42,
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    duration: '12 months',
    fee: 15000,
    teachers: ['Rajesh Kumar', 'Sneha Sharma']
  },
  {
    id: 2,
    name: '9th Science',
    category: 'School (8-10th)',
    students: 38,
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    duration: '12 months',
    fee: 12000,
    teachers: ['Anita Desai', 'Prakash Verma']
  },
  {
    id: 3,
    name: '12th PCM',
    category: 'Junior College (11-12th)',
    students: 35,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    duration: '12 months',
    fee: 18000,
    teachers: ['Dr. Mohan Singh', 'Kavita Patel']
  },
  {
    id: 4,
    name: '11th PCB',
    category: 'Junior College (11-12th)',
    students: 32,
    subjects: ['Physics', 'Chemistry', 'Biology'],
    duration: '12 months',
    fee: 18000,
    teachers: ['Dr. Shweta Iyer', 'Rahul Sharma']
  },
  {
    id: 5,
    name: 'JEE Advanced',
    category: 'JEE',
    students: 28,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    duration: '18 months',
    fee: 25000,
    teachers: ['Dr. Vijay Reddy', 'Pooja Mehta']
  },
  {
    id: 6,
    name: 'NEET Preparation',
    category: 'NEET',
    students: 30,
    subjects: ['Physics', 'Chemistry', 'Biology'],
    duration: '18 months',
    fee: 25000,
    teachers: ['Dr. Arjun Singh', 'Dr. Meera Gupta']
  },
  {
    id: 7,
    name: 'MHCET Engineering',
    category: 'MHCET',
    students: 25,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    duration: '6 months',
    fee: 15000,
    teachers: ['Vikram Joshi', 'Neha Sharma']
  },
  {
    id: 8,
    name: 'Diploma in Engineering',
    category: 'Diploma',
    students: 22,
    subjects: ['Engineering Mathematics', 'Engineering Physics', 'Computer Science'],
    duration: '24 months',
    fee: 20000,
    teachers: ['Prof. Deepak Kumar', 'Anjali Mishra']
  },
  {
    id: 9,
    name: 'B.Sc. Physics',
    category: 'Degree',
    students: 18,
    subjects: ['Mechanics', 'Electromagnetism', 'Modern Physics', 'Mathematics'],
    duration: '36 months',
    fee: 22000,
    teachers: ['Dr. Sanjay Patel', 'Dr. Priya Nair']
  }
];


const MOCK_BATCHES = [
  { id: 1, name: 'Morning Batch - 10th Science', course: '10th Science', timing: '7:00 AM - 9:00 AM', days: 'Mon, Wed, Fri', students: 22, teacher: 'Rajesh Kumar' },
  { id: 2, name: 'Evening Batch - 10th Science', course: '10th Science', timing: '5:00 PM - 7:00 PM', days: 'Mon, Wed, Fri', students: 20, teacher: 'Sneha Sharma' },
  { id: 3, name: 'Morning Batch - JEE Advanced', course: 'JEE Advanced', timing: '7:00 AM - 10:00 AM', days: 'Tue, Thu, Sat', students: 15, teacher: 'Dr. Vijay Reddy' },
  { id: 4, name: 'Weekend Batch - NEET', course: 'NEET Preparation', timing: '9:00 AM - 1:00 PM', days: 'Sat, Sun', students: 18, teacher: 'Dr. Arjun Singh' },
  { id: 5, name: 'Evening Batch - 12th PCM', course: '12th PCM', timing: '6:00 PM - 8:00 PM', days: 'Mon to Fri', students: 25, teacher: 'Dr. Mohan Singh' }
];

const Courses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('courses');
  const categories = ['All', 'School (8-10th)', 'Junior College (11-12th)', 'Diploma', 'Degree', 'JEE', 'NEET', 'MHCET'];
  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.id.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const filteredBatches = MOCK_BATCHES.filter(batch => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' ||
      MOCK_COURSES.find(course => course.name === batch.course)?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const tabs = [
    { id: 'courses', label: 'Courses' },
    { id: 'batches', label: 'Batches' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Courses Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all courses and batches offered by SK Tutorials
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn-primary flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" />
            {activeTab === 'courses' ? 'Add New Course' : 'Add New Batch'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-2xl font-semibold">{MOCK_COURSES.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Batches</p>
              <p className="text-2xl font-semibold">{MOCK_BATCHES.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold">{MOCK_COURSES.reduce((sum, course) => sum + course.students, 0)}</p>
            </div>
          </div>
        </div>
      </div>
      <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab === 'courses' ? 'courses' : 'batches'}...`}
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            title='selectedcategory'
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
      </div>

      {activeTab === 'courses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                  <span className="badge badge-blue mt-1">{course.category}</span>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-primary font-medium">
                  ₹{course.fee.toLocaleString()}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Students</p>
                    <p className="font-medium">{course.students}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Subjects</p>
                    <p className="font-medium">{course.subjects.length}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{course.duration}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Subjects:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {course.subjects.map((subject, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Faculty:</p>
                <div className="mt-1">
                  {course.teachers.map((teacher, idx) => (
                    <p key={idx} className="text-sm text-gray-600">{teacher}</p>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-between">
                <button className="text-primary hover:text-primary-dark font-medium">
                  View Details
                </button>
                <button className="text-primary hover:text-primary-dark font-medium">
                  Edit Course
                </button>
              </div>
            </div>
          ))}
          {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No courses found matching your criteria</p>
            </div>
          )}
        </div>
      ):(
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Course</th>
                <th>Schedule</th>
                <th>Teacher</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBatches.map((batch) => (
                <tr key={batch.id}>
                  <td className="font-medium">{batch.name}</td>
                  <td>
                    <span className="badge badge-blue">{batch.course}</span>
                  </td>
                  <td>
                    <div>{batch.timing}</div>
                    <div className="text-sm text-gray-500">{batch.days}</div>
                  </td>
                  <td>{batch.teacher}</td>
                  <td>{batch.students}</td>
                  <td className="space-x-2">
                    <button className="text-primary hover:text-primary-dark font-medium">
                      View
                    </button>
                    <button className="text-primary hover:text-primary-dark font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No batches found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Courses;