# Deployment Checklist - Backend URL Update

## ✅ Completed Changes

### 1. Central API Configuration
- [x] Updated `src/services/api.js` with Railway backend URL
- [x] All API service methods now use centralized configuration

### 2. Direct Axios Calls Updated
- [x] `src/components/ForgotPassword.js` - 2 endpoints updated
- [x] `src/components/LeaveManagement.js` - 2 endpoints updated
- [x] `src/components/OtpVerification.js` - 2 endpoints updated
- [x] `src/components/ProfileCompletion.js` - 2 endpoints updated
- [x] `src/pages/StudentDashboard.js` - 1 endpoint updated

### 3. Verification
- [x] No localhost:8080 references remain in source code
- [x] All URLs use HTTPS protocol
- [x] Railway backend URL correctly formatted

## 📋 Pre-Deployment Testing

### Authentication Flow
- [ ] Test user registration with OTP verification
- [ ] Test user login
- [ ] Test password reset flow
- [ ] Test OTP resend functionality

### Student Dashboard
- [ ] Test attendance history loading
- [ ] Test leave request submission
- [ ] Test leave request viewing
- [ ] Test profile completion
- [ ] Test course information loading

### Teacher Dashboard
- [ ] Test assigned courses loading
- [ ] Test attendance marking
- [ ] Test leave request review
- [ ] Test student list loading
- [ ] Test attendance reports

### Admin Dashboard
- [ ] Test user management
- [ ] Test course creation
- [ ] Test teacher assignment
- [ ] Test attendance reports
- [ ] Test system statistics

## 🚀 Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Test the production build locally:**
   ```bash
   npm install -g serve
   serve -s build
   ```

3. **Deploy to hosting platform:**
   - Upload build folder to your hosting service
   - Configure environment variables if needed
   - Ensure HTTPS is enabled

4. **Post-Deployment Verification:**
   - [ ] Test login from production URL
   - [ ] Verify API calls in browser DevTools Network tab
   - [ ] Check for CORS errors
   - [ ] Test critical user flows

## 🔧 Backend Requirements

Ensure your Railway backend:
- [ ] Is running and accessible
- [ ] Has CORS configured to allow your frontend domain
- [ ] Has all required endpoints implemented
- [ ] Returns proper JWT tokens for authentication
- [ ] Handles all API routes correctly

## 📝 Environment Variables (Optional)

If using environment-specific configuration:

**.env.production:**
```env
REACT_APP_API_URL=https://student-attandance-system-backend-production.up.railway.app
```

**.env.development:**
```env
REACT_APP_API_URL=http://localhost:8080
```

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution:** Configure backend to allow requests from frontend domain

### Issue: 401 Unauthorized
**Solution:** Clear localStorage and re-login to get fresh token

### Issue: 404 Not Found
**Solution:** Verify backend URL and endpoint paths match

### Issue: Network Error
**Solution:** Check if backend is running and accessible

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab in DevTools
3. Verify backend logs
4. Clear browser cache and localStorage
5. Test with different browsers

## 🎉 Success Criteria

Deployment is successful when:
- [ ] Users can register and login
- [ ] All dashboards load correctly
- [ ] Attendance can be marked
- [ ] Leave requests work end-to-end
- [ ] No console errors
- [ ] All API calls return expected data

---

**Backend URL:** `https://student-attandance-system-backend-production.up.railway.app`

**Last Updated:** $(date)
