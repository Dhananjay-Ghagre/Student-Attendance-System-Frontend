import axios from 'axios';

const API_BASE_URL = 'https://student-attandance-system-backend-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData, {
    headers: { 'Content-Type': 'application/json' }
  }),
};

export const adminAPI = {
  getUsers: () => api.get('/api/admin/users'),
  getTeachers: () => api.get('/api/admin/teachers'),
  getStudents: () => api.get('/api/admin/students'),
  createCourse: (course) => api.post('/api/admin/courses', course),
  getCourses: () => api.get('/api/admin/courses'),
  getTotalStudents: () => api.get('/api/admin/reports/total-students'),
  getCourseEnrollments: () => api.get('/api/admin/reports/course-enrollments'),
  getAttendanceByDate: (date) => api.get(`/api/admin/reports/attendance-by-date?date=${date}`),
  getAttendanceByDateAndStatus: (date, present) => api.get(`/api/admin/reports/attendance-by-date-status?date=${date}${present !== undefined ? `&present=${present}` : ''}`),
  getFilteredAttendance: (params) => api.get('/api/admin/reports/attendance/filter', { params }),
  assignTeacher: (assignment) => api.post('/api/admin/assign-teacher', assignment),
  getApprovedLeaves: (date) => api.get(`/api/admin/approved-leaves?date=${date}`),
};

export const teacherAPI = {
  getCourses: () => api.get('/api/teacher/courses'),
  markAttendance: (attendance) => api.post('/api/teacher/attendance', attendance),
  getCourseAttendance: (courseId) => api.get(`/api/teacher/attendance/course/${courseId}`),
  getStudents: () => api.get('/api/teacher/students'),
  getFilteredAttendance: (params) => api.get('/api/teacher/attendance/filter', { params }),
  getStudentHistory: (params) => api.get('/api/teacher/attendance/student-history', { params }),
  getProfile: () => api.get('/api/teacher/profile'),
  updateProfile: (profileData) => api.put('/api/teacher/profile', profileData),
  getTodaysAttendance: (date, present) => api.get(`/api/teacher/attendance/today?date=${date}&present=${present}`),
  getTodaysLeaves: (date) => api.get(`/api/teacher/leaves/today?date=${date}`),
  getPendingLeaveRequests: () => api.get('/api/teacher/leave-requests/pending'),
  getLeaveRequests: () => api.get('/api/teacher/leave-requests'),
  reviewLeaveRequest: (requestId, reviewData) => api.put(`/api/teacher/leave-requests/${requestId}/review`, reviewData),
};

export const studentAPI = {
  getAttendance: () => api.get('/api/student/attendance'),
  getCourseAttendance: (courseId) => api.get(`/api/student/attendance/course/${courseId}`),
  markSelfAttendance: (attendanceData) => api.post('/api/student/mark-attendance', attendanceData),
  getAttendanceStatus: () => api.get('/api/student/attendance-status'),
  getSelfAttendance: () => api.get('/api/student/self-attendance'),
  getProfile: () => api.get('/api/student/profile'),
  updateProfile: (profileData) => api.put('/api/student/profile', profileData),
  getCourses: () => api.get('/api/student/courses'),
  completeProfile: (profileData) => api.post('/api/student/complete-profile', profileData),
  submitLeaveRequest: (leaveData) => api.post('/api/student/leave-request', leaveData),
  getApprovedLeaves: (date) => api.get(`/api/student/approved-leaves?date=${date}`),
};

export default api;