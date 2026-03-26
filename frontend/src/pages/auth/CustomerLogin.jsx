import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import ErrorMessage from '../../components/ErrorMessage';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';

const CustomerLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const res = await axiosInstance.post('/auth/login', { ...formData, role: 'customer' });
      login(res.data.token, res.data.role, res.data.userId);
      navigate('/customer/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Login</h2>
        <p className="text-gray-500">Welcome back!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
            <input
              type="email"
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-black`}
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <Link to="#" className="text-xs text-primary font-medium hover:underline opacity-50 cursor-not-allowed">Forgot Password?</Link>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
            <input
              type="password"
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-black`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
        </div>

        <ErrorMessage message={apiError} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              <LogIn size={20} />
              <span>Login to Dashboard</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-10 pt-6 border-t border-gray-50 text-center text-sm text-gray-500">
        Don't have a customer account? <Link to="/customer/signup" className="text-primary font-semibold hover:underline">Create one</Link>
      </div>
    </div>
  );
};

export default CustomerLogin;
