import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { studentAPI } from '../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProfileCompletion = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    batch: '',
    yearOfStudy: '',
    course: ''
  });
  const [loading, setLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);

  useEffect(() => {
    loadAvailableCourses();
  }, []);

  const loadAvailableCourses = async () => {
    try {
      console.log('Attempting to load courses from public endpoint...');
      // Use public endpoint that doesn't require authentication
      const response = await axios.get('https://student-attandance-system-backend-production.up.railway.app/api/public/courses');
      console.log('Courses response:', response.data);
      setAvailableCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Try admin endpoint as fallback
      try {
        console.log('Trying admin endpoint as fallback...');
        const adminResponse = await axios.get('https://student-attandance-system-backend-production.up.railway.app/api/admin/courses');
        console.log('Admin courses response:', adminResponse.data);
        setAvailableCourses(adminResponse.data);
      } catch (adminError) {
        console.error('Admin endpoint also failed:', adminError);
        setAvailableCourses([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentAPI.completeProfile(formData);
      toast.success('Profile completed successfully!');
      onComplete();
    } catch (error) {
      toast.error('Error completing profile: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
              <p className="text-sm text-gray-600">Please provide your academic details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-2" />
              Batch
            </label>
            <select
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Batch</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <GraduationCap className="inline h-4 w-4 mr-2" />
              Year of Study
            </label>
            <select
              value={formData.yearOfStudy}
              onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <BookOpen className="inline h-4 w-4 mr-2" />
              Course
            </label>
            <select
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Course</option>
              {availableCourses.map(course => (
                <option key={course.id} value={course.name}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
            {availableCourses.length === 0 && (
              <p className="text-xs text-red-600 mt-1">No courses available. Please contact admin.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;