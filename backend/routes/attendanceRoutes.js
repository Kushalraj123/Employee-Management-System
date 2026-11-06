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
  getHolidays,
  addHoliday,
  regularizeAttendance,
  approveAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.post('/reset-today', resetTodayAttendance);
router.post('/regularize', regularizeAttendance);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyHistory);
router.get('/holidays', getHolidays);
router.post('/holidays', authorize('hr', 'admin'), addHoliday);
router.get('/all', authorize('manager', 'hr', 'admin'), getAllAttendance);
router.put('/approve/:id', authorize('manager', 'hr', 'admin'), approveAttendance);
router.get('/policy', getPolicy);
router.put('/policy', authorize('hr', 'admin'), updatePolicy);
router.post('/cutoff-run', authorize('hr', 'admin'), runCutoffEvaluation);

export default router;
