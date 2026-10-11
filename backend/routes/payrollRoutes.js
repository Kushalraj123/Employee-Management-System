import express from 'express';
import {
  generatePayroll,
  getAllPayrolls,
  getMySalarySlips,
  getSalarySlipById,
  updatePayrollStatus,
  getPayrollStats,
} from '../controllers/payrollController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Employee routes
router.get('/my-slips', getMySalarySlips);
router.get('/slips/:id', getSalarySlipById);

// HR / Admin routes
router.get('/list', authorize('hr', 'admin'), getAllPayrolls);
router.post('/generate', authorize('hr', 'admin'), generatePayroll);
router.put('/status/:id', authorize('hr', 'admin'), updatePayrollStatus);
router.get('/stats', authorize('hr', 'admin'), getPayrollStats);

export default router;
