import React, { useState } from 'react'
import { api } from '../lib/api.js'

export default function LoginView({ onLoggedIn }){
  const [tab,setTab]=useState('login')
  const [username,setUsername]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [role,setRole]=useState('provider')
  const [name,setName]=useState('')
  const [bio,setBio]=useState('')
  const [err,setErr]=useState('')

  async function doLogin(e){e.preventDefault();setErr('')
    try{ const r=await api.login({username,password}); onLoggedIn(r) }catch(e){setErr(e.message)}
  }
  async function doSignup(e){e.preventDefault();setErr('')
    try{ await api.signup({username,email,password,role,name,bio})
         const r=await api.login({username,password}); onLoggedIn(r)
    }catch(e){setErr(e.message)}
  }

  return (<div className="auth-box">
    <div className="tabs">
      <div className={tab==='login'?'tab active':'tab'} onClick={()=>setTab('login')}>Login</div>
      <div className={tab==='signup'?'tab active':'tab'} onClick={()=>setTab('signup')}>Signup</div>
    </div>
    {tab==='login' ?
      <form className="form" onSubmit={doLogin}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button>Login</button>
        {err && <div className="small" style={{color:'crimson'}}>{err}</div>}
      </form>
    :
      <form className="form" onSubmit={doSignup}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="provider">Provider</option>
          <option value="freelancer">Freelancer</option>
        </select>
        {role==='provider' && <textarea placeholder="Bio (optional)" value={bio} onChange={e=>setBio(e.target.value)} />}
        <button>Create account</button>
        {err && <div className="small" style={{color:'crimson'}}>{err}</div>}
      </form>
    }
  </div>)
}
