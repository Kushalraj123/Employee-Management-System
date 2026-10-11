import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDepartments);
router.post('/', authorize('admin', 'hr'), createDepartment);
router.put('/:id', authorize('admin', 'hr'), updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);

export default router;
