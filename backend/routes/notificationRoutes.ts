import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead } from '../controllers/notificationController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);

export default router;
