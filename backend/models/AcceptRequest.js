const mongoose = require("mongoose");

const acceptRequestSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: [true, "Task ID is required"],
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Freelancer ID is required"],
  },
  topUpAmount: {
    type: Number,
    default: 0,
    min: [0, "Top-up amount cannot be negative"],
    max: [200, "Top-up amount cannot exceed 200"],
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AcceptRequest", acceptRequestSchema);
