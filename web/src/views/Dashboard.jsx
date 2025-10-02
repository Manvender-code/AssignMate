import React, { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

export default function Dashboard({ user }){
  const [filters,setFilters]=useState({ type:'', q:'', pointsMin:'', pointsMax:'', status:'', sortBy:'created_at', sortDir:'DESC' })
  const [tasks,setTasks]=useState([])
  const [err,setErr]=useState('')

  async function load(){
    setErr('')
    try{ const r=await api.listTasks(filters); setTasks(r.tasks||[]) }catch(e){ setErr(e.message) }
  }
  useEffect(()=>{ load() }, [])

  function setF(k,v){ setFilters(f=>({...f,[k]:v})) }

  async function createTask(e){
    e.preventDefault(); setErr('')
    try{
      const title=e.target.title.value, description=e.target.description.value,
            type=e.target.ttype.value, points=Number(e.target.points.value), expiry_at=e.target.expiry_at.value
      await api.createTask({ title, description, type, points, expiry_at }); e.target.reset(); await load()
    }catch(e){ setErr(e.message) }
  }

  function FilterPanel(){
    return (<div className="filters">
      <input placeholder="Search" value={filters.q} onChange={e=>setF('q',e.target.value)} />
      <input placeholder="Type" value={filters.type} onChange={e=>setF('type',e.target.value)} />
      <input placeholder="Min points" value={filters.pointsMin} onChange={e=>setF('pointsMin',e.target.value)} />
      <input placeholder="Max points" value={filters.pointsMax} onChange={e=>setF('pointsMax',e.target.value)} />
      <select value={filters.sortBy} onChange={e=>setF('sortBy',e.target.value)}>
        <option value="created_at">Sort: Created</option>
        <option value="expiry_at">Sort: Expiry</option>
        <option value="points">Sort: Points</option>
      </select>
      <select value={filters.sortDir} onChange={e=>setF('sortDir',e.target.value)}>
        <option value="DESC">Desc</option>
        <option value="ASC">Asc</option>
      </select>
      <button onClick={load}>Apply</button>
    </div>)
  }

  async function requestTask(id){
    try{ await api.sendRequest(id); alert('Requested!') }catch(e){ alert(e.message) }
  }

  async function complete(id){ try{ await api.completeTask(id); await load() }catch(e){ alert(e.message) } }
  async function fail(id){ try{ await api.failTask(id); await load() }catch(e){ alert(e.message) } }

  function ProviderPanel(){
    const [incoming,setIncoming]=useState([])
    async function loadIncoming(){ try{ const r=await api.incomingRequests(); setIncoming(r.requests||[]) }catch(e){ } }
    useEffect(()=>{ loadIncoming() }, [])
    async function decide(id, d){ await api.decideRequest(id,d); await load(); await loadIncoming() }
    return (<div>
      <h3>Create Task</h3>
      <form className="form" onSubmit={createTask}>
        <input name="title" placeholder="Title" />
        <textarea name="description" placeholder="Description" />
        <input name="ttype" placeholder="Type" />
        <input name="points" type="number" min="1" placeholder="Points" />
        <input name="expiry_at" type="datetime-local" />
        <button>Broadcast</button>
      </form>
      <h3>Incoming Requests</h3>
      <table className="table">
        <thead><tr><th>Task</th><th>Freelancer</th><th>Requested</th><th>Action</th></tr></thead>
        <tbody>
          {incoming.map(r=>(
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{r.freelancer_name} ({r.freelancer_username})</td>
              <td>{new Date(r.requested_at).toLocaleString()}</td>
              <td>
                <button onClick={()=>decide(r.id,'accept')}>Accept</button>
                <button onClick={()=>decide(r.id,'reject')}>Reject</button>
              </td>
            </tr>
          ))}
          {!incoming.length && <tr><td colSpan="4" className="small">No requests</td></tr>}
        </tbody>
      </table>
    </div>)
  }

  function TasksTable(){
    return (<table className="table">
      <thead><tr><th>Title</th><th>Type</th><th>Points</th><th>Provider</th><th>Expiry</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {tasks.map(t=>(
          <tr key={t.id}>
            <td>{t.title}</td>
            <td>{t.type}</td>
            <td>{t.points}</td>
            <td>{t.provider_username}</td>
            <td>{new Date(t.expiry_at).toLocaleString()}</td>
            <td><span className="badge">{t.status}</span></td>
            <td>
              {user.role==='freelancer' && t.status==='open' ? <button onClick={()=>requestTask(t.id)}>Request</button> : null}
              {user.role==='provider' && ['assigned','in_progress'].includes(t.status) ? (<>
                <button onClick={()=>complete(t.id)}>Complete</button>
                <button onClick={()=>fail(t.id)}>Fail</button>
              </>) : null}
            </td>
          </tr>
        ))}
        {!tasks.length && <tr><td colSpan="7" className="small">No tasks</td></tr>}
      </tbody>
    </table>)
  }

  return (<div>
    <h2>Available Tasks</h2>
    {err && <div className="small" style={{color:'crimson'}}>{err}</div>}
    <FilterPanel/>
    <TasksTable/>
    {user.role==='provider' && <ProviderPanel/>}
  </div>)
}
