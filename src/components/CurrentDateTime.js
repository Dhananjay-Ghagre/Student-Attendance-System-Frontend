import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

const CurrentDateTime = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-600">Today</p>
                        <p className="text-lg font-bold text-gray-900">{formatDate(currentDateTime)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                        <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-indigo-600">Current Time</p>
                        <p className="text-lg font-bold text-gray-900">{formatTime(currentDateTime)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentDateTime;