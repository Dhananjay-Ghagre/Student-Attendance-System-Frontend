import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GeolocationAttendance = ({ onAttendanceMarked, onClose, studentCourses, profile }) => {
  const [location, setLocation] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendanceForm, setAttendanceForm] = useState({ present: true });

  // College location (fixed coordinates)
  const COLLEGE_LOCATION = {
    latitude: 12.966868,
    longitude: 77.723573
  };
  const ALLOWED_RADIUS = 100; // meters

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        setLocation(userLocation);
        checkLocationRange(userLocation);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location. Please enable location services.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const checkLocationRange = (userLocation) => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      COLLEGE_LOCATION.latitude,
      COLLEGE_LOCATION.longitude
    );
    
    setIsWithinRange(distance <= ALLOWED_RADIUS);
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    
    if (!isWithinRange) {
      toast.error('You must be within college premises to mark attendance');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      let courseId = null;
      let courseName = '';
      
      if (studentCourses.length > 0) {
        courseId = studentCourses[0].id;
        courseName = studentCourses[0].name;
      } else if (profile.course) {
        const courseMapping = {
          'Mathematics 101': 1,
          'Physics 101': 2,
          'Chemistry 101': 3
        };
        courseId = courseMapping[profile.course] || 1;
        courseName = profile.course;
      } else {
        toast.error('No course information found!');
        return;
      }

      const attendanceData = {
        courseId: courseId,
        present: attendanceForm.present,
        date: today,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      };

      await onAttendanceMarked(attendanceData);
      toast.success(`Attendance marked successfully for ${courseName}!`);
      onClose();
    } catch (error) {
      console.error('Mark attendance error:', error);
      toast.error('Error marking attendance');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Getting your location...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className={`px-6 py-4 border-b border-gray-100 ${isWithinRange ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-red-50 to-orange-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isWithinRange ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-orange-600'}`}>
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Location-Based Attendance</h2>
                <p className="text-xs text-gray-600">Verify your location to mark attendance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Location Status */}
          <div className={`rounded-lg p-4 mb-6 ${isWithinRange ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-3">
              {isWithinRange ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <h3 className={`font-medium ${isWithinRange ? 'text-green-900' : 'text-red-900'}`}>
                  {isWithinRange ? 'Within College Premises' : 'Outside College Premises'}
                </h3>
                <p className={`text-sm ${isWithinRange ? 'text-green-700' : 'text-red-700'}`}>
                  {isWithinRange 
                    ? 'You can mark your attendance' 
                    : 'You must be within 100m of college to mark attendance'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Your Location</h4>
            <p className="text-sm text-gray-600">
              Latitude: {location?.latitude.toFixed(6)}<br/>
              Longitude: {location?.longitude.toFixed(6)}
            </p>
          </div>

          {/* Course Info */}
          {(studentCourses.length > 0 || profile.course) && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-1">Course</h3>
              <p className="text-blue-700">
                {studentCourses.length > 0 
                  ? `${studentCourses[0].name} (${studentCourses[0].code})`
                  : profile.course
                }
              </p>
            </div>
          )}

          {/* Attendance Form */}
          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mark your attendance</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="present"
                    value={true}
                    checked={attendanceForm.present === true}
                    onChange={() => setAttendanceForm({ ...attendanceForm, present: true })}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-green-600 font-medium">Present</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="present"
                    value={false}
                    checked={attendanceForm.present === false}
                    onChange={() => setAttendanceForm({ ...attendanceForm, present: false })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-red-600 font-medium">Absent</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isWithinRange}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  isWithinRange 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Mark Attendance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeolocationAttendance;