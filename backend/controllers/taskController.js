import pool from '../config/db.js';

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Provider only)
export const createTask = async (req, res, next) => {
  const { title, description, deadline } = req.body;

  if (req.user.role !== 'provider') {
    res.status(403);
    throw new Error('Only providers can create tasks');
  }

  try {
    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, deadline, provider_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, deadline, req.user.id, 'open']
    );

    res.status(201).json(newTask.rows[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all open tasks
// @route   GET /api/tasks
// @access  Private (Freelancer)
export const getOpenTasks = async (req, res, next) => {
  try {
    // Also check for expiry before returning
    await pool.query("UPDATE tasks SET status = 'expired' WHERE deadline < NOW() AND status = 'open'");

    const tasks = await pool.query(`
      SELECT t.*, u.name as provider_name 
      FROM tasks t 
      JOIN users u ON t.provider_id = u.id 
      WHERE t.status = 'open' 
      ORDER BY t.created_at DESC
    `);

    res.json(tasks.rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Request/Assign a task
// @route   POST /api/tasks/:id/request
// @access  Private (Freelancer)
export const requestTask = async (req, res, next) => {
  const { id } = req.params;

  if (req.user.role !== 'freelancer') {
    res.status(403);
    throw new Error('Only freelancers can request tasks');
  }

  try {
    // Check max 3 active tasks constraint
    const activeTasks = await pool.query(
      "SELECT count(*) FROM tasks WHERE freelancer_id = $1 AND status = 'assigned'",
      [req.user.id]
    );

    if (parseInt(activeTasks.rows[0].count) >= 3) {
      res.status(400);
      throw new Error('You have reached the maximum limit of 3 active tasks.');
    }

    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (task.rows.length === 0) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.rows[0].status !== 'open') {
      res.status(400);
      throw new Error('Task is not open for assignment');
    }

    const updatedTask = await pool.query(
      "UPDATE tasks SET freelancer_id = $1, status = 'assigned' WHERE id = $2 RETURNING *",
      [req.user.id, id]
    );

    res.json(updatedTask.rows[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark task as complete
// @route   PUT /api/tasks/:id/complete
// @access  Private (Freelancer)
export const completeTask = async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (task.rows.length === 0) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.rows[0].freelancer_id !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to complete this task');
    }

    const updatedTask = await pool.query(
      "UPDATE tasks SET status = 'completed' WHERE id = $1 RETURNING *",
      [id]
    );

    res.json(updatedTask.rows[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Rate freelancer
// @route   POST /api/tasks/:id/rate
// @access  Private (Provider)
export const rateFreelancer = async (req, res, next) => {
    const { id } = req.params;
    const { rating } = req.body; // 1-5
  
    if (req.user.role !== 'provider') {
      res.status(403);
      throw new Error('Only providers can rate');
    }
  
    try {
      const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  
      if (task.rows.length === 0) {
        res.status(404);
        throw new Error('Task not found');
      }

      if (task.rows[0].provider_id !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized');
      }
  
      if (task.rows[0].status !== 'completed') {
        res.status(400);
        throw new Error('Task must be completed before rating');
      }

      // Update Freelancer Rating
      const freelancerId = task.rows[0].freelancer_id;
      
      // Calculate new average
      // Simplified: Just updating user rating column for now, in production use a separate ratings table
      const currentStats = await pool.query('SELECT rating FROM users WHERE id = $1', [freelancerId]);
      const currentRating = currentStats.rows[0].rating || 0;
      
      // This is a naive average for demo purposes. 
      // Real implementation should query a 'ratings' table.
      const newRating = currentRating === 0 ? rating : (currentRating + rating) / 2;

      await pool.query('UPDATE users SET rating = $1 WHERE id = $2', [newRating, freelancerId]);
  
      res.json({ message: 'Rating submitted' });
    } catch (error) {
      next(error);
    }
  };