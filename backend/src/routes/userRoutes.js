import { Router } from 'express';
import { getAllUsers, getMe, updateMe, deleteMe, deleteProfilePicture } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getAllUsers);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);
router.delete('/me', authMiddleware, deleteMe);
router.delete('/me/profile-picture', authMiddleware, deleteProfilePicture);

export default router;
