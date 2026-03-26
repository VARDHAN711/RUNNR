import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Welcome to <span className="text-primary italic">Runnr</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
          The most efficient task marketplace. Choose how you want to use the platform today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Customer Card */}
        <div className="group flex flex-col items-center text-center">
          <button
            onClick={() => navigate('/customer/login')}
            className="w-full bg-white p-10 rounded-3xl shadow-sm border-2 border-transparent hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center group-hover:bg-blue-50/50"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <User size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Customer</h2>
            <p className="text-gray-500 mb-0">I want to get my tasks done efficiently</p>
          </button>
          <div className="mt-4 text-sm text-gray-500">
            Don't have an account? <Link to="/customer/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
          </div>
        </div>

        {/* Freelancer Card */}
        <div className="group flex flex-col items-center text-center">
          <button
            onClick={() => navigate('/freelancer/login')}
            className="w-full bg-white p-10 rounded-3xl shadow-sm border-2 border-transparent hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center group-hover:bg-blue-50/50"
          >
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <Briefcase size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Freelancer</h2>
            <p className="text-gray-500 mb-0">I want to earn by completing tasks</p>
          </button>
          <div className="mt-4 text-sm text-gray-500">
            Don't have an account? <Link to="/freelancer/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
