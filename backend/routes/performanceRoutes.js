import express from 'express';
import {
  getReviews,
  createReview,
  getGoals,
  createGoal,
  updateGoal,
} from '../controllers/performanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/reviews', getReviews);
router.post('/reviews', authorize('hr', 'admin'), createReview);
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.put('/goals/:id', updateGoal);

export default router;
