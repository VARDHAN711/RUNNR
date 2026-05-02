import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import {
  createTask,
  getOpenTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getMyTasks,
  getFreelancerTasks,
  withdrawTask,
  cancelTask,
  flagTaskAsDone,
  confirmTaskCompletion,
} from '../controllers/taskController';
import {
  getFreelancerRequests,
  getCustomerReceivedRequests,
} from '../controllers/requestController';
import requestRoutes from './requestRoutes';

const router = Router();

// ✅ Static routes first
router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getOpenTasks);
router.get("/my-tasks", authMiddleware, getMyTasks);
router.get("/freelancer-tasks", authMiddleware, getFreelancerTasks);

/**
 * @swagger
 * /api/tasks/my-requests:
 *   get:
 *     summary: Get all requests made by the current freelancer
 *     description: Accessible by freelancers only. Returns all requests where freelancerId matches the logged-in user.
 *     tags: [Accept Requests]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of requests for the freelancer
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get("/my-requests", authMiddleware, getFreelancerRequests);

/**
 * @swagger
 * /api/tasks/received-requests:
 *   get:
 *     summary: Get all requests received by the current customer for their tasks
 *     description: Accessible by customers only. Returns all requests for tasks where customerId matches the logged-in user.
 *     tags: [Accept Requests]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of received requests for the customer
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get("/received-requests", authMiddleware, getCustomerReceivedRequests);

router.get("/:id", authMiddleware, getTaskById);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);
router.patch("/:id/status", authMiddleware, updateTaskStatus);
router.patch("/:id/withdraw", authMiddleware, withdrawTask);
router.patch("/:id/cancel", authMiddleware, cancelTask);
router.patch("/:id/flag-done", authMiddleware, flagTaskAsDone);
router.patch("/:id/confirm-completion", authMiddleware, confirmTaskCompletion);

// ✅ Nested dynamic router last
router.use("/:taskId/requests", requestRoutes);

export default router;
