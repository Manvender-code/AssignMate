export enum UserRole {
  FREELANCER = 'freelancer',
  PROVIDER = 'provider'
}

export enum TaskStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rating: number;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  provider_id: string;
  freelancer_id?: string | null;
  provider_name?: string; // Joined for UI convenience
  freelancer_name?: string; // Joined for UI convenience
  created_at: string;
}

export interface DashboardStats {
  completed: number;
  assigned: number;
  pending: number;
  expired: number;
}