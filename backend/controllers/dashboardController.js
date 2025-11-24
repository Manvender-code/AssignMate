import pool from '../config/db.js';

// @desc    Get Dashboard Stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    let stats;
    if (req.user.role === 'provider') {
      stats = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
          COUNT(*) FILTER (WHERE status = 'open') as pending,
          COUNT(*) FILTER (WHERE status = 'expired') as expired
        FROM tasks WHERE provider_id = $1
      `, [req.user.id]);
    } else {
      stats = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
          0 as pending, -- Freelancers don't have "pending" tasks in the same way
          COUNT(*) FILTER (WHERE status = 'expired') as expired
        FROM tasks WHERE freelancer_id = $1
      `, [req.user.id]);
    }
    res.json(stats.rows[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Dashboard Tasks
// @route   GET /api/dashboard/tasks
// @access  Private
export const getDashboardTasks = async (req, res, next) => {
  try {
    let tasks;
    if (req.user.role === 'provider') {
      tasks = await pool.query(`
        SELECT t.*, u.name as freelancer_name 
        FROM tasks t 
        LEFT JOIN users u ON t.freelancer_id = u.id 
        WHERE t.provider_id = $1 
        ORDER BY t.created_at DESC
      `, [req.user.id]);
    } else {
      tasks = await pool.query(`
        SELECT t.*, u.name as provider_name 
        FROM tasks t 
        JOIN users u ON t.provider_id = u.id 
        WHERE t.freelancer_id = $1 
        ORDER BY t.created_at DESC
      `, [req.user.id]);
    }
    res.json(tasks.rows);
  } catch (error) {
    next(error);
  }
};