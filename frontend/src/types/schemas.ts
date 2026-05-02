import { z } from 'zod';
import { UserRole, TaskStatus, NotificationType } from './index';

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  role: z.nativeEnum(UserRole),
  skills: z.string().nullable().optional(),
  employeeId: z.string().optional(),
  createdAt: z.string().optional(),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  role: z.nativeEnum(UserRole),
  userId: z.string(),
});

export const TaskSchema = z.object({
  _id: z.string(),
  customerId: z.union([z.string(), z.object({
    _id: z.string(),
    name: z.string(),
    phone: z.string(),
  })]),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  basePrice: z.number(),
  deadline: z.string(),
  postedDate: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  assignedFreelancerId: z.union([z.string(), z.object({
    _id: z.string(),
    name: z.string(),
    phone: z.string(),
  })]).nullable().optional(),
  isDoneFlagged: z.boolean().optional(),
});

export const AcceptRequestSchema = z.object({
  _id: z.string(),
  taskId: z.union([z.string(), z.object({
    _id: z.string(),
    title: z.string(),
    basePrice: z.number(),
  })]).nullable(),
  freelancerId: z.union([z.string(), z.object({
    _id: z.string(),
    name: z.string(),
    phone: z.string(),
    skills: z.string().nullable().optional(),
  })]),
  topUpAmount: z.number(),
  status: z.string(), // Could use nativeEnum(RequestStatus)
  createdAt: z.string().optional(),
});

export const NotificationSchema = z.object({
  _id: z.string(),
  recipientId: z.string(),
  message: z.string(),
  type: z.nativeEnum(NotificationType),
  isRead: z.boolean(),
  taskId: z.string().optional(),
  createdAt: z.string().optional(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  skills: z.string().nullable().optional(),
});
