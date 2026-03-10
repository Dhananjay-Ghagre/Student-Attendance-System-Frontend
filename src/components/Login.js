import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, User, Lock, Eye, EyeOff, GraduationCap, Shield, UserCheck, AlertCircle, Sparkles, BookOpen, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import ForgotPassword from './ForgotPassword';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.username.trim()) {
      newErrors.username = 'Enrollment Number is required';
    } else if (!/^[A-Z]{2}[0-9]{4}$/.test(credentials.username)) {
      newErrors.username = 'Enrollment Number must be 2 capital letters followed by 4 digits (e.g., AB1234)';
    }
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await authAPI.login(credentials);
      const { token, username, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);
      toast.success('🎉 Welcome back! Login successful');
      onLogin({ username, role });
    } catch (error) {
      toast.error('❌ Invalid enrollment number or password. Please try again.');
      setErrors({ general: 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials({ ...credentials, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const features = [
    { 
      icon: Shield, 
      title: 'Secure Access', 
      desc: 'Advanced JWT-based security system', 
      color: 'text-purple-600' 
    },
    { 
      icon: BarChart3, 
      title: 'Real-time Analytics', 
      desc: 'Live attendance tracking and insights', 
      color: 'text-blue-600' 
    },
    { 
      icon: BookOpen, 
      title: 'Course Management', 
      desc: 'Comprehensive academic oversight', 
      color: 'text-green-600' 
    },
    { 
      icon: Sparkles, 
      title: 'Modern Interface', 
      desc: 'Intuitive and responsive design', 
      color: 'text-pink-600' 
    }
  ];

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen transition-all duration-500 bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse bg-indigo-300"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-pulse delay-1000 bg-purple-300"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 animate-spin bg-gradient-to-r from-indigo-300 to-purple-300" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side - Enhanced Illustration/Info */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-gray-900">
              Smart Attendance
              <span className="block text-indigo-600">
                Management
              </span>
            </h1>
            <p className="text-xl mb-8 text-gray-600">
              Experience the future of educational administration with our cutting-edge attendance tracking platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Enhanced Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="rounded-3xl shadow-2xl border backdrop-blur-sm p-8 transition-all duration-300 bg-white/90 border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 text-gray-900">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to access your personalized dashboard
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 rounded-xl flex items-center space-x-3 bg-red-50 border border-red-200 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">
                  Enrollment Number
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      if (value.length <= 6 && /^[A-Z]{0,2}[0-9]{0,4}$/.test(value)) {
                        handleInputChange('username', value);
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                      errors.username 
                        ? 'border-red-300 bg-red-50 text-gray-900'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="e.g., AB1234"
                    maxLength="6"
                    aria-label="Enrollment Number"
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.username}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-12 pr-14 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                      errors.password 
                        ? 'border-red-300 bg-red-50 text-gray-900'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="Enter your password"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing you in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium transition-colors text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </button>
              
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold transition-colors text-indigo-600 hover:text-indigo-500">
                  Create one now
                </Link>
              </p>
            </div>

            {/* Security Info */}
            <div className="mt-8 p-6 rounded-2xl border text-center bg-gray-50/50 border-gray-200">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Shield className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-semibold text-gray-700">
                  Secure Login
                </p>
              </div>
              <p className="text-xs leading-relaxed text-gray-600">
                Your data is protected with enterprise-grade security. All communications are encrypted and your privacy is our priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;