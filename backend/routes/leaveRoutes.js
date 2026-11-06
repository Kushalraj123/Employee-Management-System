import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getMyBalance,
  getAllLeaves,
  reviewLeave,
  getTeamLeaveCalendar,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/apply', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/my-balance', getMyBalance);
router.get('/calendar', getTeamLeaveCalendar);
router.get('/all', authorize('manager', 'hr', 'admin'), getAllLeaves);
router.put('/review/:id', authorize('manager', 'hr', 'admin'), reviewLeave);

export default router;
