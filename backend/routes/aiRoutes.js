import express from 'express';
import {
  chatWithAgent,
  executeAction,
  getCapabilities,
  getInsights,
  getWorkforceAnalytics,
  generateAIReport,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// AI Agent routes with authentication
router.post('/chat', protect, chatWithAgent);
router.post('/action', protect, executeAction);
router.get('/capabilities', protect, getCapabilities);
router.get('/insights', protect, getInsights);
router.get('/workforce-analytics', protect, getWorkforceAnalytics);
router.post('/generate-report', protect, generateAIReport);

// Public capabilities endpoint for health check
router.get('/public-status', (req, res) => {
  res.json({
    status: 'online',
    agent: 'NEXUS Autonomous HR Intelligence',
    version: '3.0',
    activePersonas: 4,
    toolsRegistered: 11,
  });
});

export default router;
