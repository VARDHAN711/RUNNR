import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, User, Phone, IndianRupee, Check, X, Info, RefreshCw } from 'lucide-react';

const AcceptRequestsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores requestId

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/tasks/${id}/requests`);
      setRequests(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      await axiosInstance.patch(`/tasks/${id}/requests/${requestId}/${action}`);
      await fetchRequests(); // Refresh list to show updated statuses
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Freelancer Requests</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setRefreshing(true);
              await fetchRequests();
              setRefreshing(false);
            }}
            disabled={refreshing || loading}
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
            {requests.length} total request{requests.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <Info size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No requests yet</h3>
          <p className="text-gray-500">Wait for freelancers to show interest in your task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-xl uppercase">
                  {request.freelancerId?.name?.charAt(0) || 'F'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{request.freelancerId?.name}</h4>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <span>{request.freelancerId?.phone}</span>
                    </div>
                    {request.freelancerId?.skills && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {request.freelancerId.skills.split(',').map((skill, index) => (
                          <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-1 w-full md:w-auto px-6 py-3 bg-gray-50 rounded-2xl">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Bid Amount</span>
                <div className="flex items-center gap-1.5 text-primary font-extrabold text-xl">
                  <IndianRupee size={20} />
                  <span>{request.totalPrice}</span>
                </div>
                <div className="text-[10px] text-gray-400">
                  (Base {request.basePrice} + Top-up {request.topUpAmount})
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                <StatusBadge status={request.status} />
                
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(request._id, 'reject')}
                      disabled={actionLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50"
                      title="Reject"
                    >
                      {actionLoading === request._id ? <RefreshCw className="animate-spin" size={20} /> : <X size={20} />}
                    </button>
                    <button
                      onClick={() => handleAction(request._id, 'accept')}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-sm disabled:opacity-50"
                    >
                      {actionLoading === request._id ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                      <span>Accept</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcceptRequestsPage;
