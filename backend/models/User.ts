import mongoose, { Schema, model, Document } from 'mongoose';
import { IUser } from '../types/interfaces';
import { UserRole } from '../types/enums';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: [true, "Role is required"],
  },
  skills: {
    type: String,
    default: null,
  },
  employeeId: {
    type: String,
    required: false,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<IUser>("User", userSchema);
