const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'
let TOKEN = localStorage.getItem('token') || null
export function setToken(t){ TOKEN=t; localStorage.setItem('token', t) }
export function getToken(){ return TOKEN }
export function clearToken(){ TOKEN=null; localStorage.removeItem('token') }

async function request(path, opts={}){
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers||{})
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`
  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  const data = await res.json().catch(()=>({}))
  if (!res.ok) throw new Error(data?.error || res.statusText)
  return data
}

export const api = {
  signup: (b)=>request('/auth/signup',{method:'POST',body:JSON.stringify(b)}),
  login: (b)=>request('/auth/login',{method:'POST',body:JSON.stringify(b)}),
  createTask: (b)=>request('/tasks',{method:'POST',body:JSON.stringify(b)}),
  listTasks: (p)=>{
    const q = new URLSearchParams(p||{}).toString()
    return request(`/tasks${q?('?'+q):''}`)
  },
  myCreated: ()=>request('/tasks/mine'),
  myAssigned: ()=>request('/tasks/assigned/mine'),
  completeTask: (id)=>request(`/tasks/${id}/complete`,{method:'POST'}),
  failTask: (id)=>request(`/tasks/${id}/fail`,{method:'POST'}),
  sendRequest: (task_id)=>request('/requests',{method:'POST',body:JSON.stringify({task_id})}),
  incomingRequests: ()=>request('/requests/incoming'),
  decideRequest: (id,decision)=>request(`/requests/${id}/decision`,{method:'POST',body:JSON.stringify({decision})}),
  myProviderProfile: ()=>request('/profile/provider/me'),
  myFreelancerProfile: ()=>request('/profile/freelancer/me'),
}
