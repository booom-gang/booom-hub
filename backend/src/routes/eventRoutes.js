import { Router } from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getEvents);
router.post('/', authMiddleware, createEvent);
router.patch('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

export default router;
