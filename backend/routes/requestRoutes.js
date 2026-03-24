const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/requestController");

router.post("/", authMiddleware, sendRequest);
router.get("/", authMiddleware, getRequests);
router.patch("/:requestId/accept", authMiddleware, acceptRequest);
router.patch("/:requestId/reject", authMiddleware, rejectRequest);

module.exports = router;
