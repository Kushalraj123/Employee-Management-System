import express from 'express';
import {
  getJobOpenings,
  createJobOpening,
  updateJobStatus,
  getCandidates,
  createCandidate,
  updateCandidateStage,
  addInterviewFeedback,
  screenResumeAI,
  getRecruitmentAnalytics,
} from '../controllers/recruitmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Job Openings
router.get('/jobs', getJobOpenings);
router.post('/jobs', authorize('hr', 'admin', 'manager'), createJobOpening);
router.put('/jobs/:id/status', authorize('hr', 'admin', 'manager'), updateJobStatus);

// Candidates & Kanban Pipeline
router.get('/candidates', getCandidates);
router.post('/candidates', authorize('hr', 'admin', 'manager'), createCandidate);
router.put('/candidates/:id/stage', authorize('hr', 'admin', 'manager'), updateCandidateStage);
router.post('/candidates/:id/interviews', authorize('hr', 'admin', 'manager'), addInterviewFeedback);

// AI Resume Screening & Recruitment Analytics
router.post('/ai-screen', screenResumeAI);
router.get('/analytics', getRecruitmentAnalytics);

export default router;

