import { z } from 'zod';
import { UserRole, TaskStatus } from './index';

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
  assignedFreelancerId: z.string().nullable().optional(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});
