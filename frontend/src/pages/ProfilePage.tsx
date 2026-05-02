import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';
import { IUser, UserRole } from '@/types';
import { ProfileUpdateSchema } from '@/types/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, Mail, Award, Save, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(ProfileUpdateSchema)
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/users/profile');
      const userData = res.data.data;
      setProfile(userData);
      setValue('name', userData.name || '');
      setValue('phone', userData.phone || '');
      setValue('skills', userData.skills || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.patch('/users/profile', data);
      setProfile(res.data.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary/5 px-8 py-10 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold">
              {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.name || 'Your Profile'}</h1>
              <p className="text-gray-500 flex items-center gap-1.5 mt-1 capitalize">
                <Award size={16} className="text-primary" />
                {profile?.role} Account
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ErrorMessage message={error} />
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 animate-in fade-in slide-in-from-top-1">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('name')}
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.name ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary/10'} rounded-xl focus:outline-none focus:border-primary transition-all`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.name.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1 italic">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary/10'} rounded-xl focus:outline-none focus:border-primary transition-all`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.phone.message as string}</p>}
              </div>

              {profile?.role === UserRole.FREELANCER && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skills & Expertise</label>
                  <div className="relative">
                    <Award size={18} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      {...register('skills')}
                      rows={3}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.skills ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary/10'} rounded-xl focus:outline-none focus:border-primary transition-all resize-none`}
                      placeholder="List your skills (e.g. Plumbing, Cleaning, Moving)"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">Describe what you can do for customers</p>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
