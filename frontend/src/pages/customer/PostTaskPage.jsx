import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import ErrorMessage from '../../components/ErrorMessage';
import { ArrowLeft, Save, Loader2, Calendar, MapPin, IndianRupee, FileText } from 'lucide-react';

const PostTaskPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTask = location.state?.task;

  const [formData, setFormData] = useState({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    location: editingTask?.location || '',
    basePrice: editingTask?.basePrice || '',
    deadline: editingTask?.deadline ? new Date(editingTask.deadline).toISOString().split('T')[0] : '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.basePrice || formData.basePrice <= 0) newErrors.basePrice = 'Price must be a positive number';
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(formData.deadline) < today) {
        newErrors.deadline = 'Deadline must be a future date';
      }
    }
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
      if (editingTask) {
        await axiosInstance.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await axiosInstance.post('/tasks', formData);
      }
      navigate('/customer/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-left">
        <div className="bg-primary px-8 py-6 text-white">
          <h2 className="text-2xl font-bold">{editingTask ? 'Edit Task' : 'Post a New Task'}</h2>
          <p className="text-blue-100 text-sm mt-1">Provide clear details for freelancers</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              Task Title
            </label>
            <input
              type="text"
              className={`w-full px-4 py-3 bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition`}
              placeholder="e.g. Fix a leaking pipe"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500 font-medium">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
              Description
            </label>
            <textarea
              rows="4"
              className={`w-full px-4 py-3 bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition`}
              placeholder="Describe the task in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500 font-medium">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Location
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 bg-gray-50 border ${errors.location ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition`}
                placeholder="Area/City"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              {errors.location && <p className="mt-1 text-xs text-red-500 font-medium">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <IndianRupee size={16} className="text-primary" />
                Base Price
              </label>
              <input
                type="number"
                className={`w-full px-4 py-3 bg-gray-50 border ${errors.basePrice ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition`}
                placeholder="₹"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              />
              {errors.basePrice && <p className="mt-1 text-xs text-red-500 font-medium">{errors.basePrice}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              Deadline
            </label>
            <input
              type="date"
              className={`w-full px-4 py-3 bg-gray-50 border ${errors.deadline ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition`}
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
            {errors.deadline && <p className="mt-1 text-xs text-red-500 font-medium">{errors.deadline}</p>}
          </div>

          <ErrorMessage message={apiError} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <Save size={20} />
                <span>{editingTask ? 'Update Task' : 'Publish Task'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostTaskPage;
