import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  markAsRead,
  deleteAnnouncement,
  getKudos,
  sendKudos,
  likeKudos,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/kudos', getKudos);
router.post('/kudos', sendKudos);
router.put('/kudos/:id/like', likeKudos);

router.get('/', getAnnouncements);
router.post('/', authorize('manager', 'hr', 'admin'), createAnnouncement);
router.put('/:id/read', markAsRead);
router.delete('/:id', authorize('hr', 'admin'), deleteAnnouncement);

export default router;
