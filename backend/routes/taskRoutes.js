const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTask,
  getOpenTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require("../controllers/taskController");
const requestRoutes = require("./requestRoutes");

// Mount nested accept-request router
router.use("/:taskId/requests", requestRoutes);

router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getOpenTasks);
router.get("/:id", authMiddleware, getTaskById);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);
router.patch("/:id/status", authMiddleware, updateTaskStatus);

module.exports = router;
