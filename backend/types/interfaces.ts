import { Types } from 'mongoose';
import { UserRole, TaskStatus, RequestStatus, NotificationType } from './enums';

export interface IUser {
  _id?: string;
  name?: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  skills?: string | null;
  employeeId?: string;
  createdAt?: Date;
}

export interface ITask {
  _id?: string;
  customerId: string | Types.ObjectId;
  title: string;
  description: string;
  location: string;
  basePrice: number;
  deadline: Date;
  postedDate?: Date;
  status: TaskStatus;
  assignedFreelancerId?: string | Types.ObjectId | null;
  isDoneFlagged?: boolean;
}

export interface IAcceptRequest {
  _id?: string;
  taskId: string | Types.ObjectId;
  freelancerId: string | Types.ObjectId;
  topUpAmount: number;
  status: RequestStatus;
  createdAt?: Date;
}

export interface INotification {
  _id?: string;
  recipientId: string | Types.ObjectId;
  message: string;
  type: NotificationType;
  isRead: boolean;
  taskId?: string | Types.ObjectId;
  createdAt?: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface SignupDTO {
  name?: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  skills?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  role: UserRole;
}
