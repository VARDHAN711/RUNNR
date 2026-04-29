import { UserRole, TaskStatus, RequestStatus } from './enums';

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
  customerId: string;
  title: string;
  description: string;
  location: string;
  basePrice: number;
  deadline: Date;
  postedDate?: Date;
  status: TaskStatus;
  assignedFreelancerId?: string | null;
}

export interface IAcceptRequest {
  _id?: string;
  taskId: string;
  freelancerId: string;
  topUpAmount: number;
  status: RequestStatus;
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
}
