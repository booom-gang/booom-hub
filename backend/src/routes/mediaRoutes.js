import { Router } from 'express';
import { createPresignedUrl, createGalleryItem, getGallery, deleteGalleryItem, cleanupR2ByKey, deleteAllVideos } from '../controllers/mediaController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { presignedUrlLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/presigned-url', authMiddleware, presignedUrlLimiter, createPresignedUrl);
router.post('/gallery', authMiddleware, createGalleryItem);
router.get('/gallery', authMiddleware, getGallery);
router.delete('/gallery/:id', authMiddleware, deleteGalleryItem);
router.post('/cleanup-r2', authMiddleware, cleanupR2ByKey);
router.post('/delete-all-videos', authMiddleware, deleteAllVideos);

export default router;
