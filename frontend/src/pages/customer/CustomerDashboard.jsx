import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import TaskCard from '../../components/TaskCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmModal from '../../components/ConfirmModal';
import { PackageOpen, RefreshCw } from 'lucide-react';

const CustomerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, requestsRes] = await Promise.all([
        axiosInstance.get('/tasks/my-tasks'),
        axiosInstance.get('/tasks/received-requests')
      ]);
      setTasks(tasksRes.data.data);
      setRequests(requestsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEdit = (task) => {
    navigate('/customer/post-task', { state: { task } });
  };

  const handleDeleteClick = (taskId) => {
    setDeleteModal({ isOpen: true, taskId });
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/tasks/${deleteModal.taskId}`);
      setTasks(tasks.filter(t => t._id !== deleteModal.taskId));
      setDeleteModal({ isOpen: false, taskId: null });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const onViewRequests = (taskId) => {
    navigate(`/customer/tasks/${taskId}/requests`);
  };

  const onViewDetail = (taskId) => {
    navigate(`/customer/tasks/${taskId}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Tasks</h1>
          <p className="text-gray-500 mt-1">Manage and track your posted tasks</p>
        </div>
        <button
          onClick={fetchTasks}
          className="p-2 text-gray-400 hover:text-primary transition-colors"
          title="Refresh"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <PackageOpen size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No tasks posted yet</h3>
          <p className="text-gray-500 mb-6">Create your first task to find a freelancer.</p>
          <button
            onClick={() => navigate('/customer/post-task')}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition shadow-md"
          >
            Post a Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              role="customer"
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onViewRequests={onViewRequests}
              onViewDetail={onViewDetail}
              requests={requests}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        confirmLoading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, taskId: null })}
      />
    </div>
  );
};

export default CustomerDashboard;
