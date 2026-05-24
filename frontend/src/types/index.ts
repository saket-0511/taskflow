export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  google_id?: string;
  created_at?: string;
}

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_by?: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by_user?: User;
  assigned_to_user?: User;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  created_by?: string;
  assigned_to?: string;
  due_date?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  due_date?: string;
  updated_by?: string;
}
