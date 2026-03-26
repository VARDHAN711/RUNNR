import React from 'react';
import { Calendar, MapPin, IndianRupee, Eye, Trash2, Edit2, Users } from 'lucide-react';
import StatusBadge from './StatusBadge';

const TaskCard = ({ task, role, onEdit, onDelete, onViewRequests, onViewDetail, requests = [] }) => {
  const isCustomer = role === 'customer';
  const isFreelancer = role === 'freelancer';
  const isOpen = task.status === 'open';
  const isAssignedOrCompleted = ['assigned', 'completed'].includes(task.status);

  const acceptedRequest = isAssignedOrCompleted && requests.find(r => 
    r.taskId?._id === task._id && r.status === 'accepted'
  );

  const hasRequested = isFreelancer && requests.some(r => 
    (r.taskId?._id || r.taskId) === task._id
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{task.title}</h3>
          {hasRequested && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider w-fit">
              Requested
            </span>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center text-gray-500 text-sm gap-2">
          <MapPin size={16} className="text-primary" />
          <span>{task.location}</span>
        </div>
        <div className="flex items-center text-gray-400 text-sm gap-2">
          <Calendar size={16} />
          <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-gray-900 font-semibold gap-1 mt-2">
          <IndianRupee size={16} />
          <span>
            {acceptedRequest ? (
              <span className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Final Bid</span>
                <span>{acceptedRequest.taskId.basePrice + acceptedRequest.topUpAmount}</span>
              </span>
            ) : (
              <span className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5 text-left">Base Price</span>
                <span>{task.basePrice}</span>
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
        {isCustomer ? (
          <>
            <button
              onClick={() => onViewDetail(task._id)}
              className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <Eye size={16} />
              <span>Detail</span>
            </button>

            {isOpen && (
              <>
                <button
                  onClick={() => onViewRequests(task._id)}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition shadow-sm"
                >
                  <Users size={16} />
                  <span>Requests</span>
                </button>
                <div className="flex gap-2 w-full mt-1">
                  <button
                    onClick={() => onEdit(task)}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(task._id)}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <button
            onClick={() => onViewDetail(task._id)}
            className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition shadow-sm"
          >
            <Eye size={18} />
            <span>View Detail</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
