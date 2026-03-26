import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import ErrorMessage from '../../components/ErrorMessage';
import { User, Mail, Lock, Phone, Wrench, ArrowRight, Loader2 } from 'lucide-react';

const FreelancerSignup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', skills: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.skills) newErrors.skills = 'Skills are required';
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
      const res = await axiosInstance.post('/auth/signup', { ...formData, role: 'freelancer' });
      login(res.data.token, res.data.role, res.data.userId);
      navigate('/freelancer/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-serif text-gray-900 mb-2 underline decoration-indigo-500 decoration-4 underline-offset-8">Join as Freelancer</h2>
        <p className="text-gray-500 mt-4">Earn money by completing tasks.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></span>
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black`}
              placeholder="Jane Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
            <input
              type="email"
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black`}
              placeholder="jane@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Phone size={18} /></span>
              <input
                type="tel"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm text-black`}
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
              <input
                type="password"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm text-black`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Skills (Comma separated)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400"><Wrench size={18} /></span>
            <textarea
              rows="2"
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.skills ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black`}
              placeholder="Plumbing, Delivery, Electrical..."
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>
          {errors.skills && <p className="mt-1 text-xs text-red-500 font-medium">{errors.skills}</p>}
        </div>

        <ErrorMessage message={apiError} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              <span>Become a Runnr</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account? <Link to="/freelancer/login" className="text-indigo-600 font-semibold hover:underline">Log In</Link>
      </div>
    </div>
  );
};

export default FreelancerSignup;
