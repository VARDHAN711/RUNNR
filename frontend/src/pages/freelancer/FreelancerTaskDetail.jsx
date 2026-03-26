import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, Calendar, MapPin, IndianRupee, Clock, Send, CheckCircle, Info, Loader2, Phone } from 'lucide-react';

const FreelancerTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [topUpAmount, setTopUpAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  useEffect(() => {
    const fetchTaskAndRequests = async () => {
      try {
        const [taskRes, myReqRes] = await Promise.all([
          axiosInstance.get(`/tasks/${id}`),
          axiosInstance.get(`/tasks/${id}/requests/my-request`)
        ]);
        setTask(taskRes.data.data);
        
        const myReq = myReqRes.data.data;
        if (myReq) {
          setRequestSent(true);
          setRequests([myReq]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch task details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTaskAndRequests();
  }, [id]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    const amount = Number(topUpAmount) || 0;
    
    if (amount < 0 || amount > 200) {
      setFeedback({ type: 'error', msg: 'Top-up must be between 0 and ₹200' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', msg: '' });
    try {
      await axiosInstance.post(`/tasks/${id}/requests`, { topUpAmount: amount });
      setRequestSent(true);
      setFeedback({ type: 'success', msg: 'Request sent successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Failed to send request.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!task) return <ErrorMessage message="Task not found" />;

  const acceptedRequest = requests.find(r => r.status === 'accepted');
  const isAssignedOrCompleted = ['assigned', 'completed'].includes(task.status);

  const base = task.basePrice || 0;
  const topUp = Number(topUpAmount) || 0;
  const total = base + topUp;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft size={18} />
        <span>Back to Find Work</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-left">
        <div className="p-8 border-b border-gray-50">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{task.title}</h1>
            <StatusBadge status={task.status} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Location</span>
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <MapPin size={18} className="text-primary" />
                <span>{task.location}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Deadline</span>
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Calendar size={18} className="text-primary" />
                <span>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </div>
             <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">
                {acceptedRequest ? 'Final Bid' : 'Base Price'}
              </span>
              <div className="flex items-center gap-2 text-gray-700 font-extrabold text-xl">
                <IndianRupee size={22} className="text-primary" />
                <span>{acceptedRequest ? task.basePrice + acceptedRequest.topUpAmount : task.basePrice}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Posted</span>
              <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                <Clock size={16} className="text-primary" />
                <span>{new Date(task.postedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Task Description</h3>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed border-l-4 border-gray-100 pl-4 py-1 italic mb-8">
            "{task.description}"
          </p>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider text-gray-400">
              Customer Details
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold shadow-sm border border-gray-100">
                {task.customerId?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <p className="font-bold text-gray-900">{task.customerId?.name}</p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Phone size={14} />
                  <span>{task.customerId?.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
          {task.status === 'open' ? (
            requestSent ? (
              <div className="bg-green-50 p-6 rounded-2xl border border-green-200 flex flex-col items-center text-center">
                <CheckCircle size={48} className="text-green-500 mb-3" />
                <h3 className="text-xl font-bold text-green-900">Request already sent</h3>
                <p className="text-green-700 mt-1">Wait for the customer to review and accept your bid.</p>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Top-up amount</label>
                      <span className="text-xs text-gray-400 font-medium">Max: ₹200</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 border-r pr-3"><IndianRupee size={18} /></span>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        className="w-full pl-14 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition text-lg font-bold"
                        placeholder="Top-up amount (max ₹200)"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-inner space-y-3">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Base Price</span>
                      <span>₹{base}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Top-up requested</span>
                      <span className="text-indigo-600">+ ₹{topUp}</span>
                    </div>
                    <div className="pt-3 border-t flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Bid Price</span>
                      <span className="text-2xl font-black text-primary">₹{total}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center animate-pulse pt-2">
                      Base ₹{base} + Top-up ₹{topUp} = Total ₹{total}
                    </p>
                  </div>

                  {feedback.msg && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {feedback.msg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-primary-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        <Send size={20} />
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )
          ) : (
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 flex flex-col items-center text-center">
              <Info size={40} className="text-blue-500 mb-3" />
              <h3 className="text-xl font-bold text-blue-900">Task {task.status === 'completed' ? 'Completed' : 'Assigned'}</h3>
              <p className="text-blue-700 mt-1">This task is already being handled.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerTaskDetail;
