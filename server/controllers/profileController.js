import { query } from '../config/db.js'

export async function myProviderProfile(req, res) {
  try {
    const id = req.user.id
    const p = await query('SELECT u.username, u.email, pr.name, pr.bio, pr.tasks_count FROM providers pr JOIN users u ON u.id = pr.user_id WHERE pr.user_id=$1', [id])
    if (!p.rows.length) return res.status(404).json({ error: 'Not a provider' })
    const tasks = await query("SELECT * FROM tasks WHERE provider_id=$1 AND status='completed' ORDER BY updated_at DESC", [id])
    res.json({ profile: p.rows[0], completed_tasks: tasks.rows })
  } catch (e) {
    console.error('myProviderProfile', e)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function myFreelancerProfile(req, res) {
  try {
    const id = req.user.id
    const f = await query('SELECT u.username, u.email, fr.name, fr.rating, fr.active_task_count FROM freelancers fr JOIN users u ON u.id = fr.user_id WHERE fr.user_id=$1', [id])
    if (!f.rows.length) return res.status(404).json({ error: 'Not a freelancer' })
    const tasks = await query("SELECT * FROM tasks WHERE freelancer_id=$1 ORDER BY updated_at DESC", [id])
    res.json({ profile: f.rows[0], tasks: tasks.rows })
  } catch (e) {
    console.error('myFreelancerProfile', e)
    res.status(500).json({ error: 'Internal server error' })
  }
}
