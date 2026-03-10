import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

const CheckInOutAttendance = ({ onClose, onAttendanceMarked }) => {
    const [attendanceStatus, setAttendanceStatus] = useState({
        hasCheckedIn: false,
        hasCheckedOut: false,
        checkInTime: null,
        checkOutTime: null,
        status: 'NOT_STARTED'
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTodayStatus();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchTodayStatus = async () => {
        try {
            const response = await axios.get('/api/student/today-status');
            setAttendanceStatus(response.data);
        } catch (error) {
            console.error('Error fetching today status:', error);
        }
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        });
    };

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            const location = await getCurrentLocation();
            await axios.post('/api/student/checkin', location);
            fetchTodayStatus();
            if (onAttendanceMarked) onAttendanceMarked();
        } catch (error) {
            alert(error.response?.data?.error || 'Error during check-in');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            const location = await getCurrentLocation();
            await axios.post('/api/student/checkout', location);
            fetchTodayStatus();
            if (onAttendanceMarked) onAttendanceMarked();
        } catch (error) {
            alert(error.response?.data?.error || 'Error during check-out');
        } finally {
            setLoading(false);
        }
    };

    const isCheckInTime = () => {
        const hour = currentTime.getHours();
        return hour >= 8 && hour < 9;
    };

    const isCheckOutTime = () => {
        const hour = currentTime.getHours();
        return hour >= 16 && hour < 17;
    };

    const getTimeRemaining = (isCheckIn) => {
        const hour = currentTime.getHours();
        const minute = currentTime.getMinutes();
        
        if (isCheckIn) {
            if (hour < 8) {
                const remaining = (8 * 60) - (hour * 60 + minute);
                return `Check-in starts in ${Math.floor(remaining / 60)}h ${remaining % 60}m`;
            } else if (hour === 8) {
                const remaining = 60 - minute;
                return `Check-in ends in ${remaining}m`;
            } else {
                return 'Check-in window closed';
            }
        } else {
            if (hour < 16) {
                const remaining = (16 * 60) - (hour * 60 + minute);
                return `Check-out starts in ${Math.floor(remaining / 60)}h ${remaining % 60}m`;
            } else if (hour === 16) {
                const remaining = 60 - minute;
                return `Check-out ends in ${remaining}m`;
            } else {
                return 'Check-out window closed';
            }
        }
    };

    const getStatusColor = () => {
        switch (attendanceStatus.status) {
            case 'PRESENT': return 'text-green-600';
            case 'PARTIAL': return 'text-yellow-600';
            case 'ABSENT': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusText = () => {
        switch (attendanceStatus.status) {
            case 'PRESENT': return 'Present - Day Complete';
            case 'PARTIAL': return 'Partial - Missing Check-in/out';
            case 'ABSENT': return 'Absent';
            default: return 'Not Started';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Mark Today's Attendance</h2>
                                <p className="text-xs text-gray-600">Check-in and Check-out required</p>
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

                {/* Content */}
                <div className="p-4">
                    {/* Current Status */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Status</h3>
                                <p className={`text-lg font-bold ${getStatusColor()}`}>
                                    {getStatusText()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Current Time</p>
                                <p className="text-sm font-medium text-gray-700">
                                    {currentTime.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Check-in Section */}
                    <div className="mb-4 p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold">Check-In (8-9 AM)</h3>
                            {attendanceStatus.hasCheckedIn && (
                                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    {new Date(attendanceStatus.checkInTime).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                        
                        {!attendanceStatus.hasCheckedIn && (
                            <>
                                <p className="text-xs text-gray-600 mb-2">
                                    {getTimeRemaining(true)}
                                </p>
                                <button
                                    onClick={handleCheckIn}
                                    disabled={!isCheckInTime() || loading}
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isCheckInTime() && !loading
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? 'Checking In...' : 'Check In Now'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Check-out Section */}
                    <div className="mb-4 p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold">Check-Out (4-5 PM)</h3>
                            {attendanceStatus.hasCheckedOut && (
                                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    {new Date(attendanceStatus.checkOutTime).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                        
                        {!attendanceStatus.hasCheckedOut && (
                            <>
                                <p className="text-xs text-gray-600 mb-2">
                                    {getTimeRemaining(false)}
                                </p>
                                <button
                                    onClick={handleCheckOut}
                                    disabled={!isCheckOutTime() || !attendanceStatus.hasCheckedIn || loading}
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isCheckOutTime() && attendanceStatus.hasCheckedIn && !loading
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? 'Checking Out...' : 'Check Out Now'}
                                </button>
                                {!attendanceStatus.hasCheckedIn && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        Must check-in first
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-1 text-sm">Instructions:</h4>
                        <ul className="text-xs text-blue-700 space-y-0.5">
                            <li>• Both check-in & check-out required for "Present"</li>
                            <li>• Must be within 100m of college location</li>
                            <li>• Missing either will result in "Absent"</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckInOutAttendance;