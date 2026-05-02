import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponseSchema, LoginResponseSchema, TaskSchema, AcceptRequestSchema, NotificationSchema } from '@/types/schemas';
import { z } from 'zod';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Mapping of partial URLs to their corresponding data schemas
const schemaMap: Record<string, z.ZodSchema> = {
  '/auth/login': LoginResponseSchema,
  '/auth/signup': LoginResponseSchema,
  '/tasks/my-requests': z.array(AcceptRequestSchema),
  '/tasks/received-requests': z.array(AcceptRequestSchema),
  '/tasks/freelancer-tasks': z.array(TaskSchema),
  '/tasks/my-tasks': z.array(TaskSchema),
  '/tasks': z.union([TaskSchema, z.array(TaskSchema)]),
  '/notifications/unread-count': z.number(),
  '/notifications': z.union([NotificationSchema, z.array(NotificationSchema)]),
};

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for Zod validation
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { url } = response.config;
    const data = response.data;

    // 1. Validate basic API envelope
    const envelopeResult = ApiResponseSchema.safeParse(data);
    if (!envelopeResult.success) {
      console.warn('[Zod] Invalid API envelope:', envelopeResult.error.format());
      return response;
    }

    // 2. Validate specific data if mapping exists
    if (url && data.success && data.data) {
      const match = Object.keys(schemaMap).find(key => url.includes(key));
      if (match) {
        const schema = schemaMap[match];
        const result = schema.safeParse(data.data);
        if (!result.success) {
          console.error(`[Zod] Validation failed for ${url}:`, result.error.format());
          // We log the error but return the response to avoid breaking the UI
          // In a strict mode, we could throw or reject here.
        } else {
          console.log(`[Zod] ${url} validated successfully.`);
        }
      }
    }

    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
