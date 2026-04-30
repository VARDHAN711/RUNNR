import mongoose, { Schema, model } from 'mongoose';
import { IAcceptRequest } from '../types/interfaces';
import { RequestStatus } from '../types/enums';

const acceptRequestSchema = new Schema<IAcceptRequest>({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: [true, "Task ID is required"],
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Freelancer ID is required"],
  },
  topUpAmount: {
    type: Number,
    default: 0,
    min: [0, "Top-up amount cannot be negative"],
    max: [200, "Top-up amount cannot exceed 200"],
  },
  status: {
    type: String,
    enum: Object.values(RequestStatus),
    default: RequestStatus.PENDING,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<IAcceptRequest>("AcceptRequest", acceptRequestSchema);
