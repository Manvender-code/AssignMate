import React, { useEffect, useState } from 'react'
import { getToken, setToken, clearToken } from './lib/api.js'
import LoginView from './views/LoginView.jsx'
import Dashboard from './views/Dashboard.jsx'
import ProviderProfile from './views/ProviderProfile.jsx'
import FreelancerProfile from './views/FreelancerProfile.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')

  useEffect(() => {
    const t = getToken()
    if (t) {
      const u = JSON.parse(localStorage.getItem('user') || 'null')
      if (u) setUser(u)
    }
  }, [])

  function onLoggedIn({ token, user }) {
    setToken(token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    setPage('dashboard')
  }
  function logout() {
    clearToken(); localStorage.removeItem('user'); setUser(null)
  }

  if (!user) return <LoginView onLoggedIn={onLoggedIn} />

  return (
    <div className="container">
      <header className="header">
        <h1>Task Broadcast System</h1>
        <div className="nav">
          <a href="#" onClick={()=>setPage('dashboard')}>Dashboard</a>
          {user.role==='provider' && <a href="#" onClick={()=>setPage('provider')}>Provider Profile</a>}
          {user.role==='freelancer' && <a href="#" onClick={()=>setPage('freelancer')}>Freelancer Profile</a>}
          <span className="role-badge">{user.role}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      {page==='dashboard' && <Dashboard user={user} />}
      {page==='provider' && <ProviderProfile />}
      {page==='freelancer' && <FreelancerProfile />}
    </div>
  )
}
