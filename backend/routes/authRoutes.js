import express from 'express';
import { login, demoLogin, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);

export default router;
