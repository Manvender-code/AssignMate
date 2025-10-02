import React, { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

export default function ProviderProfile(){
  const [data,setData]=useState(null)
  const [err,setErr]=useState('')
  useEffect(()=>{ (async()=>{ try{ const r=await api.myProviderProfile(); setData(r) }catch(e){ setErr(e.message) } })() },[])
  if (err) return <div className="small" style={{color:'crimson'}}>{err}</div>
  if (!data) return <div className="small">Loading...</div>
  const p=data.profile, tasks=data.completed_tasks||[]
  return (<div>
    <h2>Provider Profile</h2>
    <div className="card"><b>{p.name}</b><div className="small">{p.username} · {p.email}</div><div>{p.bio}</div><div className="small">Tasks created: {p.tasks_count}</div></div>
    <h3>Completed Tasks</h3>
    <ul>{tasks.map(t=><li key={t.id}>{t.title} — {t.points} pts (completed at {new Date(t.updated_at).toLocaleString()})</li>)}</ul>
    {!tasks.length && <div className="small">No completed tasks yet.</div>}
  </div>)
}
