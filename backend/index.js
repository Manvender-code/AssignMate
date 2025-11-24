import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Middleware
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle EADDRINUSE error gracefully
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n\x1b[31mError: Port ${PORT} is already in use.\x1b[0m`);
    console.error('Please stop the process running on this port and try again.');
    process.exit(1);
  } else {
    console.error(e);
  }
});