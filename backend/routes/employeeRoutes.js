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

const router = express.Router();

router.get('/stats', getStats);
router.get('/employees', getEmployees);
router.get('/employees/:id', getEmployeeById);
router.post('/employees', createEmployee);
router.post('/employees/bulk-delete', bulkDeleteEmployees);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

export default router;
