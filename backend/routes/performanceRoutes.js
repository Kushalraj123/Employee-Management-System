import express from 'express';
import {
  getReviews,
  createReview,
  getGoals,
  createGoal,
  updateGoal,
  submitSelfAssessment,
  updateSkillMatrix,
  getPerformanceAnalytics,
} from '../controllers/performanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/reviews', getReviews);
router.post('/reviews', authorize('manager', 'hr', 'admin'), createReview);
router.post('/self-assessment', submitSelfAssessment);
router.put('/skills/:employeeId', updateSkillMatrix);
router.get('/analytics', getPerformanceAnalytics);
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.put('/goals/:id', updateGoal);

export default router;
