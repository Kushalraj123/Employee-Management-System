import express from 'express';
import { getReportSummary } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('hr', 'admin'));

router.get('/summary', getReportSummary);

export default router;
