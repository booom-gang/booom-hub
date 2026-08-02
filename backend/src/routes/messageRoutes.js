import { Router } from 'express';
import { getMessages, deleteMessage } from '../controllers/messageController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getMessages);
router.delete('/:id', authMiddleware, deleteMessage);

export default router;
