
# AssignMate

**Stack**: Postgres, Node.js (Express, ES Modules), React (Vite), CSS  
**Auth**: JWT (users: provider / freelancer)  
**Flow**: Freelancer *requests* a task → Provider *accepts/rejects* → If accepted, task assigned.  
**Ratings**: complete = +points, fail = −1.5 × points.  
**Limit**: a freelancer may hold **max 3** active tasks (assigned/in_progress).


## 1) Postgres
```sql
CREATE DATABASE taskdb;
```
(Optional) Create with `pgcrypto` extension enabled at the DB level if not present.

## 2) Backend
```bash
cd server
cp .env.example .env   # edit if needed
npm install
npm run db:init        # creates tables
npm run dev            # http://localhost:3000
```

## 3) Frontend
```bash
cd web
npm install
npm run dev            # http://localhost:5173
```

`web/.env` (optional):
```
VITE_API_BASE=http://localhost:3000/api
```

## 4) Key Endpoints
### Auth
- `POST /api/auth/signup` `{ username, email, password, role: 'provider'|'freelancer', name, bio? }`
- `POST /api/auth/login` `{ username, password }` → `{ token, user }`

### Tasks
- `GET /api/tasks` (auth) — list tasks with filters (type, q, pointsMin, pointsMax, providerId, createdAfter, expiresBefore, status, sortBy, sortDir)
- `POST /api/tasks` (provider) — create task `{ title, description, type, points, expiry_at }`
- `GET /api/tasks/mine` (provider) — tasks I created
- `GET /api/tasks/assigned/mine` (freelancer) — tasks assigned to me
- `POST /api/tasks/:id/complete` (provider) — mark completed (rating += points)
- `POST /api/tasks/:id/fail` (provider) — mark failed (rating −= 1.5×points)

### Requests
- `POST /api/requests` (freelancer) — { task_id }  → create/refresh a request for an open task
- `GET /api/requests/incoming` (provider) — list pending requests for my tasks
- `POST /api/requests/:id/decision` (provider) — { decision: 'accept'|'reject' }  
  Accept assigns the task if freelancer holds < 3 active tasks; other pending requests auto-reject.

### Profiles
- `GET /api/profile/provider/me`
- `GET /api/profile/freelancer/me`

## 5) Filtering (10 options)
Back-end accepts up to 10 filters: `type`, `q`, `pointsMin`, `pointsMax`, `providerId`, `createdAfter`, `expiresBefore`, `status`, `sortBy`, `sortDir`.

## 6) Notes
- All SQL uses parameterized queries.
- `tasks.status` transitions: `open` → `assigned` → (`in_progress` optional) → `completed` | `cancelled` | `expired` (expiry enforced during fetching/assignment).
- `fail` endpoint deducts `1.5 × points` and decrements active count.
- Frontend table-based dashboard + provider/freelancer profile pages.

