import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, Calendar, MapPin, IndianRupee, Clock, User, Phone, Edit, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

const CustomerTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const fetchTaskAndRequests = async () => {
      try {
        const [taskRes, requestsRes] = await Promise.all([
          axiosInstance.get(`/tasks/${id}`),
          axiosInstance.get(`/tasks/${id}/requests`)
        ]);
        setTask(taskRes.data.data);
        setRequests(requestsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch task details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTaskAndRequests();
  }, [id]);

  const handleMarkAsCompleted = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      const res = await axiosInstance.patch(`/tasks/${id}/status`, { status: 'completed' });
      setTask(res.data.data);
      setShowCompleteModal(false);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      navigate('/customer/dashboard');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTask = () => {
    navigate('/customer/post-task', { state: { task } });
  };

  const handleViewRequests = () => {
    navigate(`/customer/tasks/${id}/requests`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!task) return <ErrorMessage message="Task not found" />;

  const acceptedRequest = requests.find(r => r.status === 'accepted');
  const isAssignedOrCompleted = ['assigned', 'completed'].includes(task.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft size={18} />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-left">
        <div className="p-8 border-b border-gray-50">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <StatusBadge status={task.status} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Location</span>
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <MapPin size={18} className="text-primary" />
                <span>{task.location}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Deadline</span>
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Calendar size={18} className="text-primary" />
                <span>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">
                {acceptedRequest ? 'Final Bid' : 'Base Price'}
              </span>
              <div className="flex items-center gap-2 text-gray-700 font-bold text-lg">
                <IndianRupee size={20} className="text-primary" />
                <span>{acceptedRequest ? acceptedRequest.basePrice + acceptedRequest.topUpAmount : task.basePrice}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Posted On</span>
              <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                <Clock size={16} className="text-primary" />
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{task.description}</p>
        </div>

        {isAssignedOrCompleted && acceptedRequest && (
          <div className="p-8 bg-blue-50/50 border-t border-blue-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Assigned Freelancer
            </h3>
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                {acceptedRequest.freelancerId?.name?.charAt(0) || 'F'}
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <p className="text-xl font-bold text-gray-900">{acceptedRequest.freelancerId?.name}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500">
                  <Phone size={16} />
                  <span>{acceptedRequest.freelancerId?.phone}</span>
                </div>
                {acceptedRequest.freelancerId?.skills && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                    {acceptedRequest.freelancerId.skills.split(',').map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded uppercase tracking-wider">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4">
          {task.status === 'open' && (
            <>
              <button
                onClick={handleEditTask}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
              >
                <Edit size={18} />
                <span>Edit Task</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition shadow-sm"
              >
                <Trash2 size={18} />
                <span>Delete Task</span>
              </button>
              <button
                onClick={handleViewRequests}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-blue-100 ml-auto"
              >
                <ExternalLink size={18} />
                <span>View Requests</span>
              </button>
            </>
          )}

          {task.status === 'assigned' && (
            <button
              onClick={() => setShowCompleteModal(true)}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 w-full sm:w-auto"
            >
              <CheckCircle size={18} />
              <span>Mark as Completed</span>
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mt-4">
          <ErrorMessage message={actionError} />
        </div>
      )}

      <ConfirmModal
        isOpen={showCompleteModal}
        title="Mark Task as Completed"
        message="Are you sure you want to mark this task as completed? This action will finalize the task."
        confirmText="Mark as Completed"
        onConfirm={handleMarkAsCompleted}
        onCancel={() => setShowCompleteModal(false)}
        confirmLoading={actionLoading}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteTask}
        onCancel={() => setShowDeleteModal(false)}
        confirmLoading={actionLoading}
      />
    </div>
  );
};

export default CustomerTaskDetail;
