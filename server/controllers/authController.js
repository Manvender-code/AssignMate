import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query } from '../config/db.js'

const SALT_ROUNDS = 10

export async function signup(req, res) {
  try {
    const { username, email, password, role, name, bio } = req.body
    if (!username || !email || !password || !role || !name) {
      return res.status(400).json({ error: 'username, email, password, role, name are required' })
    }
    if (!['provider','freelancer'].includes(role)) {
      return res.status(400).json({ error: 'role must be provider or freelancer' })
    }
    const exists = await query('SELECT 1 FROM users WHERE username=$1 OR email=$2', [username, email])
    if (exists.rows.length) return res.status(409).json({ error: 'Username or email already exists' })

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)
    const userRes = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, username, email, role, created_at',
      [username, email, password_hash, role]
    )
    const user = userRes.rows[0]
    if (role === 'provider') {
      await query('INSERT INTO providers (user_id, name, bio) VALUES ($1,$2,$3)', [user.id, name, bio || null])
    } else {
      await query('INSERT INTO freelancers (user_id, name) VALUES ($1,$2)', [user.id, name])
    }
    return res.status(201).json({ user })
  } catch (e) {
    console.error('Signup error', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' })
    const r = await query('SELECT id, username, email, password_hash, role FROM users WHERE username=$1', [username])
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' })
    const u = r.rows[0]
    const ok = await bcrypt.compare(password, u.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: u.id, username: u.username, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token, user: { id: u.id, username: u.username, email: u.email, role: u.role } })
  } catch (e) {
    console.error('Login error', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
