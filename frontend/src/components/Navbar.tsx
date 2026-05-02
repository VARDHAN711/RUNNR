import React, { useEffect, useState } from 'react';
import { LogOut, PlusCircle, Briefcase, Bell, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user.token) {
      fetchUnreadCount();
      
      const handleNotificationRead = () => fetchUnreadCount();
      window.addEventListener('notification-read', handleNotificationRead);
      
      return () => {
        window.removeEventListener('notification-read', handleNotificationRead);
      };
    }
  }, [user.token]);

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get('/notifications/unread-count');
      setUnreadCount(res.data.data);
    } catch (err) {
      console.error("Failed to fetch unread notifications count", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user.token) return null;

  const isCustomer = user.role === 'customer';

  return (
    <nav className="bg-white border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isCustomer ? "/customer/dashboard" : "/freelancer/dashboard"} className="text-2xl font-bold text-primary flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded">R</span>
              <span>Runnr</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isCustomer ? (
              <>
                <Link to="/customer/post-task" className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition shadow-sm">
                  <PlusCircle size={18} />
                  <span>Post a Task</span>
                </Link>
              </>
            ) : (
              <Link to="/freelancer/my-tasks" className="text-gray-600 hover:text-primary transition flex items-center gap-2 font-medium">
                <Briefcase size={20} />
                <span>My Tasks</span>
              </Link>
            )}

            <Link 
              to="/notifications" 
              className="relative p-2 text-gray-500 hover:text-primary transition rounded-full hover:bg-gray-50 flex items-center"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            <Link 
              to="/profile" 
              className="p-2 text-gray-500 hover:text-primary transition rounded-full hover:bg-gray-50 flex items-center"
              title="Profile"
            >
              <User size={20} />
            </Link>

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
