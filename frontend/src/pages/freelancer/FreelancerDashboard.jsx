import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import TaskCard from '../../components/TaskCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Search, RefreshCw, Briefcase } from 'lucide-react';

const FreelancerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOpenTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, requestsRes] = await Promise.all([
        axiosInstance.get('/tasks'),
        axiosInstance.get('/tasks/my-requests')
      ]);
      setTasks(tasksRes.data.data);
      setRequests(requestsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenTasks();
  }, []);

  const onViewDetail = (taskId) => {
    navigate(`/freelancer/tasks/${taskId}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Search size={28} className="text-primary" />
            Find Work
          </h1>
          <p className="text-gray-500 mt-1">Browse open tasks and submit your best quote</p>
        </div>
        <button
          onClick={fetchOpenTasks}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary transition-colors bg-white rounded-xl border border-gray-100 shadow-sm"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center text-primary/30 mb-4">
            <Briefcase size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No open tasks available</h3>
          <p className="text-gray-500">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              role="freelancer"
              onViewDetail={onViewDetail}
              requests={requests}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;
