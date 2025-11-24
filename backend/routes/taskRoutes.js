import express from 'express';
import { createTask, getOpenTasks, requestTask, completeTask, rateFreelancer } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getOpenTasks);

router.post('/:id/request', protect, requestTask);
router.put('/:id/complete', protect, completeTask);
router.post('/:id/rate', protect, rateFreelancer);

export default router;