import axios from 'axios';

const API_BASE_URL = 'student-attandance-system-backend-production.up.railway.app';

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
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData, {
    headers: { 'Content-Type': 'application/json' }
  }),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getTeachers: () => api.get('/admin/teachers'),
  getStudents: () => api.get('/admin/students'),
  createCourse: (course) => api.post('/admin/courses', course),
  getCourses: () => api.get('/admin/courses'),
  getTotalStudents: () => api.get('/admin/reports/total-students'),
  getCourseEnrollments: () => api.get('/admin/reports/course-enrollments'),
  getAttendanceByDate: (date) => api.get(`/admin/reports/attendance-by-date?date=${date}`),
  getAttendanceByDateAndStatus: (date, present) => api.get(`/admin/reports/attendance-by-date-status?date=${date}${present !== undefined ? `&present=${present}` : ''}`),
  getFilteredAttendance: (params) => api.get('/admin/reports/attendance/filter', { params }),
  assignTeacher: (assignment) => api.post('/admin/assign-teacher', assignment),
  getApprovedLeaves: (date) => api.get(`/admin/approved-leaves?date=${date}`),
};

export const teacherAPI = {
  getCourses: () => api.get('/teacher/courses'),
  markAttendance: (attendance) => api.post('/teacher/attendance', attendance),
  getCourseAttendance: (courseId) => api.get(`/teacher/attendance/course/${courseId}`),
  getStudents: () => api.get('/teacher/students'),
  getFilteredAttendance: (params) => api.get('/teacher/attendance/filter', { params }),
  getStudentHistory: (params) => api.get('/teacher/attendance/student-history', { params }),
  getProfile: () => api.get('/teacher/profile'),
  updateProfile: (profileData) => api.put('/teacher/profile', profileData),
  getTodaysAttendance: (date, present) => api.get(`/teacher/attendance/today?date=${date}&present=${present}`),
  getTodaysLeaves: (date) => api.get(`/teacher/leaves/today?date=${date}`),
  getPendingLeaveRequests: () => api.get('/teacher/leave-requests/pending'),
  getLeaveRequests: () => api.get('/teacher/leave-requests'),
  reviewLeaveRequest: (requestId, reviewData) => api.put(`/teacher/leave-requests/${requestId}/review`, reviewData),
};

export const studentAPI = {
  getAttendance: () => api.get('/student/attendance'),
  getCourseAttendance: (courseId) => api.get(`/student/attendance/course/${courseId}`),
  markSelfAttendance: (attendanceData) => api.post('/student/mark-attendance', attendanceData),
  getAttendanceStatus: () => api.get('/student/attendance-status'),
  getSelfAttendance: () => api.get('/student/self-attendance'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (profileData) => api.put('/student/profile', profileData),
  getCourses: () => api.get('/student/courses'),
  completeProfile: (profileData) => api.post('/student/complete-profile', profileData),
  submitLeaveRequest: (leaveData) => api.post('/student/leave-request', leaveData),
  getApprovedLeaves: (date) => api.get(`/student/approved-leaves?date=${date}`),
};

export default api;