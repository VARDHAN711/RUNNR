import React from 'react';
import { LogOut, PlusCircle, LayoutDashboard, Briefcase } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
