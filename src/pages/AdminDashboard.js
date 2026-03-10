import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Plus, UserCheck, GraduationCap, BarChart3, Calendar, UserPlus, User, Edit, Home, FileText, Settings, Filter, CheckCircle, XCircle, Search, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import CurrentDateTime from '../components/CurrentDateTime';
import CalendarComponent from '../components/Calendar';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: '', code: '' });
  const [stats, setStats] = useState({ admins: 0, teachers: 0, students: 0 });
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignmentForm, setAssignmentForm] = useState({ courseId: '', teacherId: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    email: '',
    role: ''
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    courseId: '',
    studentId: '',
    batch: '',
    year: ''
  });
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceModalData, setAttendanceModalData] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceModalType, setAttendanceModalType] = useState('');
  const [approvedLeaves, setApprovedLeaves] = useState([]);



  useEffect(() => {
    loadData();
    loadReports();
    loadApprovedLeaves();
    // Load today's attendance report by default
    loadAttendanceReport(selectedDate);
  }, []);
  
  // Load attendance when activeTab changes to calendar
  useEffect(() => {
    if (activeTab === 'calendar') {
      loadAttendanceReport(selectedDate);
    }
  }, [activeTab]);

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
      const enrollmentsRes = await adminAPI.getCourseEnrollments();
      setCourseEnrollments(enrollmentsRes.data);
    } catch (error) {
      toast.error('Error loading reports');
    }
  };

  const loadApprovedLeaves = async () => {
    try {
      const response = await adminAPI.getApprovedLeaves(selectedDate);
      setApprovedLeaves(response.data);
    } catch (error) {
      console.error('Error loading approved leaves:', error);
      setApprovedLeaves([]);
    }
  };

  const loadAttendanceReport = async (date) => {
    try {
      console.log('Loading attendance for date:', date);
      const response = await adminAPI.getAttendanceByDate(date);
      console.log('Attendance response:', response.data);
      
      // Handle empty response (no attendance marked)
      if (!response.data || response.data.length === 0) {
        setAttendanceReport([]);
        toast(`${date}: No attendance marked for this date`);
        loadApprovedLeaves();
        return;
      }
      
      setAttendanceReport(response.data);
      
      // Show summary after data is loaded
      const totalPresent = response.data.reduce((sum, report) => sum + (report.presentStudents || 0), 0);
      const totalAbsent = response.data.reduce((sum, report) => sum + (report.absentStudents || 0), 0);
      const totalStudents = response.data.reduce((sum, report) => sum + (report.totalStudents || 0), 0);
      
      if (totalStudents > 0) {
        toast.success(`${date}: ${totalPresent} Present, ${totalAbsent} Absent (${totalStudents} Total)`);
      } else {
        toast(`${date}: No students found for this date`);
      }
      
      loadApprovedLeaves();
    } catch (error) {
      console.error('Error loading attendance report:', error);
      setAttendanceReport([]);
      toast(`${date}: No attendance data available`);
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

  const loadProfile = () => {
    const userData = {
      username: localStorage.getItem('username') || 'admin',
      fullName: localStorage.getItem('fullName') || 'Administrator',
      email: localStorage.getItem('email') || 'admin@example.com',
      role: localStorage.getItem('role') || 'ADMIN'
    };
    setProfile(userData);
    setShowProfile(true);
  };

  const loadFilteredAttendance = async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.batch) params.batch = filters.batch;
      if (filters.year) params.year = filters.year;
      
      console.log('Applying filters:', params);
      const response = await adminAPI.getFilteredAttendance(params);
      console.log('Filtered attendance response:', response.data);
      setFilteredAttendance(response.data);
      toast.success(`Loaded ${response.data.length} attendance records`);
    } catch (error) {
      console.error('Error loading filtered attendance:', error);
      const errorMessage = error.response?.data?.error || 'Error loading attendance data';
      toast.error(errorMessage);
      setFilteredAttendance([]);
    }
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', courseId: '', studentId: '', batch: '', year: '' });
    setFilteredAttendance([]);
  };

  const handleCardClick = (type) => {
    setModalType(type);
    setSearchTerm('');
    let data = [];
    
    switch (type) {
      case 'users':
        data = users;
        break;
      case 'teachers':
        data = users.filter(u => u.role === 'TEACHER');
        break;
      case 'students':
        data = users.filter(u => u.role === 'STUDENT');
        break;
      case 'courses':
        data = courses;
        break;
    }
    setModalData(data);
    setShowModal(true);
  };

  const handleAttendanceCardClick = async (type) => {
    try {
      let data = [];
      
      if (type === 'total') {
        // Show all students (just student details, no attendance status)
        const response = await adminAPI.getStudents();
        data = response.data;
      } else if (type === 'present') {
        // Show only present students
        const response = await adminAPI.getAttendanceByDateAndStatus(selectedDate, true);
        data = response.data;
      } else if (type === 'absent') {
        // Show only absent students
        const response = await adminAPI.getAttendanceByDateAndStatus(selectedDate, false);
        data = response.data;
      } else if (type === 'leaves') {
        // Show approved leaves
        data = approvedLeaves;
      }
      
      console.log(`${type} data:`, data);
      setAttendanceModalData(data);
      setAttendanceModalType(type);
      setShowAttendanceModal(true);
    } catch (error) {
      console.error('Error loading details:', error);
      toast.error('Error loading details');
    }
  };

  const filteredModalData = modalData.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    if (modalType === 'courses') {
      return item.name?.toLowerCase().includes(searchLower) ||
             item.code?.toLowerCase().includes(searchLower) ||
             item.teacher?.fullName?.toLowerCase().includes(searchLower);
    } else {
      return item.fullName?.toLowerCase().includes(searchLower) ||
             item.username?.toLowerCase().includes(searchLower) ||
             item.email?.toLowerCase().includes(searchLower) ||
             item.role?.toLowerCase().includes(searchLower);
    }
  });



  const roleData = [
    { name: 'Students', value: stats.students || 0, color: '#3b82f6' },
    { name: 'Teachers', value: stats.teachers || 0, color: '#10b981' },
    { name: 'Admins', value: stats.admins || 0, color: '#f59e0b' }
  ];

  const courseData = courses.map(course => ({
    name: course.code,
    students: Math.floor(Math.random() * 50) + 10
  }));

  const attendanceChartData = attendanceReport.map(report => {
    // Get leave count for this course on the selected date
    const courseLeaves = approvedLeaves.filter(leave => 
      leave.course?.code === report.courseCode
    ).length;
    
    return {
      name: report.courseCode,
      present: report.presentStudents,
      absent: report.absentStudents,
      onLeave: courseLeaves
    };
  });

  return (
    <div className="min-h-screen bg-white relative">
      
      <div className="p-0 space-y-8 relative z-10 w-full">
      {/* Current Date and Time */}
      <div className="p-8 pb-0">
        <CurrentDateTime />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-lg mt-2 text-gray-700">Manage your institution efficiently</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadProfile}
            className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 transition-all duration-200 hover:scale-105"
          >
            <div className="p-1 bg-white/20 rounded-lg">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline text-sm">Profile</span>
          </button>
          
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          
          <nav className="flex items-center bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-2 shadow-xl shadow-gray-100/50">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/50 transform scale-105' 
                  : 'text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 hover:scale-102'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-white/20' : 'bg-blue-100/50'
              }`}>
                <Home className="h-4 w-4" />
              </div>
              <span className="font-medium">Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'reports' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/50 transform scale-105' 
                  : 'text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 hover:scale-102'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${
                activeTab === 'reports' ? 'bg-white/20' : 'bg-blue-100/50'
              }`}>
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-medium">Reports</span>
            </button>
            
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'calendar' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/50 transform scale-105' 
                  : 'text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 hover:scale-102'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${
                activeTab === 'calendar' ? 'bg-white/20' : 'bg-blue-100/50'
              }`}>
                <Calendar className="h-4 w-4" />
              </div>
              <span className="font-medium">Calendar</span>
            </button>
            
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'assignments' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/50 transform scale-105' 
                  : 'text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 hover:scale-102'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${
                activeTab === 'assignments' ? 'bg-white/20' : 'bg-blue-100/50'
              }`}>
                <Settings className="h-4 w-4" />
              </div>
              <span className="font-medium">Assignments</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button 
              onClick={() => handleCardClick('users')}
              className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-3xl font-bold mt-2 text-blue-600">{users.length}</p>
                </div>
                <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-blue-100">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => handleCardClick('teachers')}
              className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Teachers</p>
                  <p className="text-3xl font-bold mt-2 text-emerald-600">{stats.teachers || 0}</p>
                </div>
                <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-emerald-100">
                  <UserCheck className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => handleCardClick('students')}
              className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Students</p>
                  <p className="text-3xl font-bold mt-2 text-purple-600">{stats.students || 0}</p>
                </div>
                <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-purple-100">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => handleCardClick('courses')}
              className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Courses</p>
                  <p className="text-3xl font-bold mt-2 text-amber-600">{courses.length}</p>
                </div>
                <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-amber-100">
                  <BookOpen className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </button>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-gradient">
              <h3 className="text-xl font-bold mb-6 text-gray-900">User Distribution</h3>
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
              <h3 className="text-xl font-bold mb-6 text-gray-900">Course Enrollment</h3>
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




        </>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          {/* Daily Attendance Report */}
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Daily Attendance Report</h2>
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
                {/* Overall Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <button 
                    onClick={() => handleAttendanceCardClick('total')}
                    className="bg-blue-50 rounded-xl p-4 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Students</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {attendanceReport.reduce((sum, report) => sum + report.totalStudents, 0)}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </button>
                  <button 
                    onClick={() => handleAttendanceCardClick('present')}
                    className="bg-green-50 rounded-xl p-4 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Present</p>
                        <p className="text-2xl font-bold text-green-700">
                          {attendanceReport.reduce((sum, report) => sum + report.presentStudents, 0)}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </button>
                  <button 
                    onClick={() => handleAttendanceCardClick('absent')}
                    className="bg-red-50 rounded-xl p-4 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Absent</p>
                        <p className="text-2xl font-bold text-red-700">
                          {attendanceReport.reduce((sum, report) => sum + report.absentStudents, 0)}
                        </p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </button>
                  <button 
                    onClick={() => handleAttendanceCardClick('leaves')}
                    className="bg-orange-50 rounded-xl p-4 border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">On Leave</p>
                        <p className="text-2xl font-bold text-orange-700">
                          {approvedLeaves.length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                  </button>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Attendance %</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {attendanceReport.length > 0 ? 
                            ((attendanceReport.reduce((sum, report) => sum + report.presentStudents, 0) / 
                              attendanceReport.reduce((sum, report) => sum + report.totalStudents, 0)) * 100).toFixed(1)
                            : 0}%
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attendanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="present" fill="#10b981" name="Present" />
                      <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                      <Bar dataKey="onLeave" fill="#f97316" name="On Leave" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    {attendanceReport.map(report => {
                      const courseLeaves = approvedLeaves.filter(leave => 
                        leave.course?.code === report.courseCode
                      ).length;
                      
                      return (
                        <div key={report.courseId} className="p-4 border border-primary rounded-lg">
                          <h3 className="font-semibold text-primary">{report.courseName}</h3>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                            <span className="text-green-600">Present: {report.presentStudents}</span>
                            <span className="text-red-600">Absent: {report.absentStudents}</span>
                            <span className="text-orange-600">On Leave: {courseLeaves}</span>
                          </div>
                          <div className="mt-2 bg-secondary rounded-full h-2 flex">
                            <div 
                              className="bg-green-500 h-2 rounded-l-full"
                              style={{ width: `${(report.presentStudents / report.totalStudents) * 100}%` }}
                            />
                            <div 
                              className="bg-red-500 h-2"
                              style={{ width: `${(report.absentStudents / report.totalStudents) * 100}%` }}
                            />
                            <div 
                              className="bg-orange-500 h-2 rounded-r-full"
                              style={{ width: `${(courseLeaves / report.totalStudents) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
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

          {/* Course Enrollments */}
          <div className="card-gradient">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Course Enrollments</h2>
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

          {/* Attendance Filter */}
          <div className="card-gradient">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Filter Student Attendance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="input-field"
                  min={filters.startDate || undefined}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Course</label>
                <select
                  value={filters.courseId}
                  onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Student</label>
                <select
                  value={filters.studentId}
                  onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Students</option>
                  {users.filter(u => u.role === 'STUDENT').map(student => (
                    <option key={student.id} value={student.id}>{student.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Batch</label>
                <select
                  value={filters.batch}
                  onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Batches</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={loadFilteredAttendance}
                  disabled={!filters.startDate && !filters.endDate && !filters.courseId && !filters.studentId && !filters.batch && !filters.year}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Filtered Attendance Results */}
          {filteredAttendance.length > 0 && (
            <div className="card-gradient">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Filtered Attendance Results</h2>
                <div className="text-sm text-gray-600">
                  Total Records: {filteredAttendance.length}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y border-primary">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Year
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-primary">
                    {filteredAttendance.map((record) => (
                      <tr key={record.id} className="table-row">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium table-cell">
                            {record.student?.fullName || record.student?.username || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm table-cell">
                            {record.course?.name || 'Unknown Course'}
                          </div>
                          <div className="text-xs table-cell-secondary">
                            {record.course?.code || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">
                          {record.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.present ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">
                          {record.student?.batch || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">
                          {record.student?.yearOfStudy || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="card-gradient">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Attendance Calendar</h2>
          
          {/* Date selector for calendar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <label className="text-sm font-medium text-gray-700">Select Date:</label>
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
          
          <CalendarComponent 
            attendanceData={attendanceReport.reduce((acc, report) => {
              // Create a simple attendance summary for the selected date
              acc[selectedDate] = report.presentStudents > 0 ? 'present' : 'absent';
              return acc;
            }, {})}
            onDateSelect={(date) => {
              const dateStr = date.toISOString().split('T')[0];
              setSelectedDate(dateStr);
              loadAttendanceReport(dateStr);
            }}
          />
          
          {/* Show attendance summary for selected date */}
          {attendanceReport.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {attendanceReport.reduce((sum, report) => sum + report.totalStudents, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Present</p>
                    <p className="text-2xl font-bold text-green-700">
                      {attendanceReport.reduce((sum, report) => sum + report.presentStudents, 0)}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Absent</p>
                    <p className="text-2xl font-bold text-red-700">
                      {attendanceReport.reduce((sum, report) => sum + report.absentStudents, 0)}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Attendance %</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {attendanceReport.length > 0 ? 
                        ((attendanceReport.reduce((sum, report) => sum + report.presentStudents, 0) / 
                          attendanceReport.reduce((sum, report) => sum + report.totalStudents, 0)) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p>• Click on any date to view attendance summary for that day</p>
            <p>• Use the date selector above to quickly navigate to a specific date</p>
            <p>• Attendance data will be loaded automatically when you select a date</p>
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <>
          {/* Create Course Form */}
          <div className="card-gradient">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-2xl mr-4 bg-indigo-100">
                <Plus className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
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
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg whitespace-nowrap">
                Create Course
              </button>
            </form>
          </div>

          {/* Assign Teacher Form */}
          <div className="card-gradient">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-2xl mr-4 bg-indigo-100">
                <UserPlus className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Assign Teacher to Course</h2>
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
              
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
                Assign Teacher
              </button>
            </form>
          </div>

          {/* Current Assignments */}
          <div className="card-gradient">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Current Teacher Assignments</h2>
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

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Profile</h2>
                    <p className="text-sm text-gray-600">View your account details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
            
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Enrollment Number</label>
                    <p className="text-lg font-medium text-gray-900">{profile.username}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Full Name</label>
                    <p className="text-lg font-medium text-gray-900">{profile.fullName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                    <p className="text-lg font-medium text-gray-900">{profile.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Role</label>
                    <p className="text-lg font-medium text-blue-600">{profile.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Details Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {attendanceModalType === 'total' && 'All Students'}
                  {attendanceModalType === 'present' && `Present Students - ${selectedDate}`}
                  {attendanceModalType === 'absent' && `Absent Students - ${selectedDate}`}
                  {attendanceModalType === 'leaves' && `Students On Leave - ${selectedDate}`}
                </h2>
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              {attendanceModalData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No students found for this category</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Showing {attendanceModalData.length} students
                  </div>
                  {attendanceModalData.map(record => (
                    <div key={record.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {attendanceModalType === 'total' ? (
                            // For total students, show student details directly
                            <>
                              <h3 className="font-semibold text-gray-900 text-lg">{record.fullName || 'Unknown Student'}</h3>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600"><span className="font-medium">Enrollment:</span> {record.username}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Course:</span> {record.course || 'N/A'}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Batch:</span> {record.batch || 'N/A'}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Year:</span> {record.yearOfStudy || 'N/A'}</p>
                              </div>
                            </>
                          ) : attendanceModalType === 'leaves' ? (
                            // For approved leaves
                            <>
                              <h3 className="font-semibold text-gray-900 text-lg">{record.student?.fullName || 'Unknown Student'}</h3>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600"><span className="font-medium">Enrollment:</span> {record.student?.username}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Course:</span> {record.course?.name} ({record.course?.code})</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Leave Period:</span> {record.startDate} to {record.endDate}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Reason:</span> {record.reason || 'No reason provided'}</p>
                              </div>
                            </>
                          ) : (
                            // For present/absent, show attendance record details
                            <>
                              <h3 className="font-semibold text-gray-900 text-lg">{record.student?.fullName || 'Unknown Student'}</h3>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600"><span className="font-medium">Enrollment:</span> {record.student?.username}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Course:</span> {record.course?.name} ({record.course?.code})</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Batch:</span> {record.student?.batch || 'N/A'}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Year:</span> {record.student?.yearOfStudy || 'N/A'}</p>
                              </div>
                            </>
                          )}
                        </div>
                        {attendanceModalType === 'present' && (
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Present
                          </span>
                        )}
                        {attendanceModalType === 'absent' && (
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Absent
                          </span>
                        )}
                        {attendanceModalType === 'leaves' && (
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            On Leave
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'users' && 'All Users'}
                  {modalType === 'teachers' && 'Teachers'}
                  {modalType === 'students' && 'Students'}
                  {modalType === 'courses' && 'Courses'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200"
                >
                  ×
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${modalType}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              {filteredModalData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? `No results found for "${searchTerm}"` : 'No data available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Showing {filteredModalData.length} of {modalData.length} results
                  </div>
                  {(modalType === 'users' || modalType === 'teachers' || modalType === 'students') && filteredModalData.map(user => (
                    <div key={user.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{user.fullName}</h3>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600"><span className="font-medium">Enrollment Number:</span> {user.username}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {user.email}</p>
                            {user.role === 'STUDENT' && (
                              <>
                                <p className="text-sm text-gray-600"><span className="font-medium">Course:</span> {user.course || 'Not Assigned'}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Batch:</span> {user.batch || 'Not Assigned'}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Year:</span> {user.yearOfStudy || 'Not Assigned'}</p>
                              </>
                            )}
                            {user.role === 'TEACHER' && (
                              <>
                                <p className="text-sm text-gray-600"><span className="font-medium">Assigned Courses:</span></p>
                                <div className="ml-4 mt-1">
                                  {courses.filter(course => course.teacher?.id === user.id).length > 0 ? (
                                    courses.filter(course => course.teacher?.id === user.id).map(course => (
                                      <p key={course.id} className="text-sm text-blue-600">• {course.name} ({course.code})</p>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-500">No courses assigned</p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-800' :
                          user.role === 'TEACHER' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {modalType === 'courses' && filteredModalData.map(course => (
                    <div key={course.id} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-600">Code: {course.code}</p>
                      <p className="text-sm text-gray-600">Teacher: {course.teacher ? course.teacher.fullName : 'Not Assigned'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;