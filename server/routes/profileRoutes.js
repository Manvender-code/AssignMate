import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import { myProviderProfile, myFreelancerProfile } from '../controllers/profileController.js'

const router = Router()

router.get('/provider/me', authenticate, requireRole('provider'), myProviderProfile)
router.get('/freelancer/me', authenticate, requireRole('freelancer'), myFreelancerProfile)

export default router
