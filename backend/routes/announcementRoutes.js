import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  markAsRead,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('hr', 'admin'), createAnnouncement);
router.put('/:id/read', markAsRead);
router.delete('/:id', authorize('hr', 'admin'), deleteAnnouncement);

export default router;
