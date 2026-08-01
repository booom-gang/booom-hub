import { Router } from 'express';
import { getAllUsers, getMe, updateMe } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getAllUsers);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);

export default router;
