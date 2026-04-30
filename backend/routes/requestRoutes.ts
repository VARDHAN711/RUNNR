import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import {
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  getMyRequest,
} from '../controllers/requestController';

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, sendRequest);
router.get("/", authMiddleware, getRequests);
router.patch("/:requestId/accept", authMiddleware, acceptRequest);
router.patch("/:requestId/reject", authMiddleware, rejectRequest);
router.get("/my-request", authMiddleware, getMyRequest);

export default router;
