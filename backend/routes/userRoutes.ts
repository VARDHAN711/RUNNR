import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

export default router;
