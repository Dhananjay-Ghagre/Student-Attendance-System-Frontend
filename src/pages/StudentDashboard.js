import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, TrendingUp, BookOpen, User, Clock, Edit, FileText, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { studentAPI, adminAPI } from '../services/api';
import LeaveRequestForm from '../components/LeaveRequestForm';
import ProfileCompletion from '../components/ProfileCompletion';
import GeolocationAttendance from '../components/GeolocationAttendance';
import CheckInOut from '../components/CheckInOut';
import CheckInOutAttendance from '../components/CheckInOutAttendance';
import CurrentDateTime from '../components/CurrentDateTime';
import CalendarComponent from '../components/Calendar';
import axios from 'axios';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, onLeave: 0, percentage: 0 });
  const [user, setUser] = useState({ username: '', role: '' });
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    email: '',
    role: ''
  });

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState([]);
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showGeolocationAttendance, setShowGeolocationAttendance] = useState(false);
  const [showCheckInOutAttendance, setShowCheckInOutAttendance] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    present: true
  });
  const [studentCourses, setStudentCourses] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'checkin', name: 'Check-In/Out', icon: Clock },
    { id: 'attendance', name: 'Attendance History', icon: Calendar },
    { id: 'calendar', name: 'Calendar View', icon: Calendar },
    { id: 'leaves', name: 'Leave Requests', icon: FileText },
    { id: 'performance', name: 'Performance', icon: BookOpen }
  ];

  // Holiday list (can be moved to a config file or fetched from API)
  const holidays = [
    '2024-01-26', // Republic Day
    '2024-08-15', // Independence Day
    '2024-10-02', // Gandhi Jayanti
    '2024-12-25', // Christmas
    '2024-11-01', // Diwali (example)
    '2024-03-08', // Holi (example)
    // Add more holidays as needed
  ];

  const isHoliday = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.includes(dateStr);
  };

  const getHolidayName = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const holidayNames = {
      '2024-01-26': 'Republic Day',
      '2024-08-15': 'Independence Day',
      '2024-10-02': 'Gandhi Jayanti',
      '2024-12-25': 'Christmas',
      '2024-11-01': 'Diwali',
      '2024-03-08': 'Holi',
    };
    return holidayNames[dateStr] || 'Holiday';
  };

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const response = await studentAPI.getProfile();
      const user = response.data;
      if (user.profileCompleted) {
        setProfileCompleted(true);
        loadDashboardData();
      } else {
        setProfileCompleted(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const loadDashboardData = async () => {
    await loadAttendance();
    await loadStudentCourses();
    const userData = {
      username: localStorage.getItem('username') || '',
      role: localStorage.getItem('role') || ''
    };
    setUser(userData);
    loadLeaveRequests();
    loadApprovedLeaves();
    
    // Load profile data for header display
    try {
      const response = await studentAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile for header:', error);
    }
  };

  const loadStudentCourses = async () => {
    try {
      console.log('Loading student courses...');
      const response = await studentAPI.getCourses();
      console.log('Student courses API response:', response.data);
      setStudentCourses(response.data || []);
      
      if (!response.data || response.data.length === 0) {
        console.log('No courses from API, trying fallback from attendance records');
        // Fallback: try to get course from attendance records
        if (attendance.length > 0) {
          const uniqueCourses = attendance.reduce((acc, record) => {
            if (record.course && !acc.find(course => course.id === record.course.id)) {
              acc.push(record.course);
            }
            return acc;
          }, []);
          console.log('Courses from attendance fallback:', uniqueCourses);
          setStudentCourses(uniqueCourses);
        }
      }
    } catch (error) {
      console.error('Error loading student courses:', error);
      console.error('Error details:', error.response?.data);
      setStudentCourses([]);
    }
  };

  const handleMarkAttendance = async (attendanceData) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if attendance already marked for today
      const existingAttendance = attendance.find(record => 
        record.date === today
      );
      
      if (existingAttendance) {
        toast.error('Attendance already marked for today!');
        return;
      }
      
      await studentAPI.markSelfAttendance(attendanceData);
      
      setShowAttendanceForm(false);
      setShowGeolocationAttendance(false);
      setAttendanceForm({ present: true });
      loadAttendance(); // Refresh attendance data
    } catch (error) {
      console.error('Mark attendance error:', error);
      const errorMessage = error.response?.data?.error || 'Error marking attendance';
      toast.error(errorMessage);
    }
  };

  const loadAttendance = async () => {
    try {
      const response = await studentAPI.getAttendance();
      const attendanceData = response.data;
      console.log('Attendance data loaded:', attendanceData);
      setAttendance(attendanceData);
      
      // Filter attendance records to only include dates up to today
      const today = new Date().toISOString().split('T')[0];
      const attendanceUpToToday = attendanceData.filter(record => record.date <= today);
      
      // Calculate stats considering leave status and only count classes up to today
      // Only approved leaves (onLeave=true) are counted as leave, rejected leaves are counted as absent
      const total = attendanceUpToToday.length;
      const present = attendanceUpToToday.filter(record => record.present && !record.onLeave).length;
      const onLeave = attendanceUpToToday.filter(record => record.onLeave === true).length;
      const absent = attendanceUpToToday.filter(record => !record.present && !record.onLeave).length;
      const percentage = total > 0 ? (((present + onLeave) / total) * 100).toFixed(1) : 0;
      
      console.log('Stats calculated (up to today):', { total, present, absent, onLeave, percentage });
      setStats({ total, present, absent, onLeave, percentage });
    } catch (error) {
      toast.error('Error loading attendance');
    }
  };

  const loadProfile = async () => {
    try {
      const response = await studentAPI.getProfile();
      setProfile(response.data);
      setShowProfile(true);
    } catch (error) {
      toast.error('Error loading profile');
    }
  };

  const loadLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://student-attandance-system-backend-production.up.railway.app/api/student/leave-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Error loading leave requests:', error);
    }
  };

  const loadApprovedLeaves = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await studentAPI.getApprovedLeaves(today);
      setApprovedLeaves(response.data);
    } catch (error) {
      console.error('Error loading approved leaves:', error);
      setApprovedLeaves([]);
    }
  };

  const handleMarkTodayClick = async () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    try {
      // Check current permission status
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Current location permission:', permission.state);
        
        if (permission.state === 'denied') {
          toast.error('Location access is blocked. Please click the location icon in your address bar and allow location access, then try again.');
          setLocationLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log('Permission API not supported, proceeding with location request');
    }

    // This will trigger the browser's native location permission popup
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success - location granted
        console.log('Location granted:', position);
        setLocationLoading(false);
        setShowCheckInOutAttendance(true);
      },
      (error) => {
        // Error - location denied or failed
        console.error('Location error:', error);
        setLocationLoading(false);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please click the location icon (🔒) in your address bar, allow location access, refresh the page, and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable. Please check your GPS settings.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out. Please try again.');
            break;
          default:
            toast.error('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleLeaveRequestSubmit = () => {
    loadLeaveRequests();
    loadApprovedLeaves();
    // Reload attendance data to reflect any changes
    setTimeout(() => {
      loadAttendance();
    }, 1000);
    toast.success('Leave request submitted successfully!');
  };

  const handleCardClick = (type) => {
    setModalType(type);
    let data = [];
    
    switch (type) {
      case 'total':
        data = attendance;
        break;
      case 'present':
        data = attendance.filter(record => record.present);
        break;
      case 'absent':
        data = attendance.filter(record => !record.present && !record.onLeave);
        break;
      case 'onLeave':
        data = approvedLeaves;
        break;
      case 'leaves':
        data = leaveRequests;
        break;
    }
    setModalData(data);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { color: 'badge-warning', text: 'Pending' },
      APPROVED: { color: 'badge-success', text: 'Approved' },
      REJECTED: { color: 'badge-danger', text: 'Rejected' }
    };
    const badge = badges[status];
    return <span className={`badge ${badge.color}`}>{badge.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupedAttendance = attendance.reduce((acc, record) => {
    const courseName = record.course.name;
    if (!acc[courseName]) {
      acc[courseName] = [];
    }
    acc[courseName].push(record);
    return acc;
  }, {});

  const courseStats = Object.entries(groupedAttendance).map(([courseName, records]) => {
    // Filter records to only include dates up to today for course stats
    const today = new Date().toISOString().split('T')[0];
    const recordsUpToToday = records.filter(record => record.date <= today);
    
    const total = recordsUpToToday.length;
    const present = recordsUpToToday.filter(r => r.present && !r.onLeave).length;
    const onLeave = recordsUpToToday.filter(r => r.onLeave === true).length;
    const percentage = total > 0 ? (((present + onLeave) / total) * 100).toFixed(1) : 0;
    return { course: courseName, percentage: parseFloat(percentage), present, onLeave, total };
  });

  const attendanceChartData = [
    { name: 'Present', value: stats.present, color: '#10b981' },
    { name: 'On Leave', value: stats.onLeave, color: '#f59e0b' },
    { name: 'Absent', value: stats.absent, color: '#ef4444' }
  ];

  const monthlyTrend = attendance.reduce((acc, record) => {
    const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!acc[month]) acc[month] = { month, present: 0, total: 0 };
    acc[month].total++;
    if (record.present) acc[month].present++;
    return acc;
  }, {});

  const trendData = Object.values(monthlyTrend).map(item => ({
    ...item,
    percentage: ((item.present / item.total) * 100).toFixed(1)
  }));

  if (!profileCompleted) {
    return <ProfileCompletion onComplete={() => {
      setProfileCompleted(true);
      loadDashboardData();
    }} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content animate-fade-in">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Student Dashboard</h1>
            <p className="section-subtitle">
              Welcome back, {profile.fullName || user.username}!
              {profile.batch && profile.yearOfStudy && (
                <span className="block text-sm text-gray-500 mt-1">
                  {profile.course} • {profile.yearOfStudy} • Batch {profile.batch}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={loadProfile}
            className="btn-secondary flex items-center gap-2 animate-scale-in"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">View Profile</span>
          </button>
        </div>

        {/* Current Date and Time */}
        <CurrentDateTime />

        {/* Navigation Tabs */}
        <div className="bg-gradient-to-r from-white via-blue-50/30 to-white rounded-3xl shadow-lg border border-blue-100/50 mb-8 p-2">
          <div className="flex overflow-x-auto gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all duration-300 rounded-2xl relative overflow-hidden group ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:scale-102'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse" />
                  )}
                  <Icon className={`h-5 w-5 transition-all duration-300 ${
                    isActive ? 'text-white drop-shadow-sm' : 'group-hover:scale-110'
                  }`} />
                  <span className="relative z-10">{tab.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
              <button 
                onClick={() => handleCardClick('total')}
                className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Classes</p>
                    <p className="text-3xl font-bold mt-2 text-blue-600">{stats.total}</p>
                  </div>
                  <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-blue-100">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </button>
              
              {new Date().getDay() === 0 ? (
                <div className="stat-card bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mark Today</p>
                      <p className="text-lg font-bold mt-2 text-gray-500">Sunday - No Classes</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-100">
                      <Clock className="h-8 w-8 text-gray-500" />
                    </div>
                  </div>
                </div>
              ) : isHoliday(new Date()) ? (
                <div className="stat-card bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Mark Today</p>
                      <p className="text-lg font-bold mt-2 text-orange-600">{getHolidayName(new Date())}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-100">
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleMarkTodayClick}
                  disabled={locationLoading}
                  className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Mark Today</p>
                      <p className="text-lg font-bold mt-2 text-green-600">
                        {locationLoading ? 'Getting Location...' : 'Check-In/Out'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-green-100">
                      {locationLoading ? (
                        <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full" />
                      ) : (
                        <Clock className="h-8 w-8 text-green-600" />
                      )}
                    </div>
                  </div>
                </button>
              )}
              
              <button 
                onClick={() => setShowLeaveModal(true)}
                className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Leave</p>
                    <p className="text-3xl font-bold mt-2 text-purple-600">{leaveRequests.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-purple-100">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => handleCardClick('present')}
                className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600">Present</p>
                    <p className="text-3xl font-bold mt-2 text-emerald-600">{stats.present}</p>
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
                    <p className="text-sm font-medium text-red-600">Absent</p>
                    <p className="text-3xl font-bold mt-2 text-red-600">{stats.absent}</p>
                  </div>
                  <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-red-100">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </button>
              
              <div className="stat-card group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600">Attendance %</p>
                    <p className={`text-3xl font-bold mt-2 ${
                      stats.percentage >= 75 
                        ? 'text-emerald-600'
                        : stats.percentage >= 50 
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}>
                      {stats.percentage}%
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-amber-100">
                    <TrendingUp className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid-responsive-2">
              <div className="chart-container">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Attendance Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-container">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Monthly Attendance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                    <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Check-In/Out Tab */}
        {activeTab === 'checkin' && (
          <div className="space-y-8">
            <CheckInOut />
          </div>
        )}

        {/* Attendance History Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-8">
            <div className="card-gradient">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Attendance History</h2>
                <button
                  onClick={loadAttendance}
                  className="btn-secondary flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              {Object.keys(groupedAttendance).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-blue-100">
                    <Calendar className="h-10 w-10 text-blue-500" />
                  </div>
                  <p className="text-lg text-blue-600">No course attendance records found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedAttendance).map(([courseName, records]) => (
                    <div key={courseName}>
                      <h3 className="text-xl font-bold mb-4 text-gray-900">{courseName}</h3>
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="min-w-full divide-y border-primary">
                          <thead className="table-header">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y border-primary">
                            {records.map(record => (
                              <tr key={record.id} className="table-row">
                                <td className="px-6 py-4 whitespace-nowrap text-sm table-cell">
                                  {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">
                                  {record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`badge ${
                                    record.onLeave ? 'badge-warning' : record.present ? 'badge-success' : 'badge-danger'
                                  }`}>
                                    {record.onLeave ? (
                                      <><Calendar className="w-3 h-3 mr-1" /> On Leave</>
                                    ) : record.present ? (
                                      <><CheckCircle className="w-3 h-3 mr-1" /> Present</>
                                    ) : (
                                      <><XCircle className="w-3 h-3 mr-1" /> Absent</>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leave Requests Tab */}
        {activeTab === 'leaves' && (
          <div className="space-y-8">
            <div className="card-gradient">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
                    <p className="text-gray-600">Manage your leave applications</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLeaveForm(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">New Request</span>
                </button>
              </div>

              {leaveRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No leave requests found</p>
                  <p className="text-gray-400 text-sm">Click "New Request" to submit your first leave application</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full divide-y border-primary">
                    <thead className="table-header">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-primary">
                      {leaveRequests.map((request) => (
                        <tr key={request.id} className="table-row">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium table-cell">{request.course?.name}</div>
                            <div className="text-xs table-cell-secondary">{request.course?.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm table-cell">
                              {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            </div>
                            <div className="text-xs table-cell-secondary">
                              {Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm table-cell max-w-xs truncate" title={request.reason}>
                              {request.reason}
                            </div>
                            {request.teacherComment && (
                              <div className="text-xs table-cell-secondary mt-1" title={request.teacherComment}>
                                Teacher: {request.teacherComment}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm table-cell-secondary">
                            {formatDate(request.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-8">
            <div className="card-gradient">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Attendance Calendar</h2>
              <CalendarComponent 
                attendanceData={attendance.reduce((acc, record) => {
                  acc[record.date] = record.onLeave ? 'partial' : record.present ? 'present' : 'absent';
                  return acc;
                }, {})}
                onDateSelect={(date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const record = attendance.find(r => r.date === dateStr);
                  if (record) {
                    toast.info(`${dateStr}: ${record.onLeave ? 'On Leave' : record.present ? 'Present' : 'Absent'}`);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-8">
            <div className="card-gradient">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Course Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {courseStats.map((course, index) => (
                  <div key={index} className="p-6 border-2 rounded-2xl transition-all duration-300 hover:scale-105 border-blue-200 bg-blue-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-indigo-700">{course.course}</h3>
                      <div className="p-2 rounded-xl bg-blue-100">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-blue-600">
                        {course.present}/{course.total} classes
                      </span>
                      <span className={`text-lg font-bold ${
                        course.percentage >= 75 ? 'text-green-600' : 
                        course.percentage >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {course.percentage}%
                      </span>
                    </div>
                    <div className="mt-3 rounded-full h-3 bg-blue-100">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          course.percentage >= 75 ? 'bg-green-500' : 
                          course.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalType === 'total' && 'All Classes'}
                    {modalType === 'present' && 'Present Days'}
                    {modalType === 'absent' && 'Absent Days'}
                    {modalType === 'onLeave' && 'Approved Leaves'}
                    {modalType === 'leaves' && 'Leave History'}
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
                    {(modalType === 'total' || modalType === 'present' || modalType === 'absent') && modalData.map(record => (
                      <div key={record.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{record.course?.name}</h3>
                            <p className="text-sm text-gray-600">Code: {record.course?.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Date: {new Date(record.date).toLocaleDateString()}</p>
                            <span className={`badge ${
                              record.onLeave ? 'badge-warning' : record.present ? 'badge-success' : 'badge-danger'
                            }`}>
                              {record.onLeave ? 'On Leave' : record.present ? 'Present' : 'Absent'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {modalType === 'onLeave' && modalData.map(leave => (
                      <div key={leave.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{leave.course?.name}</h3>
                            <p className="text-sm text-gray-600">Code: {leave.course?.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Period: {formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                            <span className="badge badge-warning">On Leave</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Reason: {leave.reason}</p>
                        </div>
                      </div>
                    ))}
                    
                    {modalType === 'leaves' && modalData.map(leave => (
                      <div key={leave.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{leave.course?.name}</h3>
                          {getStatusBadge(leave.status)}
                        </div>
                        <p className="text-sm text-gray-600">Duration: {formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                        <p className="text-sm text-gray-600">Reason: {leave.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leave Modal */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">My Leave History</h2>
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[60vh]">
                {leaveRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No leave requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaveRequests.map(leave => (
                      <div key={leave.id} className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-semibold text-gray-900 text-lg">{leave.course?.name}</h3>
                          {getStatusBadge(leave.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600"><span className="font-medium">Course Code:</span> {leave.course?.code}</p>
                            <p className="text-gray-600"><span className="font-medium">Duration:</span> {formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                            <p className="text-gray-600"><span className="font-medium">Days:</span> {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1}</p>
                          </div>
                          <div>
                            <p className="text-gray-600"><span className="font-medium">Submitted:</span> {formatDate(leave.createdAt)}</p>
                            {leave.reviewedAt && (
                              <p className="text-gray-600"><span className="font-medium">Reviewed:</span> {formatDate(leave.reviewedAt)}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-gray-600"><span className="font-medium">Reason:</span></p>
                          <p className="text-gray-800 mt-1">{leave.reason}</p>
                        </div>
                        {leave.teacherComment && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-gray-600 text-sm"><span className="font-medium">Teacher Comment:</span></p>
                            <p className="text-gray-800 text-sm mt-1">{leave.teacherComment}</p>
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

        {/* Modals */}
        {showProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 sticky top-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Student Profile</h2>
                      <p className="text-xs text-gray-600">View your account details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Enrollment Number</label>
                      <p className="text-sm font-medium text-gray-900 break-words">{profile.username}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Role</label>
                      <p className="text-sm font-medium text-blue-600">{profile.role}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                      <p className="text-sm font-medium text-gray-900 break-words">{profile.fullName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                      <p className="text-sm font-medium text-gray-900 break-words">{profile.email}</p>
                    </div>
                    {profile.batch && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Batch</label>
                        <p className="text-sm font-medium text-gray-900">{profile.batch}</p>
                      </div>
                    )}
                    {profile.yearOfStudy && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Year of Study</label>
                        <p className="text-sm font-medium text-gray-900">{profile.yearOfStudy}</p>
                      </div>
                    )}
                    {profile.course && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Course</label>
                        <p className="text-sm font-medium text-gray-900 break-words">{profile.course}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Check-In/Out Attendance Modal */}
        {showCheckInOutAttendance && (
          <CheckInOutAttendance
            onAttendanceMarked={() => {
              loadAttendance();
              setShowCheckInOutAttendance(false);
            }}
            onClose={() => setShowCheckInOutAttendance(false)}
          />
        )}

        {/* Geolocation Attendance Modal */}
        {showGeolocationAttendance && (
          <GeolocationAttendance
            onAttendanceMarked={handleMarkAttendance}
            onClose={() => setShowGeolocationAttendance(false)}
            studentCourses={studentCourses}
            profile={profile}
          />
        )}

        {/* Leave Request Form Modal */}
        <LeaveRequestForm
          isOpen={showLeaveForm}
          onClose={() => setShowLeaveForm(false)}
          onSubmit={handleLeaveRequestSubmit}
          studentCourse={profile.course}
          courseId={attendance.length > 0 ? attendance[0].course.id : null}
        />
      </div>
    </div>
  );
};

export default StudentDashboard;