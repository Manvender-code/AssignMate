import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import { createTask, listOpenTasks, myCreatedTasks, myAssignedTasks, completeTask, failTask } from '../controllers/tasksController.js'

const router = Router()

router.get('/', authenticate, listOpenTasks)
router.post('/', authenticate, requireRole('provider'), createTask)
router.get('/mine', authenticate, requireRole('provider'), myCreatedTasks)
router.get('/assigned/mine', authenticate, requireRole('freelancer'), myAssignedTasks)
router.post('/:id/complete', authenticate, requireRole('provider'), completeTask)
router.post('/:id/fail', authenticate, requireRole('provider'), failTask)

export default router
