import express from 'express';
import {
  getUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  getAuditLogs,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/audit-logs', authorize('admin', 'hr'), getAuditLogs);
router.use(authorize('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', toggleUserStatus);

export default router;
