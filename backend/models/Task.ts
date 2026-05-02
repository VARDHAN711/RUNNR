import mongoose, { Schema, model } from 'mongoose';
import { ITask } from '../types/interfaces';
import { TaskStatus } from '../types/enums';

const taskSchema = new Schema<ITask>({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Customer ID is required"],
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  basePrice: {
    type: Number,
    required: [true, "Base price is required"],
    min: [0, "Base price cannot be negative"],
  },
  deadline: {
    type: Date,
    required: [true, "Deadline is required"],
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.OPEN,
  },
  assignedFreelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  isDoneFlagged: {
    type: Boolean,
    default: false,
  },
});

export default model<ITask>("Task", taskSchema);
