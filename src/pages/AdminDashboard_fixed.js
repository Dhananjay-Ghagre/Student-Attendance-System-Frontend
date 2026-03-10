import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Plus, UserCheck, GraduationCap, BarChart3, Calendar, UserPlus } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: '', code: '' });
  const [stats, setStats] = useState({ admins: 0, teachers: 0, students: 0 });
  const [totalStudents, setTotalStudents] = useState(0);
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignmentForm, setAssignmentForm] = useState({ courseId: '', teacherId: '' });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
    loadReports();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, coursesRes, teachersRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getCourses(),
        adminAPI.getTeachers()
      ]);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setTeachers(teachersRes.data);
      
      const roleStats = usersRes.data.reduce((acc, user) => {
        acc[user.role.toLowerCase() + 's'] = (acc[user.role.toLowerCase() + 's'] || 0) + 1;
        return acc;
      }, {});
      setStats(roleStats);
    } catch (error) {
      toast.error('Error loading data');
    }
  };

  const loadReports = async () => {
    try {
      const [totalRes, enrollmentsRes] = await Promise.all([
        adminAPI.getTotalStudents(),
        adminAPI.getCourseEnrollments()
      ]);
      setTotalStudents(totalRes.data.totalStudents);
      setCourseEnrollments(enrollmentsRes.data);
    } catch (error) {
      toast.error('Error loading reports');
    }
  };

  const loadAttendanceReport = async (date) => {
    try {
      const response = await adminAPI.getAttendanceByDate(date);
      setAttendanceReport(response.data);
    } catch (error) {
      toast.error('Error loading attendance report');
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.assignTeacher(assignmentForm);
      toast.success('Teacher assigned successfully!');
      setAssignmentForm({ courseId: '', teacherId: '' });
      loadData();
    } catch (error) {
      toast.error('Error assigning teacher');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCourse(newCourse);
      setNewCourse({ name: '', code: '' });
      toast.success('Course created successfully!');
      loadData();
    } catch (error) {
      toast.error('Error creating course');
    }
  };

  const roleData = [
    { name: 'Students', value: stats.students || 0, color: '#3b82f6' },
    { name: 'Teachers', value: stats.teachers || 0, color: '#10b981' },
    { name: 'Admins', value: stats.admins || 0, color: '#f59e0b' }
  ];

  const courseData = courses.map(course => ({
    name: course.code,
    students: Math.floor(Math.random() * 50) + 10
  }));

  const attendanceChartData = attendanceReport.map(report => ({
    name: report.courseCode,
    present: report.presentStudents,
    absent: report.absentStudents
  }));

  return (
    <div className="min-h-screen bg-white relative">
      
      <div className="p-0 space-y-8 relative z-10 w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-8">
        <div>
          <h1 className="text-4xl font-bold text-indigo-700">Admin Dashboard</h1>
          <p className="text-lg mt-2 text-indigo-600">Manage your institution efficiently</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'overview' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'reports' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'assignments' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            Assignments
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
            <div className="stat-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-3xl font-bold mt-2 text-indigo-700">{users.length}</p>
                </div>
                <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-blue-100">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="stat-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Teachers</p>
                  <p className="text-3xl font-bold mt-2 text-indigo-700">{stats.teachers || 0}</p>
                </div>
                <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-emerald-100">
                  <UserCheck className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="stat-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Students</p>
                  <p className="text-3xl font-bold mt-2 text-indigo-700">{totalStudents}</p>
                </div>
                <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-purple-100">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="stat-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Courses</p>
                  <p className="text-3xl font-bold mt-2 text-indigo-700">{courses.length}</p>
                </div>
                <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-amber-100">
                  <BookOpen className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8">
            <div className="card-gradient">
              <h3 className="text-xl font-bold mb-6 text-indigo-700">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="card-gradient">
              <h3 className="text-xl font-bold mb-6 text-indigo-700">Course Enrollment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Create Course Form */}
          <div className="card-gradient mx-8">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-2xl mr-4 bg-indigo-100">
                <Plus className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-700">Create New Course</h2>
            </div>
            <form onSubmit={handleCreateCourse} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Course Name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="input-field flex-1"
                required
              />
              <input
                type="text"
                placeholder="Course Code"
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                className="input-field flex-1"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Create Course
              </button>
            </form>
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-8">
            {/* Users Table */}
            <div className="card-gradient">
              <h2 className="text-2xl font-bold mb-6 text-indigo-700">Users ({users.length})</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y border-primary">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-primary">
                    {users.map(user => (
                      <tr key={user.id} className="table-row">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium table-cell">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">
                          {user.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-800' :
                            user.role === 'TEACHER' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Courses Table */}
            <div className="card-gradient">
              <h2 className="text-2xl font-bold mb-6 text-indigo-700">Courses ({courses.length})</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y border-primary">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Teacher
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-primary">
                    {courses.map(course => (
                      <tr key={course.id} className="table-row">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium table-cell">
                          {course.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">
                          {course.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">
                          {course.teacher ? course.teacher.fullName : (
                            <span className="text-red-500">Not Assigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          {/* Course Enrollments */}
          <div className="card-gradient mx-8">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">Course Enrollments</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y border-primary">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Enrolled Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-primary">
                  {courseEnrollments.map(course => (
                    <tr key={course.courseId} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium table-cell">{course.courseName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">{course.courseCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm table-cell">{course.enrolledStudents}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">{course.teacherName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attendance Report */}
          <div className="card-gradient mx-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-indigo-700">Daily Attendance Report</h2>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    loadAttendanceReport(e.target.value);
                  }}
                  className="input-field"
                />
              </div>
            </div>
            
            {attendanceReport.length > 0 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attendanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="present" fill="#10b981" name="Present" />
                      <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    {attendanceReport.map(report => (
                      <div key={report.courseId} className="p-4 border border-primary rounded-lg">
                        <h3 className="font-semibold text-primary">{report.courseName}</h3>
                        <div className="mt-2 flex justify-between text-sm">
                          <span className="text-green-600">Present: {report.presentStudents}</span>
                          <span className="text-red-600">Absent: {report.absentStudents}</span>
                        </div>
                        <div className="mt-2 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(report.presentStudents / report.totalStudents) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y border-primary">
                    <thead className="table-header">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Total Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Present</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Absent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-primary">
                      {attendanceReport.map(report => (
                        <tr key={report.courseId} className="table-row">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium table-cell">{report.courseName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm table-cell">{report.totalStudents}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{report.presentStudents}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{report.absentStudents}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm table-cell">
                            {((report.presentStudents / report.totalStudents) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <>
          {/* Assign Teacher Form */}
          <div className="card-gradient mx-8">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-2xl mr-4 bg-indigo-100">
                <UserPlus className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-700">Assign Teacher to Course</h2>
            </div>
            <form onSubmit={handleAssignTeacher} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={assignmentForm.courseId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                ))}
              </select>
              
              <select
                value={assignmentForm.teacherId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, teacherId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                ))}
              </select>
              
              <button type="submit" className="btn-primary">
                Assign Teacher
              </button>
            </form>
          </div>

          {/* Current Assignments */}
          <div className="card-gradient mx-8">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">Current Teacher Assignments</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y border-primary">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Assigned Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-primary">
                  {courses.map(course => (
                    <tr key={course.id} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium table-cell">{course.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">{course.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm table-cell">
                        {course.teacher ? course.teacher.fullName : 'Not Assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          course.teacher ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {course.teacher ? 'Assigned' : 'Unassigned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;