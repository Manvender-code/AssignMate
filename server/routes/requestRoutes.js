import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import { requestTask, incomingRequests, decideRequest } from '../controllers/requestsController.js'

const router = Router()

router.post('/', authenticate, requireRole('freelancer'), requestTask)
router.get('/incoming', authenticate, requireRole('provider'), incomingRequests)
router.post('/:id/decision', authenticate, requireRole('provider'), decideRequest)

export default router
