import { query, tx } from '../config/db.js'

// Freelancer requests a task
export async function requestTask(req, res) {
  try {
    const { task_id } = req.body
    if (!task_id) return res.status(400).json({ error: 'task_id is required' })
    const freelancerId = req.user.id

    // Validate task is open & not expired
    const t = await query('SELECT * FROM tasks WHERE id=$1', [task_id])
    if (!t.rows.length) return res.status(404).json({ error: 'Task not found' })
    const task = t.rows[0]
    if (task.status !== 'open') return res.status(409).json({ error: 'Task is not open' })
    if (new Date(task.expiry_at) <= new Date()) return res.status(409).json({ error: 'Task expired' })

    // Insert or conflict
    const r = await query(
      `INSERT INTO task_requests (task_id, freelancer_id) VALUES ($1,$2)
       ON CONFLICT (task_id, freelancer_id) DO UPDATE SET requested_at=now()
       RETURNING *`,
      [task_id, freelancerId]
    )
    return res.status(201).json({ request: r.rows[0] })
  } catch (e) {
    console.error('requestTask', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Provider lists incoming requests for their tasks
export async function incomingRequests(req, res) {
  try {
    const providerId = req.user.id
    const r = await query(
      `SELECT tr.*, u.username AS freelancer_username, f.name AS freelancer_name, tr.task_id, t.title
       FROM task_requests tr
       JOIN tasks t ON t.id = tr.task_id
       JOIN freelancers f ON f.user_id = tr.freelancer_id
       JOIN users u ON u.id = tr.freelancer_id
       WHERE t.provider_id = $1 AND tr.status = 'pending'
       ORDER BY tr.requested_at DESC`,
      [providerId]
    )
    return res.json({ requests: r.rows })
  } catch (e) {
    console.error('incomingRequests', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Provider decides on a request (accept / reject)
export async function decideRequest(req, res) {
  try {
    const { id } = req.params
    const { decision } = req.body
    if (!['accept','reject'].includes(decision)) return res.status(400).json({ error: 'decision must be accept or reject' })
    const providerId = req.user.id

    const result = await tx(async (c) => {
      const r = await c.query(
        `SELECT tr.*, t.provider_id, t.status AS task_status, t.expiry_at, t.points
         FROM task_requests tr
         JOIN tasks t ON t.id = tr.task_id
         WHERE tr.id = $1 FOR UPDATE`,
        [id]
      )
      if (!r.rows.length) throw new Error('Request not found')
      const row = r.rows[0]
      if (row.provider_id !== providerId) throw new Error('Not your task request')
      if (new Date(row.expiry_at) <= new Date()) throw new Error('Task expired')
      if (row.task_status !== 'open') throw new Error('Task not open')

      if (decision === 'reject') {
        await c.query("UPDATE task_requests SET status='rejected', responded_at=now() WHERE id=$1", [id])
        return { ok: true }
      }

      // Accept flow:
      // Check freelancer holds < 3 active tasks
      const active = await c.query("SELECT COUNT(*) FROM tasks WHERE freelancer_id=$1 AND status IN ('assigned','in_progress')", [row.freelancer_id])
      if (Number(active.rows[0].count) >= 3) throw new Error('Freelancer already holds 3 active tasks')

      // Assign task atomically
      const upd = await c.query("UPDATE tasks SET status='assigned', freelancer_id=$1, updated_at=now() WHERE id=$2 AND status='open' RETURNING id", [row.freelancer_id, row.task_id])
      if (!upd.rows.length) throw new Error('Task assignment race condition')

      await c.query("UPDATE task_requests SET status='accepted', responded_at=now() WHERE id=$1", [id])
      await c.query("UPDATE task_requests SET status='rejected', responded_at=now() WHERE task_id=$1 AND id<>$2 AND status='pending'", [row.task_id, id])
      await c.query("UPDATE freelancers SET active_task_count = active_task_count + 1 WHERE user_id=$1", [row.freelancer_id])
      return { ok: true }
    })

    return res.json({ success: true })
  } catch (e) {
    console.error('decideRequest', e)
    return res.status(400).json({ error: e.message || 'Error deciding request' })
  }
}
