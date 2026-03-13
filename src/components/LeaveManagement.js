import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, FileText, Check, X, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

const LeaveManagement = ({ leaveRequests = [], onDataChange }) => {
  const [reviewModal, setReviewModal] = useState({ isOpen: false, request: null });
  const [reviewData, setReviewData] = useState({ status: '', teacherComment: '' });
  
  useEffect(() => {
    console.log('LeaveManagement useEffect - leaveRequests changed:', leaveRequests);
  }, [leaveRequests]);
  
  console.log('LeaveManagement render - received leaveRequests:', leaveRequests);

  const openReviewModal = (request) => {
    setReviewModal({ isOpen: true, request });
    setReviewData({ status: '', teacherComment: '' });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, request: null });
    setReviewData({ status: '', teacherComment: '' });
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://student-attandance-system-backend-production.up.railway.app/api/teacher/leave-requests/${reviewModal.request.id}/review`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Leave request reviewed successfully!');
      closeReviewModal();
      // Trigger parent component data refresh
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error reviewing leave request:', error);
      toast.error('Error reviewing leave request: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleQuickAction = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://student-attandance-system-backend-production.up.railway.app/api/teacher/leave-requests/${requestId}/review`,
        { status, teacherComment: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Leave request ${status.toLowerCase()} successfully!`);
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast.error('Error updating leave request: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { color: 'badge-warning', icon: Clock, text: 'Pending' },
      APPROVED: { color: 'badge-success', icon: CheckCircle, text: 'Approved' },
      REJECTED: { color: 'badge-danger', icon: XCircle, text: 'Rejected' }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
          <p className="text-gray-600">Review and manage student leave applications</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-700">
          LeaveManagement Debug: Received {leaveRequests.length} leave requests
        </p>
      </div>
      
      {leaveRequests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No leave requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.student?.fullName || request.student?.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.createdAt ? formatDate(request.createdAt) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.course?.name}</div>
                      <div className="text-xs text-gray-500">{request.course?.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickAction(request.id, 'APPROVED')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                            title="Approve"
                          >
                            <Check className="h-3 w-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleQuickAction(request.id, 'REJECTED')}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                            title="Reject"
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </button>
                          <button
                            onClick={() => openReviewModal(request)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                            title="Review with comment"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Review
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {request.reviewedAt ? formatDate(request.reviewedAt) : 'Reviewed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Review Leave Request</h2>
                    <p className="text-sm text-gray-600">Approve or reject this application</p>
                  </div>
                </div>
                <button
                  onClick={closeReviewModal}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Student</label>
                  <p className="text-lg font-medium text-gray-900">
                    {reviewModal.request.student?.fullName || reviewModal.request.student?.username}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Duration</label>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(reviewModal.request.startDate)} - {formatDate(reviewModal.request.endDate)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Reason</label>
                  <p className="text-lg font-medium text-gray-900">{reviewModal.request.reason}</p>
                </div>
              </div>

              <form onSubmit={handleReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Decision</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="APPROVED"
                        onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                        className="mr-2"
                        required
                      />
                      <span className="text-green-600 font-medium">Approve</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="REJECTED"
                        onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                        className="mr-2"
                        required
                      />
                      <span className="text-red-600 font-medium">Reject</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Comment (Optional)</label>
                  <textarea
                    value={reviewData.teacherComment}
                    onChange={(e) => setReviewData({ ...reviewData, teacherComment: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    rows="3"
                    placeholder="Add a comment for the student..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;