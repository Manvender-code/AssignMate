import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import requestRoutes from './routes/requestRoutes.js'
import profileRoutes from './routes/profileRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.ALLOW_ORIGIN || 'http://localhost:5173' }))

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/profile', profileRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
