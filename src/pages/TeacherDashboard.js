import React, { useState, useEffect } from 'react';
import { BookOpen, UserCheck, Calendar, CheckCircle, XCircle, Users, Filter, User, Edit, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { teacherAPI } from '../services/api';
import CurrentDateTime from '../components/CurrentDateTime';
import CalendarComponent from '../components/Calendar';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    present: true
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    courseId: '',
    studentId: ''
  });
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    email: '',
    role: ''
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState([]);
  const [todaysLeaves, setTodaysLeaves] = useState([]);
  const [todaysPresent, setTodaysPresent] = useState([]);
  const [todaysAbsent, setTodaysAbsent] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyAttendanceReport, setDailyAttendanceReport] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceModalData, setAttendanceModalData] = useState([]);
  const [attendanceModalType, setAttendanceModalType] = useState('');


  useEffect(() => {
    refreshAllData();
    loadDailyAttendanceReport(selectedDate);
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(refreshAllData, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
  
  // Load attendance when activeTab changes to calendar
  useEffect(() => {
    if (activeTab === 'calendar') {
      loadDailyAttendanceReport(selectedDate);
    }
  }, [activeTab]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refreshInterval]);

  const loadData = async () => {
    try {
      const [coursesRes, studentsRes] = await Promise.all([
        teacherAPI.getCourses(),
        teacherAPI.getStudents()
      ]);
      setCourses(coursesRes.data);
      setStudents(studentsRes.data);
      
      if (coursesRes.data.length === 0) {
        toast.error('No courses assigned to you. Please contact admin.');
      }
    } catch (error) {
      toast.error('Error loading data');
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.markAttendance(attendanceForm);
      toast.success('Attendance marked successfully!');
      setAttendanceForm({
        studentId: '',
        courseId: '',
        date: new Date().toISOString().split('T')[0],
        present: true
      });
      
      // Refresh all data immediately after marking attendance
      await refreshAllData();
      
      if (selectedCourse) {
        loadCourseAttendance(selectedCourse);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error marking attendance';
      toast.error(errorMessage);
    }
  };

  const loadCourseAttendance = async (courseId) => {
    try {
      const response = await teacherAPI.getCourseAttendance(courseId);
      setAttendanceData(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error loading attendance';
      toast.error(errorMessage);
      setAttendanceData([]);
    }
  };

  const isValidDateRange = () => {
    if (!filters.startDate || !filters.endDate) return true;
    return new Date(filters.startDate) < new Date(filters.endDate);
  };

  const loadFilteredAttendance = async () => {
    if (filters.startDate && filters.endDate && !isValidDateRange()) {
      toast.error('End date must be after start date');
      return;
    }
    
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.studentId) params.studentId = filters.studentId;
      
      const response = await teacherAPI.getFilteredAttendance(params);
      setAttendanceData(response.data);
      toast.success('Attendance data loaded successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error loading attendance data';
      toast.error(errorMessage);
      setAttendanceData([]);
    }
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', courseId: '', studentId: '' });
    setAttendanceData([]);
    setSelectedCourse('');
  };

  const loadProfile = async () => {
    try {
      const response = await teacherAPI.getProfile();
      setProfile(response.data);
      setShowProfile(true);
    } catch (error) {
      toast.error('Error loading profile');
    }
  };

  const loadTodaysLeaves = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await teacherAPI.getTodaysLeaves(today);
      setTodaysLeaves(response.data);
    } catch (error) {
      console.error('Error loading today\'s leaves:', error);
      setTodaysLeaves([]);
    }
  };

  const loadTodaysMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Loading today\'s metrics for date:', today);
      
      // Debug: Check all leave requests in database
      try {
        const debugRes = await teacherAPI.getLeaveRequests();
        console.log('DEBUG: All leave requests in database:', debugRes.data);
      } catch (debugError) {
        console.log('DEBUG: Error fetching all leave requests:', debugError);
      }
      
      const [presentRes, absentRes, leavesRes] = await Promise.all([
        teacherAPI.getTodaysAttendance(today, true),
        teacherAPI.getTodaysAttendance(today, false),
        teacherAPI.getPendingLeaveRequests()
      ]);
      
      console.log('Present today:', presentRes.data);
      console.log('Absent today:', absentRes.data);
      console.log('Pending leaves:', leavesRes.data);
      
      setTodaysPresent(presentRes.data || []);
      setTodaysAbsent(absentRes.data || []);
      setTodaysLeaves(leavesRes.data || []);
    } catch (error) {
      console.error('Error loading today\'s metrics:', error);
      console.error('Error details:', error.response?.data);
      setTodaysPresent([]);
      setTodaysAbsent([]);
      setTodaysLeaves([]);
    }
  };

  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadData(),
        loadTodaysMetrics()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleTeacherAttendanceCardClick = (type) => {
    let data = [];
    
    if (type === 'total') {
      data = dailyAttendanceReport;
    } else if (type === 'present') {
      data = dailyAttendanceReport.filter(record => record.present);
    } else if (type === 'absent') {
      data = dailyAttendanceReport.filter(record => !record.present);
    }
    
    setAttendanceModalData(data);
    setAttendanceModalType(type);
    setShowAttendanceModal(true);
  };
  
  const loadDailyAttendanceReport = async (date) => {
    try {
      console.log('Loading teacher attendance for date:', date);
      
      // Use the filter endpoint with date parameter to get all attendance for that date
      const response = await teacherAPI.getFilteredAttendance({
        date: date,
        startDate: date,
        endDate: date
      });
      
      console.log('Teacher attendance response:', response.data);
      
      // Handle empty response (no attendance marked)
      if (!response.data || response.data.length === 0) {
        setDailyAttendanceReport([]);
        toast(`${date}: No attendance marked for this date`);
        return;
      }
      
      setDailyAttendanceReport(response.data);
      
      // Show summary after data is loaded
      const totalPresent = response.data.filter(record => record.present).length;
      const totalAbsent = response.data.filter(record => !record.present).length;
      const totalStudents = response.data.length;
      
      if (totalStudents > 0) {
        toast.success(`${date}: ${totalPresent} Present, ${totalAbsent} Absent (${totalStudents} Total)`);
      } else {
        toast(`${date}: No students found for this date`);
      }
      
    } catch (error) {
      console.error('Error loading teacher attendance report:', error);
      setDailyAttendanceReport([]);
      toast(`${date}: No attendance data available`);
    }
  };

  const handleLeaveAction = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await teacherAPI.reviewLeaveRequest(requestId, { status, teacherComment: '' });
      toast.success(`Leave request ${status.toLowerCase()} successfully!`);
      await refreshAllData();
    } catch (error) {
      toast.error('Error updating leave request: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCardClick = async (type) => {
    setModalType(type);
    let data = [];
    
    try {
      switch (type) {
        case 'courses':
          data = courses;
          break;
        case 'students':
          data = students;
          break;
        case 'present':
          // Use cached data if available, otherwise fetch fresh
          if (todaysPresent.length > 0) {
            data = todaysPresent;
          } else {
            const today = new Date().toISOString().split('T')[0];
            const presentResponse = await teacherAPI.getTodaysAttendance(today, true);
            data = presentResponse.data;
            setTodaysPresent(data);
          }
          break;
        case 'absent':
          // Use cached data if available, otherwise fetch fresh
          if (todaysAbsent.length > 0) {
            data = todaysAbsent;
          } else {
            const todayAbsent = new Date().toISOString().split('T')[0];
            const absentResponse = await teacherAPI.getTodaysAttendance(todayAbsent, false);
            data = absentResponse.data;
            setTodaysAbsent(data);
          }
          break;
        case 'leaves':
          // Use cached data if available, otherwise fetch fresh
          if (todaysLeaves.length > 0) {
            data = todaysLeaves;
          } else {
            console.log('Fetching pending leave requests...');
            const leavesResponse = await teacherAPI.getPendingLeaveRequests();
            data = leavesResponse.data || [];
            setTodaysLeaves(data);
          }
          break;
      }
      setModalData(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error.response?.data?.error || 'Error loading data';
      toast.error(errorMessage);
    }
  };



  const attendanceStats = attendanceData.reduce((acc, record) => {
    acc.total++;
    if (record.present) acc.present++;
    else acc.absent++;
    return acc;
  }, { total: 0, present: 0, absent: 0 });

  const attendanceChartData = [
    { name: 'Present', value: attendanceStats.present, color: '#10b981' },
    { name: 'Absent', value: attendanceStats.absent, color: '#ef4444' }
  ];

  const dailyAttendance = attendanceData.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) acc[date] = { date, present: 0, absent: 0 };
    if (record.present) acc[date].present++;
    else acc[date].absent++;
    return acc;
  }, {});

  const dailyChartData = Object.values(dailyAttendance).slice(-7);

  return (
      <div className="min-h-screen bg-white relative">
        <div className="p-0 space-y-8 relative z-10 w-full">
        {/* Current Date and Time */}
        <div className="p-8 pb-0">
          <CurrentDateTime />
        </div>

        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Teacher Dashboard</h1>
            <p className="section-subtitle">Manage attendance and leave requests</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className="btn-secondary flex items-center gap-2 animate-scale-in disabled:opacity-50"
              title="Refresh all data"
            >
              <svg className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={loadProfile}
              className="btn-secondary flex items-center gap-2 animate-scale-in"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">View Profile</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-lg shadow-blue-100/30 border border-blue-100/50 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-semibold cursor-pointer text-sm sm:text-base ${
              activeTab === 'overview' 
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg shadow-indigo-200/50' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-blue-50/80'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-semibold cursor-pointer text-sm sm:text-base ${
              activeTab === 'attendance' 
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg shadow-indigo-200/50' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-blue-50/80'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-semibold cursor-pointer text-sm sm:text-base ${
              activeTab === 'calendar' 
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg shadow-indigo-200/50' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-blue-50/80'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Calendar View</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-semibold cursor-pointer text-sm sm:text-base ${
              activeTab === 'reports' 
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg shadow-indigo-200/50' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-blue-50/80'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>View Reports</span>
          </button>

        </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Course-Based Access</h3>
                <p className="text-sm text-blue-700 mt-1">
                  You can only view and manage attendance for courses assigned to you by the administrator.
                </p>
              </div>
            </div>
          </div>

      <div className="card-gradient">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">My Assigned Courses</h2>
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-blue-100">
              <BookOpen className="h-10 w-10 text-blue-500" />
            </div>
            <p className="text-lg font-medium mb-2 text-blue-600">No courses assigned to you yet.</p>
            <p className="text-sm text-blue-500">Please contact your administrator to get course assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course.id);
                  loadCourseAttendance(course.id);
                }}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-xl ${
                  selectedCourse === course.id 
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                    : 'border-blue-200 hover:border-indigo-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${
                      selectedCourse === course.id ? 'text-indigo-700' : 'text-indigo-800'
                    }`}>{course.name}</h3>
                    <p className={`text-sm font-medium ${
                      selectedCourse === course.id ? 'text-indigo-600' : 'text-blue-600'
                    }`}>{course.code}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    selectedCourse === course.id ? 'bg-indigo-100' : 'bg-blue-100'
                  }`}>
                    <BookOpen className={`h-6 w-6 ${
                      selectedCourse === course.id ? 'text-indigo-600' : 'text-blue-500'
                    }`} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <button 
          onClick={() => handleCardClick('courses')}
          className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">My Courses</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">{courses.length}</p>
            </div>
            <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-blue-100">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => handleCardClick('students')}
          className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Students</p>
              <p className="text-3xl font-bold mt-2 text-purple-600">{students.length}</p>
            </div>
            <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-purple-100">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => handleCardClick('present')}
          className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Present Today</p>
              <p className="text-3xl font-bold mt-2 text-emerald-600">{todaysPresent.length}</p>
            </div>
            <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => handleCardClick('absent')}
          className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Absent Today</p>
              <p className="text-3xl font-bold mt-2 text-red-600">{todaysAbsent.length}</p>
            </div>
            <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => handleCardClick('leaves')}
          className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pending Leaves</p>
              <p className="text-3xl font-bold mt-2 text-orange-600">{todaysLeaves.length}</p>
            </div>
            <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-orange-100">
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </button>
      </div>


        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center mb-4">
              <UserCheck className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Mark Attendance</h2>
            </div>
            <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={attendanceForm.courseId}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, courseId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                ))}
              </select>
              
              <select
                value={attendanceForm.studentId}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, studentId: e.target.value })}
                className="input-field"
                required
                disabled={!attendanceForm.courseId}
              >
                <option value="">{attendanceForm.courseId ? 'Select Student' : 'Select Course First'}</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.fullName}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={attendanceForm.date}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                className="input-field"
                required
              />
              
              <select
                value={attendanceForm.present}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, present: e.target.value === 'true' })}
                className="input-field"
              >
                <option value={true}>Present</option>
                <option value={false}>Absent</option>
              </select>
              
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={courses.length === 0 || students.length === 0}
              >
                Mark Attendance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
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
                    loadDailyAttendanceReport(e.target.value);
                  }}
                  className="input-field"
                />
              </div>
            </div>
            
            <CalendarComponent 
              attendanceData={dailyAttendanceReport.reduce((acc, record) => {
                // Create a simple attendance summary for the selected date
                acc[selectedDate] = record.present ? 'present' : 'absent';
                return acc;
              }, {})}
              onDateSelect={(date) => {
                const dateStr = date.toISOString().split('T')[0];
                setSelectedDate(dateStr);
                loadDailyAttendanceReport(dateStr);
              }}
            />
            
            {/* Show attendance summary for selected date */}
            {dailyAttendanceReport.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => handleTeacherAttendanceCardClick('total')}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Students</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {dailyAttendanceReport.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </button>
                <button 
                  onClick={() => handleTeacherAttendanceCardClick('present')}
                  className="bg-green-50 rounded-xl p-4 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Present</p>
                      <p className="text-2xl font-bold text-green-700">
                        {dailyAttendanceReport.filter(record => record.present).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </button>
                <button 
                  onClick={() => handleTeacherAttendanceCardClick('absent')}
                  className="bg-red-50 rounded-xl p-4 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Absent</p>
                      <p className="text-2xl font-bold text-red-700">
                        {dailyAttendanceReport.filter(record => !record.present).length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </button>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Attendance %</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {dailyAttendanceReport.length > 0 ? 
                          ((dailyAttendanceReport.filter(record => record.present).length / dailyAttendanceReport.length) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-600">
              <p>• Click on any date to view attendance summary for that day</p>
              <p>• Use the date selector above to quickly navigate to a specific date</p>
              <p>• Attendance data will be loaded automatically when you select a date</p>
              <p>• Only shows attendance for courses assigned to you</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">

          {/* Unified Attendance Filter */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Filter Attendance Records</h2>
            </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.fullName}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={loadFilteredAttendance}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!filters.courseId && !filters.studentId && !filters.startDate && !filters.endDate || (filters.startDate && filters.endDate && !isValidDateRange())}
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
            <div className="mt-2">
              <div className="text-xs text-blue-500">
                Use same Start and End date for single day. Date range filtering works with any combination of filters.
              </div>
              {filters.startDate && filters.endDate && !isValidDateRange() && (
                <div className="text-xs text-red-500 mt-1">
                  ⚠️ End date must be after start date
                </div>
              )}
            </div>
          </div>

      {(selectedCourse || attendanceData.length > 0) && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary">
              {selectedCourse ? 'Course Attendance' : 'Filtered Attendance Results'}
            </h2>
            <button
              onClick={() => selectedCourse ? loadCourseAttendance(selectedCourse) : loadFilteredAttendance()}
              className="btn-secondary"
            >
              Refresh Data
            </button>
          </div>
          
          {attendanceData.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted mx-auto mb-4" />
              <p className="text-muted">No attendance records found for this course.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-primary mb-4">Overall Attendance</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={attendanceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {attendanceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-primary mb-4">Daily Attendance (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="present" fill="#10b981" name="Present" />
                      <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-primary">Attendance Records</h3>
                  <div className="text-sm text-muted">
                    Total Records: {attendanceData.length} | 
                    Present: {attendanceStats.present} | 
                    Absent: {attendanceStats.absent}
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
                      </tr>
                    </thead>
                    <tbody className="divide-y border-primary">
                      {attendanceData.map((record) => (
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
                            <span className={`badge ${
                              record.present ? 'badge-success' : 'badge-danger'
                            }`}>
                              {record.present ? 'Present' : 'Absent'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}



        </div>
      )}
      
      {/* Teacher Attendance Details Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {attendanceModalType === 'total' && `All Students - ${selectedDate}`}
                  {attendanceModalType === 'present' && `Present Students - ${selectedDate}`}
                  {attendanceModalType === 'absent' && `Absent Students - ${selectedDate}`}
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
                          <h3 className="font-semibold text-gray-900 text-lg">{record.student?.fullName || 'Unknown Student'}</h3>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600"><span className="font-medium">Enrollment:</span> {record.student?.username}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Course:</span> {record.course?.name} ({record.course?.code})</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Batch:</span> {record.student?.batch || 'N/A'}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Year:</span> {record.student?.yearOfStudy || 'N/A'}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {record.date}</p>
                          </div>
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
                        {attendanceModalType === 'total' && (
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            record.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.present ? 'Present' : 'Absent'}
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
      </div>
      {/* Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'courses' && 'My Courses'}
                  {modalType === 'students' && 'All Students'}
                  {modalType === 'present' && 'Present Today'}
                  {modalType === 'absent' && 'Absent Today'}
                  {modalType === 'leaves' && 'Pending Leave Requests'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              {modalData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modalType === 'courses' && modalData.map(course => (
                    <div key={course.id} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-600">Code: {course.code}</p>
                      <p className="text-sm text-gray-600">Batch: {course.batch || 'N/A'}</p>
                    </div>
                  ))}
                  
                  {modalType === 'students' && modalData.map(student => (
                    <div key={student.id} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900">{student.fullName}</h3>
                      <p className="text-sm text-gray-600">Enrollment Number: {student.username}</p>
                      <p className="text-sm text-gray-600">Course: {student.course || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Batch: {student.batch || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Year: {student.yearOfStudy || 'N/A'}</p>
                    </div>
                  ))}
                  
                  {(modalType === 'present' || modalType === 'absent') && modalData.map(record => (
                    <div key={record.id} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900">{record.student?.fullName || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600">Enrollment Number: {record.student?.username || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Course: {record.course?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Batch: {record.student?.batch || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Year: {record.student?.yearOfStudy || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Date: {record.date}</p>
                    </div>
                  ))}
                  
                  {modalType === 'leaves' && modalData.map(leave => (
                    <div key={leave.id} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900">{leave.student?.fullName || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600">Enrollment Number: {leave.student?.username || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Course: {leave.course?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Batch: {leave.student?.batch || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Year: {leave.student?.yearOfStudy || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Dates: {leave.startDate} to {leave.endDate}</p>
                      <p className="text-sm text-gray-600">Reason: {leave.reason || 'No reason provided'}</p>
                      <p className="text-sm text-gray-600">Status: {leave.status}</p>
                      {leave.status === 'PENDING' && (
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => handleLeaveAction(leave.id, 'APPROVED')}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleLeaveAction(leave.id, 'REJECTED')}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
                    <h2 className="text-2xl font-bold text-gray-900">Teacher Profile</h2>
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
    </div>
  );
};

export default TeacherDashboard;