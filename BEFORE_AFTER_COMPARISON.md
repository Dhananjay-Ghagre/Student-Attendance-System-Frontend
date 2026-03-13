# API Endpoint Update - Before & After Comparison

## Overview
This document shows the exact changes made to update all API endpoints to include the `/api` prefix.

---

## Authentication Endpoints

### Login
**Before:**
```javascript
login: (credentials) => api.post('/auth/login', credentials)
```
**After:**
```javascript
login: (credentials) => api.post('/api/auth/login', credentials)
```
**Full URL:** `https://student-attandance-system-backend-production.up.railway.app/api/auth/login`

---

### Register
**Before:**
```javascript
register: (userData) => api.post('/auth/register', userData, {
  headers: { 'Content-Type': 'application/json' }
})
```
**After:**
```javascript
register: (userData) => api.post('/api/auth/register', userData, {
  headers: { 'Content-Type': 'application/json' }
})
```
**Full URL:** `https://student-attandance-system-backend-production.up.railway.app/api/auth/register`

---

## Admin Endpoints

### Get Users
**Before:** `api.get('/admin/users')`
**After:** `api.get('/api/admin/users')`

### Get Teachers
**Before:** `api.get('/admin/teachers')`
**After:** `api.get('/api/admin/teachers')`

### Get Students
**Before:** `api.get('/admin/students')`
**After:** `api.get('/api/admin/students')`

### Create Course
**Before:** `api.post('/admin/courses', course)`
**After:** `api.post('/api/admin/courses', course)`

### Get Courses
**Before:** `api.get('/admin/courses')`
**After:** `api.get('/api/admin/courses')`

### Get Total Students
**Before:** `api.get('/admin/reports/total-students')`
**After:** `api.get('/api/admin/reports/total-students')`

### Get Course Enrollments
**Before:** `api.get('/admin/reports/course-enrollments')`
**After:** `api.get('/api/admin/reports/course-enrollments')`

### Get Attendance By Date
**Before:** `api.get(\`/admin/reports/attendance-by-date?date=\${date}\`)`
**After:** `api.get(\`/api/admin/reports/attendance-by-date?date=\${date}\`)`

### Get Attendance By Date And Status
**Before:** `api.get(\`/admin/reports/attendance-by-date-status?date=\${date}...\`)`
**After:** `api.get(\`/api/admin/reports/attendance-by-date-status?date=\${date}...\`)`

### Get Filtered Attendance
**Before:** `api.get('/admin/reports/attendance/filter', { params })`
**After:** `api.get('/api/admin/reports/attendance/filter', { params })`

### Assign Teacher
**Before:** `api.post('/admin/assign-teacher', assignment)`
**After:** `api.post('/api/admin/assign-teacher', assignment)`

### Get Approved Leaves
**Before:** `api.get(\`/admin/approved-leaves?date=\${date}\`)`
**After:** `api.get(\`/api/admin/approved-leaves?date=\${date}\`)`

---

## Teacher Endpoints

### Get Courses
**Before:** `api.get('/teacher/courses')`
**After:** `api.get('/api/teacher/courses')`

### Mark Attendance
**Before:** `api.post('/teacher/attendance', attendance)`
**After:** `api.post('/api/teacher/attendance', attendance)`

### Get Course Attendance
**Before:** `api.get(\`/teacher/attendance/course/\${courseId}\`)`
**After:** `api.get(\`/api/teacher/attendance/course/\${courseId}\`)`

### Get Students
**Before:** `api.get('/teacher/students')`
**After:** `api.get('/api/teacher/students')`

### Get Filtered Attendance
**Before:** `api.get('/teacher/attendance/filter', { params })`
**After:** `api.get('/api/teacher/attendance/filter', { params })`

### Get Student History
**Before:** `api.get('/teacher/attendance/student-history', { params })`
**After:** `api.get('/api/teacher/attendance/student-history', { params })`

### Get Profile
**Before:** `api.get('/teacher/profile')`
**After:** `api.get('/api/teacher/profile')`

### Update Profile
**Before:** `api.put('/teacher/profile', profileData)`
**After:** `api.put('/api/teacher/profile', profileData)`

### Get Today's Attendance
**Before:** `api.get(\`/teacher/attendance/today?date=\${date}&present=\${present}\`)`
**After:** `api.get(\`/api/teacher/attendance/today?date=\${date}&present=\${present}\`)`

### Get Today's Leaves
**Before:** `api.get(\`/teacher/leaves/today?date=\${date}\`)`
**After:** `api.get(\`/api/teacher/leaves/today?date=\${date}\`)`

### Get Pending Leave Requests
**Before:** `api.get('/teacher/leave-requests/pending')`
**After:** `api.get('/api/teacher/leave-requests/pending')`

### Get Leave Requests
**Before:** `api.get('/teacher/leave-requests')`
**After:** `api.get('/api/teacher/leave-requests')`

### Review Leave Request
**Before:** `api.put(\`/teacher/leave-requests/\${requestId}/review\`, reviewData)`
**After:** `api.put(\`/api/teacher/leave-requests/\${requestId}/review\`, reviewData)`

---

## Student Endpoints

### Get Attendance
**Before:** `api.get('/student/attendance')`
**After:** `api.get('/api/student/attendance')`

### Get Course Attendance
**Before:** `api.get(\`/student/attendance/course/\${courseId}\`)`
**After:** `api.get(\`/api/student/attendance/course/\${courseId}\`)`

### Mark Self Attendance
**Before:** `api.post('/student/mark-attendance', attendanceData)`
**After:** `api.post('/api/student/mark-attendance', attendanceData)`

### Get Attendance Status
**Before:** `api.get('/student/attendance-status')`
**After:** `api.get('/api/student/attendance-status')`

### Get Self Attendance
**Before:** `api.get('/student/self-attendance')`
**After:** `api.get('/api/student/self-attendance')`

### Get Profile
**Before:** `api.get('/student/profile')`
**After:** `api.get('/api/student/profile')`

### Update Profile
**Before:** `api.put('/student/profile', profileData)`
**After:** `api.put('/api/student/profile', profileData)`

### Get Courses
**Before:** `api.get('/student/courses')`
**After:** `api.get('/api/student/courses')`

### Complete Profile
**Before:** `api.post('/student/complete-profile', profileData)`
**After:** `api.post('/api/student/complete-profile', profileData)`

### Submit Leave Request
**Before:** `api.post('/student/leave-request', leaveData)`
**After:** `api.post('/api/student/leave-request', leaveData)`

### Get Approved Leaves
**Before:** `api.get(\`/student/approved-leaves?date=\${date}\`)`
**After:** `api.get(\`/api/student/approved-leaves?date=\${date}\`)`

---

## Pattern Summary

### Old Pattern (Incorrect)
```
{BASE_URL}/{role}/{endpoint}
```
Example: `https://...railway.app/auth/login` ❌

### New Pattern (Correct)
```
{BASE_URL}/api/{role}/{endpoint}
```
Example: `https://...railway.app/api/auth/login` ✅

---

## Key Changes

1. **Added `/api` prefix** to all endpoints
2. **Matches Spring Boot** `@RequestMapping("/api/...")` annotations
3. **Consistent structure** across all API calls
4. **Total endpoints updated:** 39

---

## Verification Command

To verify all endpoints have the `/api` prefix:
```bash
findstr /n "api\." src\services\api.js | findstr "'/api/"
```

Expected: All 39 endpoints should show `/api/` prefix

---

**Status:** ✅ All endpoints successfully updated
**File Modified:** `src/services/api.js`
**Backend URL:** `https://student-attandance-system-backend-production.up.railway.app`
