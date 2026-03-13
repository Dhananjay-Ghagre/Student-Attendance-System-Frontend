# API Endpoints Reference Guide

## Base URL
```
https://student-attandance-system-backend-production.up.railway.app
```

## Authentication Endpoints

### Login
```
POST /api/auth/login
Body: { username, password }
Response: { token, username, role }
```

### Register
```
POST /api/auth/register
Body: { username, password, email, fullName, role }
Response: Success message
```

### Verify Registration (OTP)
```
POST /api/auth/verify-registration
Body: { email, otp, ...registrationData }
Response: Success message
```

### Resend OTP
```
POST /api/auth/resend-otp
Body: { email, type }
Response: Success message
```

### Forgot Password
```
POST /api/auth/forgot-password
Body: { email }
Response: Success message (OTP sent)
```

### Reset Password
```
POST /api/auth/reset-password
Body: { email, otp, newPassword }
Response: Success message
```

---

## Admin Endpoints

### User Management
```
GET  /api/admin/users
GET  /api/admin/teachers
GET  /api/admin/students
```

### Course Management
```
GET  /api/admin/courses
POST /api/admin/courses
Body: { name, code }
```

### Teacher Assignment
```
POST /api/admin/assign-teacher
Body: { courseId, teacherId }
```

### Reports
```
GET  /api/admin/reports/total-students
GET  /api/admin/reports/course-enrollments
GET  /api/admin/reports/attendance-by-date?date={date}
GET  /api/admin/reports/attendance-by-date-status?date={date}&present={true|false}
GET  /api/admin/reports/attendance/filter?startDate={date}&endDate={date}&courseId={id}&studentId={id}&batch={batch}&year={year}
```

### Leave Management
```
GET  /api/admin/approved-leaves?date={date}
```

---

## Teacher Endpoints

### Course Management
```
GET  /api/teacher/courses
```

### Attendance Management
```
POST /api/teacher/attendance
Body: { studentId, courseId, date, present }

GET  /api/teacher/attendance/course/{courseId}
GET  /api/teacher/attendance/filter?startDate={date}&endDate={date}&courseId={id}&studentId={id}
GET  /api/teacher/attendance/today?date={date}&present={true|false}
GET  /api/teacher/attendance/student-history?studentId={id}&courseId={id}
```

### Student Management
```
GET  /api/teacher/students
```

### Profile
```
GET  /api/teacher/profile
PUT  /api/teacher/profile
Body: { fullName, email, ... }
```

### Leave Request Management
```
GET  /api/teacher/leave-requests
GET  /api/teacher/leave-requests/pending
PUT  /api/teacher/leave-requests/{id}/review
Body: { status, teacherComment }

GET  /api/teacher/leaves/today?date={date}
```

---

## Student Endpoints

### Attendance
```
GET  /api/student/attendance
GET  /api/student/attendance/course/{courseId}
GET  /api/student/attendance-status
GET  /api/student/self-attendance

POST /api/student/mark-attendance
Body: { courseId, present, date, location }
```

### Check-In/Check-Out
```
GET  /api/student/today-status
POST /api/student/checkin
Body: { latitude, longitude }

POST /api/student/checkout
Body: { latitude, longitude }
```

### Profile
```
GET  /api/student/profile
PUT  /api/student/profile
Body: { fullName, email, ... }

POST /api/student/complete-profile
Body: { batch, yearOfStudy, course }
```

### Course Management
```
GET  /api/student/courses
```

### Leave Request Management
```
GET  /api/student/leave-requests
POST /api/student/leave-request
Body: { courseId, startDate, endDate, reason }

GET  /api/student/approved-leaves?date={date}
```

---

## Public Endpoints

### Courses
```
GET  /api/public/courses
```

---

## Request Headers

All authenticated requests must include:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400
}
```

## Authentication Flow

1. **Register** → `/api/auth/register`
2. **Verify OTP** → `/api/auth/verify-registration`
3. **Login** → `/api/auth/login` (returns JWT token)
4. **Store token** in localStorage
5. **Use token** in Authorization header for all subsequent requests

## Password Reset Flow

1. **Request OTP** → `/api/auth/forgot-password`
2. **Verify OTP & Reset** → `/api/auth/reset-password`

## Common Query Parameters

- `date` - Date in format YYYY-MM-DD
- `startDate` - Start date for range queries
- `endDate` - End date for range queries
- `courseId` - Course identifier
- `studentId` - Student identifier
- `teacherId` - Teacher identifier
- `present` - Boolean (true/false)
- `batch` - Student batch (e.g., "2024-2025")
- `year` - Year of study (e.g., "1st Year")

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

**Note:** All endpoints require the `/api` prefix to match the Spring Boot backend controller mappings.
