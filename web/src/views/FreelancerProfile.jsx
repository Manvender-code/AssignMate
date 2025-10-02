import React, { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

export default function FreelancerProfile(){
  const [data,setData]=useState(null)
  const [err,setErr]=useState('')
  useEffect(()=>{ (async()=>{ try{ const r=await api.myFreelancerProfile(); setData(r) }catch(e){ setErr(e.message) } })() },[])
  if (err) return <div className="small" style={{color:'crimson'}}>{err}</div>
  if (!data) return <div className="small">Loading...</div>
  const p=data.profile, tasks=data.tasks||[]
  return (<div>
    <h2>Freelancer Profile</h2>
    <div className="card"><b>{p.name}</b><div className="small">{p.username} · {p.email}</div><div className="small">Rating: {Number(p.rating).toFixed(2)} · Active: {p.active_task_count}</div></div>
    <h3>My Tasks</h3>
    <ul>{tasks.map(t=><li key={t.id}>{t.title} — {t.status} — {t.points} pts</li>)}</ul>
    {!tasks.length && <div className="small">No tasks yet.</div>}
  </div>)
}
