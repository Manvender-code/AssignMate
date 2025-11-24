# Plan-It Task Management Platform

## Setup Instructions

### 1. Database Setup (PostgreSQL)
1. Ensure PostgreSQL is installed and running.
2. Create a database named `PLAN_IT`.
3. Run the SQL commands in `backend/database.sql` to create the tables.

```bash
psql -U postgres
CREATE DATABASE PLAN_IT;
\c PLAN_IT
\i backend/database.sql
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server will run on http://localhost:5000.

### 3. Frontend Setup
1. The frontend is built with React and Vite (or similar).
2. Install dependencies (if running locally):
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm start
   ```

## Default Credentials
Register a new user to start testing:
- Select "Provider" to create tasks.
- Select "Freelancer" to view and request tasks.
