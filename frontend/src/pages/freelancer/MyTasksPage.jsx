import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import TaskCard from '../../components/TaskCard';
import { Briefcase, CheckCircle2, PackageSearch, ArrowLeft, RefreshCw } from 'lucide-react';

const MyTasksPage = () => {
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' or 'completed'
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMyTasks = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const [tasksRes, requestsRes] = await Promise.all([
        axiosInstance.get('/tasks/freelancer-tasks'),
        axiosInstance.get('/tasks/my-requests')
      ]);
      setTasks(tasksRes.data.data);
      setRequests(requestsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const filteredTasks = tasks.filter(task => task.status === activeTab);

  const onViewDetail = (taskId) => {
    // Both views use the same detail component for freelancers
    navigate(`/freelancer/tasks/${taskId}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/freelancer/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition w-fit"
          >
            <ArrowLeft size={18} />
            <span>Back to Find Work</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Workplace</h1>
            <p className="text-gray-500 mt-1">Track tasks you are working on or have completed</p>
          </div>
        </div>
        <button
          onClick={() => fetchMyTasks(false)}
          disabled={refreshing || loading}
          className="p-3 text-gray-400 hover:text-primary transition-colors bg-white rounded-xl border border-gray-100 shadow-sm"
          title="Refresh"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-full max-w-sm">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'assigned'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase size={18} />
          <span>Assigned</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'completed'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle2 size={18} />
          <span>Completed</span>
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner />
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
            <PackageSearch size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No {activeTab} tasks</h3>
          <p className="text-gray-500">
            {activeTab === 'assigned' 
              ? "You haven't been assigned any tasks yet." 
              : "Complete your assigned tasks to see them here."}
          </p>
          {activeTab === 'assigned' && (
            <button
              onClick={() => navigate('/freelancer/dashboard')}
              className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition"
            >
              Find Open Tasks
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {filteredTasks.map((task) => (
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

export default MyTasksPage;
