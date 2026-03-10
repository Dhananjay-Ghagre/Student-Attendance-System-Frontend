import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CheckInOut = () => {
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
            alert('Checked in successfully!');
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
            alert('Checked out successfully!');
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
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Daily Attendance</h2>
            
            {/* Current Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Today's Status</h3>
                <p className={`text-xl font-bold ${getStatusColor()}`}>
                    {getStatusText()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                    Current Time: {currentTime.toLocaleTimeString()}
                </p>
            </div>

            {/* Check-in Section */}
            <div className="mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Check-In (8:00 AM - 9:00 AM)</h3>
                    {attendanceStatus.hasCheckedIn && (
                        <span className="text-green-600 font-medium">
                            ✓ {new Date(attendanceStatus.checkInTime).toLocaleTimeString()}
                        </span>
                    )}
                </div>
                
                {!attendanceStatus.hasCheckedIn && (
                    <>
                        <p className="text-sm text-gray-600 mb-3">
                            {getTimeRemaining(true)}
                        </p>
                        <button
                            onClick={handleCheckIn}
                            disabled={!isCheckInTime() || loading}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                isCheckInTime() && !loading
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {loading ? 'Checking In...' : 'Check In'}
                        </button>
                    </>
                )}
            </div>

            {/* Check-out Section */}
            <div className="mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Check-Out (4:00 PM - 5:00 PM)</h3>
                    {attendanceStatus.hasCheckedOut && (
                        <span className="text-green-600 font-medium">
                            ✓ {new Date(attendanceStatus.checkOutTime).toLocaleTimeString()}
                        </span>
                    )}
                </div>
                
                {!attendanceStatus.hasCheckedOut && (
                    <>
                        <p className="text-sm text-gray-600 mb-3">
                            {getTimeRemaining(false)}
                        </p>
                        <button
                            onClick={handleCheckOut}
                            disabled={!isCheckOutTime() || !attendanceStatus.hasCheckedIn || loading}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                isCheckOutTime() && attendanceStatus.hasCheckedIn && !loading
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {loading ? 'Checking Out...' : 'Check Out'}
                        </button>
                        {!attendanceStatus.hasCheckedIn && (
                            <p className="text-sm text-red-600 mt-2">
                                Must check-in first before checking out
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Check-in between 8:00 AM - 9:00 AM</li>
                    <li>• Check-out between 4:00 PM - 5:00 PM</li>
                    <li>• Both check-in and check-out required for "Present" status</li>
                    <li>• Must be within 100m of college location</li>
                    <li>• Missing either will result in "Absent" status</li>
                </ul>
            </div>
        </div>
    );
};

export default CheckInOut;