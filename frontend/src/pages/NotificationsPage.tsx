import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { INotification, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Bell, CheckCircle, Info, Clock, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBack = () => {
    if (user.role === UserRole.CUSTOMER) {
      navigate('/customer/dashboard');
    } else {
      navigate('/freelancer/dashboard');
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/notifications');
      setNotifications(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: INotification) => {
    if (!notification.isRead) {
      try {
        await axiosInstance.patch(`/notifications/${notification._id}/read`);
        setNotifications(prev => prev.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        window.dispatchEvent(new Event('notification-read'));
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }

    if (notification.taskId) {
      if (user.role === UserRole.CUSTOMER) {
        navigate(`/customer/tasks/${notification.taskId}`);
      } else {
        navigate(`/freelancer/tasks/${notification.taskId}`);
      }
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      // In a real app with many notifications, we'd have a specific bulk endpoint
      // For now, we'll mark them read individually
      await Promise.all(unread.map(n => axiosInstance.patch(`/notifications/${n._id}/read`)));
      window.dispatchEvent(new Event('notification-read'));
    } catch (err) {
      console.error("Failed to mark all as read", err);
      fetchNotifications(); // Revert on failure
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'status_update': return <Info size={24} className="text-blue-500" />;
      case 'system': return <AlertCircle size={24} className="text-orange-500" />;
      default: return <Bell size={24} className="text-gray-500" />;
    }
  };

  if (loading && notifications.length === 0) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-4">
        <button 
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="text-primary" />
          Notifications
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className={`text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Refresh notifications"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllAsRead}
              className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
            >
              <CheckCircle size={16} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <ErrorMessage message={error} />

      {notifications.length === 0 && !loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <Bell size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
          <p className="text-gray-500">You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div 
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-5 flex gap-4 cursor-pointer transition-colors ${notification.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-50/50'}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-sm ${notification.isRead ? 'text-gray-800' : 'text-gray-900 font-semibold'}`}>
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1.5 ml-3"></span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Just now'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
