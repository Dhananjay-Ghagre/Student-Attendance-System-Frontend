import React from 'react';
import { LogOut, User, Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ user, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg shadow-blue-100/20 border-b border-blue-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-3 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-300"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200/50">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Student Attendance System
                  </h1>
                  <p className="text-sm text-indigo-600 font-medium">Smart Education Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-white shadow-md">
                    <User size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-indigo-800">
                      {user.username}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                        user.role === 'ADMIN' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
                        user.role === 'TEACHER' ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white' :
                        'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-red-200/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-300/50"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;