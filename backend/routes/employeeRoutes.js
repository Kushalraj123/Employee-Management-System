import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkDeleteEmployees,
  getStats,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Everything requires a logged-in user
router.use(protect);

router.get('/stats', getStats);
router.get('/employees', getEmployees);
router.get('/employees/:id', getEmployeeById);

// Only HR and Admin may modify the workforce directory
router.post('/employees', authorize('hr', 'admin'), createEmployee);
router.post('/employees/bulk-delete', authorize('hr', 'admin'), bulkDeleteEmployees);
router.put('/employees/:id', authorize('hr', 'admin'), updateEmployee);
router.delete('/employees/:id', authorize('hr', 'admin'), deleteEmployee);

export default router;
