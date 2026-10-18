import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getAllAttendance,
  getPolicy,
  updatePolicy,
  runCutoffEvaluation,
  resetTodayAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.post('/reset-today', resetTodayAttendance);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyHistory);
router.get('/all', authorize('hr', 'admin'), getAllAttendance);
router.get('/policy', getPolicy);
router.put('/policy', authorize('hr', 'admin'), updatePolicy);
router.post('/cutoff-run', authorize('hr', 'admin'), runCutoffEvaluation);

export default router;
