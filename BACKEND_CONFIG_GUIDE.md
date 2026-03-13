# Backend Configuration Guide

## Quick Backend URL Change

To change the backend URL in the future, you only need to update ONE file:

### File: `src/services/api.js`

```javascript
const API_BASE_URL = 'https://student-attandance-system-backend-production.up.railway.app';
```

Change this URL to your new backend URL and all API calls will automatically use the new URL.

## Current Configuration

**Production Backend:**
```
https://student-attandance-system-backend-production.up.railway.app
```

## Environment-Specific Configuration (Optional)

If you want to support multiple environments (development, staging, production), you can modify `api.js` like this:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://student-attandance-system-backend-production.up.railway.app';
```

Then create a `.env` file in the frontend root:

```env
REACT_APP_API_URL=https://your-backend-url.com
```

For different environments:
- `.env.development` - for local development
- `.env.production` - for production build
- `.env.staging` - for staging environment

## Testing the Configuration

After changing the backend URL:

1. **Clear browser cache and local storage**
2. **Restart the development server:**
   ```bash
   npm start
   ```
3. **Test these critical flows:**
   - Login/Register
   - Dashboard loading
   - Attendance marking
   - Leave requests

## Troubleshooting

### CORS Issues
If you see CORS errors after changing the backend URL, ensure your backend allows requests from your frontend domain.

### 404 Errors
Verify that:
- The backend URL is correct
- The backend is running and accessible
- API endpoints match the backend routes (e.g., `/api/auth/login`)

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Re-login to get a fresh JWT token
- Verify the token is being sent in request headers

## API Endpoint Structure

All endpoints follow this pattern:
```
{API_BASE_URL}/api/{role}/{endpoint}
```

**Roles:**
- `auth` - Authentication endpoints (login, register, forgot-password, etc.)
- `student` - Student-specific endpoints
- `teacher` - Teacher-specific endpoints
- `admin` - Admin-specific endpoints
- `public` - Public endpoints (no auth required)

**Examples:**
```
POST {API_BASE_URL}/api/auth/login
POST {API_BASE_URL}/api/auth/register
GET  {API_BASE_URL}/api/student/attendance
POST {API_BASE_URL}/api/teacher/attendance
GET  {API_BASE_URL}/api/admin/users
GET  {API_BASE_URL}/api/public/courses
```

**Important:** All endpoints MUST include the `/api` prefix to match the Spring Boot backend controller mappings:
- `@RequestMapping("/api/auth")`
- `@RequestMapping("/api/admin")`
- `@RequestMapping("/api/teacher")`
- `@RequestMapping("/api/student")`

## Security Notes

- Always use HTTPS in production
- Never commit `.env` files with sensitive data
- Keep API tokens secure in localStorage
- Implement proper CORS configuration on backend
