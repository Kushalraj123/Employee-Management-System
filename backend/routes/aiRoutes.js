import express from 'express';
import { chatWithAgent, executeAction, getCapabilities, getInsights } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// AI Agent routes with authentication
router.post('/chat', protect, chatWithAgent);
router.post('/action', protect, executeAction);
router.get('/capabilities', protect, getCapabilities);
router.get('/insights', protect, getInsights);

// Also expose public capabilities endpoint for health check
router.get('/public-status', (req, res) => {
  res.json({
    status: 'online',
    agent: 'NEXUS Autonomous HR Intelligence',
    version: '2.5',
    activePersonas: 4,
    toolsRegistered: 11,
  });
});

export default router;
