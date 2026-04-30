export enum UserRole {
  CUSTOMER = 'customer',
  FREELANCER = 'freelancer',
}

export enum TaskStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  COMPLETED = 'completed',
}

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  phone: string;
  role: UserRole;
  skills?: string | null;
  employeeId?: string;
  createdAt?: string;
}

export interface ITask {
  _id: string;
  customerId: string;
  title: string;
  description: string;
  location: string;
  basePrice: number;
  deadline: string; // ISO date string
  postedDate?: string;
  status: TaskStatus;
  assignedFreelancerId?: string | null;
}

export interface IAcceptRequest {
  _id: string;
  taskId: string | Pick<ITask, '_id' | 'title' | 'basePrice'>;
  freelancerId: string;
  topUpAmount: number;
  status: RequestStatus;
  createdAt?: string;
}

export interface AuthUser {
  _id: string;
  name?: string;
  email: string;
  role: UserRole;
}

/**
 * Enriched AcceptRequest returned by endpoints like /tasks/:id/requests
 * and /tasks/received-requests. freelancerId is populated by the backend,
 * and totalPrice / basePrice are computed fields.
 */
export interface PopulatedAcceptRequest extends Omit<IAcceptRequest, 'freelancerId'> {
  freelancerId: Pick<IUser, '_id' | 'name' | 'phone' | 'skills'>;
  totalPrice?: number;
  basePrice?: number;
}

/**
 * Enriched Task returned by the freelancer task-detail endpoint.
 * customerId is populated with basic user info by the backend.
 */
export interface PopulatedTask extends Omit<ITask, 'customerId'> {
  customerId: Pick<IUser, '_id' | 'name' | 'phone'>;
}
