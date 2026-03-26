const AcceptRequest = require("../models/AcceptRequest");
const Task = require("../models/Task");

/**
 * @swagger
 * /api/tasks/{taskId}/requests:
 *   post:
 *     summary: Send an accept request (Freelancer only)
 *     description: >
 *       Accessible by freelancers only. Task must be open, freelancer must not have
 *       already sent a request, and topUpAmount must be between 0 and 200.
 *     tags: [Accept Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topUpAmount:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 200
 *                 default: 0
 *     responses:
 *       201:
 *         description: Accept request sent successfully
 *       400:
 *         description: Validation error (task not open, duplicate request, invalid topUpAmount)
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
const sendRequest = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const { taskId } = req.params;
    const { topUpAmount = 0 } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.status !== "open") {
      return res.status(400).json({ success: false, message: "Task is no longer open for requests" });
    }

    const duplicate = await AcceptRequest.findOne({ taskId, freelancerId: req.user.userId });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "You have already sent a request for this task" });
    }

    if (topUpAmount < 0 || topUpAmount > 200) {
      return res.status(400).json({ success: false, message: "topUpAmount must be between 0 and 200" });
    }

    const request = await AcceptRequest.create({
      taskId,
      freelancerId: req.user.userId,
      topUpAmount,
    });

    return res.status(201).json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{taskId}/requests:
 *   get:
 *     summary: Get all accept requests for a task (Customer only)
 *     description: >
 *       Accessible by the task owner (customer) only. Returns each request with
 *       freelancer name and phone, basePrice, topUpAmount, and computed totalPrice.
 *     tags: [Accept Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of accept requests with totalPrice
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
const getRequests = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const requests = await AcceptRequest.find({ taskId }).populate("freelancerId", "name phone skills");

    const data = requests.map((r) => ({
      _id: r._id,
      status: r.status,
      topUpAmount: r.topUpAmount,
      basePrice: task.basePrice,
      totalPrice: task.basePrice + r.topUpAmount,
      freelancerId: r.freelancerId,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{taskId}/requests/{requestId}/accept:
 *   patch:
 *     summary: Accept a specific request (Customer only)
 *     description: >
 *       Accessible by the task owner (customer) only. Accepts the specified request,
 *       rejects all other pending requests for the same task, sets task status to
 *       'assigned', and sets assignedFreelancerId.
 *     tags: [Accept Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request accepted, task assigned
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task or request not found
 *       500:
 *         description: Server error
 */
const acceptRequest = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const { taskId, requestId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const request = await AcceptRequest.findById(requestId);
    if (!request || request.taskId.toString() !== taskId) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Accept the specified request
    request.status = "accepted";
    await request.save();

    // Reject all other pending requests for this task
    await AcceptRequest.updateMany(
      { taskId, _id: { $ne: requestId }, status: "pending" },
      { status: "rejected" }
    );

    // Update task — assign freelancer and set status
    task.status = "assigned";
    task.assignedFreelancerId = request.freelancerId;
    await task.save();

    return res.status(200).json({ success: true, data: { request, task } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/tasks/{taskId}/requests/{requestId}/reject:
 *   patch:
 *     summary: Reject a specific request (Customer only)
 *     description: Accessible by the task owner (customer) only. Sets the specific request status to 'rejected'.
 *     tags: [Accept Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request rejected
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task or request not found
 *       500:
 *         description: Server error
 */
const rejectRequest = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const { taskId, requestId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.customerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const request = await AcceptRequest.findById(requestId);
    if (!request || request.taskId.toString() !== taskId) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    return res.status(200).json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMyRequest = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const { taskId } = req.params;
    const request = await AcceptRequest.findOne({ taskId, freelancerId: req.user.userId });

    return res.status(200).json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getFreelancerRequests = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    const requests = await AcceptRequest.find({ freelancerId: req.user.userId }).populate("taskId");

    return res.status(200).json({ success: true, data: requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCustomerReceivedRequests = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }

    // Find all tasks owned by this customer
    const userTasks = await Task.find({ customerId: req.user.userId });
    const taskIds = userTasks.map(t => t._id);

    // Find all requests for these tasks
    const requests = await AcceptRequest.find({ taskId: { $in: taskIds } }).populate("taskId").populate("freelancerId", "name phone skills");

    return res.status(200).json({ success: true, data: requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendRequest, getRequests, acceptRequest, rejectRequest, getMyRequest, getFreelancerRequests, getCustomerReceivedRequests };
