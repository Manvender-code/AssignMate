
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('provider','freelancer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS providers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  tasks_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS freelancers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rating NUMERIC NOT NULL DEFAULT 0.0,
  active_task_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  points INT NOT NULL DEFAULT 1,
  provider_id UUID NOT NULL REFERENCES providers(user_id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES freelancers(user_id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('open','assigned','in_progress','completed','expired','cancelled')) DEFAULT 'open',
  expiry_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_provider ON tasks(provider_id);
CREATE INDEX IF NOT EXISTS idx_tasks_freelancer ON tasks(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_expiry ON tasks(expiry_at);

CREATE TABLE IF NOT EXISTS task_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES freelancers(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending','accepted','rejected')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_task_req ON task_requests(task_id, freelancer_id);
