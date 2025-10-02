import jwt from 'jsonwebtoken'

export function authenticate(req, res, next) {
  const header = req.headers['authorization'] || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.id, role: payload.role, username: payload.username }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' })
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden: ' + role + ' required' })
    next()
  }
}
