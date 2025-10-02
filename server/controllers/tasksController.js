import { query, tx } from '../config/db.js'

export async function createTask(req, res) {
  try {
    const { title, description, type, points, expiry_at } = req.body
    if (!title || !description || !type || !points || !expiry_at) {
      return res.status(400).json({ error: 'title, description, type, points, expiry_at are required' })
    }
    const providerId = req.user.id
    const p = await query('SELECT user_id FROM providers WHERE user_id=$1', [providerId])
    if (!p.rows.length) return res.status(403).json({ error: 'Only providers can create tasks' })
    const r = await query(
      `INSERT INTO tasks (title, description, type, points, provider_id, expiry_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description, type, points, providerId, expiry_at]
    )
    await query('UPDATE providers SET tasks_count = tasks_count + 1 WHERE user_id=$1', [providerId])
    return res.status(201).json({ task: r.rows[0] })
  } catch (e) {
    console.error('Create task error', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function listOpenTasks(req, res) {
  try {
    const { type, q, pointsMin, pointsMax, providerId, createdAfter, expiresBefore, status, sortBy, sortDir } = req.query
    const filters = []
    const params = []
    let i = 1
    if (!status) {
      filters.push("t.status = 'open'")
      filters.push('t.expiry_at > now()')
    } else {
      filters.push('t.status = $' + i); params.push(status); i++
    }
    if (type) { filters.push('t.type = $' + i); params.push(type); i++ }
    if (q) { filters.push('(t.title ILIKE $' + i + ' OR t.description ILIKE $' + i + ')'); params.push('%'+q+'%'); i++ }
    if (pointsMin) { filters.push('t.points >= $' + i); params.push(Number(pointsMin)); i++ }
    if (pointsMax) { filters.push('t.points <= $' + i); params.push(Number(pointsMax)); i++ }
    if (providerId) { filters.push('t.provider_id = $' + i); params.push(providerId); i++ }
    if (createdAfter) { filters.push('t.created_at >= $' + i); params.push(createdAfter); i++ }
    if (expiresBefore) { filters.push('t.expiry_at <= $' + i); params.push(expiresBefore); i++ }

    const where = filters.length ? 'WHERE ' + filters.join(' AND ') : ''
    const validSort = ['created_at','expiry_at','points']
    const sBy = validSort.includes(sortBy) ? sortBy : 'created_at'
    const sDir = (sortDir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    const sql = `SELECT t.*, u.username AS provider_username
                 FROM tasks t JOIN users u ON u.id = t.provider_id
                 ${where}
                 ORDER BY t.${sBy} ${sDir}
                 LIMIT 200`
    const r = await query(sql, params)
    return res.json({ tasks: r.rows })
  } catch (e) {
    console.error('List open tasks error', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function myCreatedTasks(req, res) {
  try {
    const r = await query('SELECT * FROM tasks WHERE provider_id=$1 ORDER BY created_at DESC', [req.user.id])
    res.json({ tasks: r.rows })
  } catch (e) {
    console.error('myCreatedTasks', e)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function myAssignedTasks(req, res) {
  try {
    const r = await query('SELECT * FROM tasks WHERE freelancer_id=$1 ORDER BY created_at DESC', [req.user.id])
    res.json({ tasks: r.rows })
  } catch (e) {
    console.error('myAssignedTasks', e)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Provider marks task as completed → rating += points
export async function completeTask(req, res) {
  try {
    const { id } = req.params
    const providerId = req.user.id
    const result = await tx(async (c) => {
      const tRes = await c.query('SELECT * FROM tasks WHERE id=$1 FOR UPDATE', [id])
      if (!tRes.rows.length) throw new Error('Task not found')
      const t = tRes.rows[0]
      if (t.provider_id !== providerId) throw new Error('Not your task')
      if (!['assigned','in_progress'].includes(t.status)) throw new Error('Task not in progress')
      await c.query("UPDATE tasks SET status='completed', updated_at=now() WHERE id=$1", [id])
      if (t.freelancer_id) {
        await c.query('UPDATE freelancers SET rating = rating + $1, active_task_count = GREATEST(active_task_count - 1, 0) WHERE user_id=$2', [t.points, t.freelancer_id])
      }
      return { ok: true }
    })
    return res.json({ success: true })
  } catch (e) {
    console.error('completeTask', e)
    return res.status(400).json({ error: e.message || 'Error completing task' })
  }
}

// Provider marks task as failed → rating -= 1.5 * points
export async function failTask(req, res) {
  try {
    const { id } = req.params
    const providerId = req.user.id
    await tx(async (c) => {
      const tRes = await c.query('SELECT * FROM tasks WHERE id=$1 FOR UPDATE', [id])
      if (!tRes.rows.length) throw new Error('Task not found')
      const t = tRes.rows[0]
      if (t.provider_id !== providerId) throw new Error('Not your task')
      if (!['assigned','in_progress'].includes(t.status)) throw new Error('Task not in progress')
      await c.query("UPDATE tasks SET status='cancelled', updated_at=now() WHERE id=$1", [id])
      if (t.freelancer_id) {
        await c.query('UPDATE freelancers SET rating = rating - $1, active_task_count = GREATEST(active_task_count - 1, 0) WHERE user_id=$2', [1.5 * t.points, t.freelancer_id])
      }
    })
    return res.json({ success: true })
  } catch (e) {
    console.error('failTask', e)
    return res.status(400).json({ error: e.message || 'Error failing task' })
  }
}
