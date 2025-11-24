import express from 'express';
import { getDashboardStats, getDashboardTasks } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/tasks', protect, getDashboardTasks);

export default router;