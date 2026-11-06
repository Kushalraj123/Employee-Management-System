import express from 'express';
import {
  getEmployees,
  getOrgNetworkData,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  addEmployeeDocument,
  deleteEmployeeDocument,
  deleteEmployee,
  bulkDeleteEmployees,
  getStats,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/stats', getStats);
router.get('/org-network', protect, getOrgNetworkData);

router.get('/employees', protect, getEmployees);
router.get('/employees/:id', protect, getEmployeeById);

// Write endpoints protected for HR, Manager, and Admin
router.post('/employees', protect, authorize('hr', 'admin'), createEmployee);
router.post('/employees/bulk-delete', protect, authorize('hr', 'admin'), bulkDeleteEmployees);
router.put('/employees/:id', protect, authorize('hr', 'admin', 'manager'), updateEmployee);
router.post('/employees/:id/documents', protect, authorize('hr', 'admin', 'manager'), addEmployeeDocument);
router.delete('/employees/:id/documents/:docId', protect, authorize('hr', 'admin'), deleteEmployeeDocument);
router.delete('/employees/:id', protect, authorize('hr', 'admin'), deleteEmployee);

export default router;
