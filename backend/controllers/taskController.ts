import { Request, Response } from 'express';
import Task from '../models/Task';
import AcceptRequest from '../models/AcceptRequest';
import { ITask } from '../types/interfaces';
import { TaskStatus, UserRole, NotificationType } from '../types/enums';
import Notification from '../models/Notification';

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task (Customer only)
 *     description: Accessible by customers only. Creates a task with status 'open' and postedDate set to now.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location, basePrice, deadline]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const { title, description, location, basePrice, deadline } = req.body;

    if (!title || !description || !location || basePrice === undefined || !deadline) {
      return res.status(400).json({ success: false, message: "title, description, location, basePrice, and deadline are required" });
    }

    const task = await Task.create({
      customerId: req.user.userId,
      title,
      description,
      location,
      basePrice,
      deadline,
      postedDate: new Date(),
      status: TaskStatus.OPEN,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all open tasks (Freelancer only)
 *     description: Accessible by freelancers only. Returns all tasks with status 'open'.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of open tasks
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
export const getOpenTasks = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.FREELANCER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const tasks = await Task.find({ status: TaskStatus.OPEN }).populate("customerId", "name phone");

    return res.status(200).json({ success: true, data: tasks });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID (Any authenticated user)
 *     description: >
 *       Any authenticated user can access open tasks. For assigned/completed tasks,
 *       only the task owner (customer) or the assigned freelancer can access. Returns 403 otherwise.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("customerId", "name phone")
      .populate("assignedFreelancerId", "name phone");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.status === TaskStatus.ASSIGNED || task.status === TaskStatus.COMPLETED) {
      const requesterId = req.user?.userId;
      if (!requesterId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const isOwner = (task.customerId as any)._id.toString() === requesterId;
      const isAssigned = task.assignedFreelancerId && (task.assignedFreelancerId as any)._id.toString() === requesterId;

      if (!isOwner && !isAssigned) {
        return res.status(403).json({ success: false, message: "Access denied: you are not authorized to view this task" });
      }
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task (Customer only)
 *     description: Accessible by the task owner (customer) only. Task must have status 'open'.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Access denied or task not editable
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    if (task.status !== TaskStatus.OPEN) {
      return res.status(403).json({ success: false, message: "Task can only be edited when status is 'open'" });
    }

    const { title, description, location, basePrice, deadline } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (location !== undefined) task.location = location;
    if (basePrice !== undefined) task.basePrice = basePrice;
    if (deadline !== undefined) task.deadline = deadline;

    await task.save();

    return res.status(200).json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task (Customer only)
 *     description: Accessible by the task owner (customer) only. Task must have status 'open'.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Access denied or task not deletable
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    if (task.status !== TaskStatus.OPEN) {
      return res.status(403).json({ success: false, message: "Task can only be deleted when status is 'open'" });
    }

    await Task.findByIdAndDelete(req.params.id);
    await AcceptRequest.deleteMany({ taskId: req.params.id });

    return res.status(200).json({ success: true, data: { message: "Task and associated requests deleted successfully" } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Mark task as completed (Customer only)
 *     description: Accessible by the task owner (customer) only. Task must have status 'assigned'.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task marked as completed
 *       403:
 *         description: Access denied or task not in assigned state
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    if (task.status !== TaskStatus.ASSIGNED) {
      return res.status(403).json({ success: false, message: "Task can only be marked as completed when status is 'assigned'" });
    }

    task.status = TaskStatus.COMPLETED;
    await task.save();

    return res.status(200).json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/withdraw:
 *   patch:
 *     summary: Withdraw from a task (Freelancer only)
 *     description: Accessible by the assigned freelancer only. Reverts status to 'open' and clears assignedFreelancerId.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully withdrawn from task
 *       403:
 *         description: Access denied or task not assigned to requester
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const withdrawTask = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.FREELANCER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.assignedFreelancerId?.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied: you are not assigned to this task" });
    }

    if (task.status !== TaskStatus.ASSIGNED) {
      return res.status(403).json({ success: false, message: "Only assigned tasks can be withdrawn from" });
    }

    task.status = TaskStatus.OPEN;
    task.assignedFreelancerId = null;
    await task.save();

    await Notification.create({
      recipientId: task.customerId,
      message: `The assigned freelancer has withdrawn from your task: "${task.title}". It is now open again.`,
      type: NotificationType.STATUS_UPDATE,
      taskId: task._id,
    });

    return res.status(200).json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/cancel:
 *   patch:
 *     summary: Cancel a task (Customer only)
 *     description: Accessible by the task owner (customer) only. Sets status to 'cancelled'.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task cancelled successfully
 *       403:
 *         description: Access denied or task not in cancellable state
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const cancelTask = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied: you are not the owner of this task" });
    }

    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED) {
      return res.status(403).json({ success: false, message: `Task cannot be cancelled when status is '${task.status}'` });
    }

    task.status = TaskStatus.CANCELLED;
    await task.save();

    if (task.assignedFreelancerId) {
      await Notification.create({
        recipientId: task.assignedFreelancerId,
        message: `The customer has cancelled the task: "${task.title}".`,
        type: NotificationType.STATUS_UPDATE,
        taskId: task._id,
      });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/flag-done:
 *   patch:
 *     summary: Flag task as done (Freelancer only)
 *     description: Accessible by the assigned freelancer only. Sets isDoneFlagged to true and status to 'pending'.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task flagged as done
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const flagTaskAsDone = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.FREELANCER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.assignedFreelancerId?.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied: you are not assigned to this task" });
    }

    if (task.status !== TaskStatus.ASSIGNED) {
      return res.status(403).json({ success: false, message: "Only assigned tasks can be flagged as done" });
    }

    task.isDoneFlagged = true;
    task.status = TaskStatus.PENDING;
    await task.save();

    await Notification.create({
      recipientId: task.customerId,
      message: `Freelancer has completed the work for task: "${task.title}". Please confirm completion.`,
      type: NotificationType.STATUS_UPDATE,
      taskId: task._id,
    });

    return res.status(200).json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/confirm-completion:
 *   patch:
 *     summary: Confirm task completion (Customer only)
 *     description: Accessible by the task owner (customer) only. Sets status to 'completed'.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task completion confirmed
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const confirmTaskCompletion = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied: you are not the owner of this task" });
    }

    if (task.status !== TaskStatus.PENDING) {
      return res.status(403).json({ success: false, message: "Task completion can only be confirmed when status is 'pending'" });
    }

    task.status = TaskStatus.COMPLETED;
    await task.save();

    await Notification.create({
      recipientId: task.assignedFreelancerId,
      message: `The customer has confirmed your work and finalized task: "${task.title}".`,
      type: NotificationType.STATUS_UPDATE,
      taskId: task._id,
    });

    return res.status(200).json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyTasks = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const tasks = await Task.find({ customerId: req.user.userId }).sort({ postedDate: -1 });

    return res.status(200).json({ success: true, data: tasks });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/freelancer-tasks:
 *   get:
 *     summary: Get tasks assigned to the current freelancer
 *     description: Accessible by freelancers only. Returns all tasks where assignedFreelancerId matches the logged-in user.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks for the freelancer
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
export const getFreelancerTasks = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.FREELANCER) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const tasks = await Task.find({ assignedFreelancerId: req.user.userId })
      .populate("customerId", "name phone")
      .sort({ postedDate: -1 });

    return res.status(200).json({ success: true, data: tasks });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
