const Task = require("../models/Task");

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
const createTask = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
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
      status: "open",
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
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
const getOpenTasks = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const tasks = await Task.find({ status: "open" }).populate("customerId", "name phone");

    return res.status(200).json({ success: true, data: tasks });
  } catch (err) {
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
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("customerId", "name phone")
      .populate("assignedFreelancerId", "name phone");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.status === "assigned" || task.status === "completed") {
      const requesterId = req.user.userId.toString();
      const isOwner = task.customerId._id.toString() === requesterId;
      const isAssigned = task.assignedFreelancerId && task.assignedFreelancerId._id.toString() === requesterId;

      if (!isOwner && !isAssigned) {
        return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
      }
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
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
const updateTask = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    if (task.status !== "open") {
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
  } catch (err) {
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
const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    if (task.status !== "open") {
      return res.status(403).json({ success: false, message: "Task can only be deleted when status is 'open'" });
    }

    await Task.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, data: { message: "Task deleted successfully" } });
  } catch (err) {
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
const updateTaskStatus = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    if (task.status !== "assigned") {
      return res.status(403).json({ success: false, message: "Task can only be marked as completed when status is 'assigned'" });
    }

    task.status = "completed";
    await task.save();

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createTask, getOpenTasks, getTaskById, updateTask, deleteTask, updateTaskStatus };
