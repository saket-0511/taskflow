import axios from "axios";
import { CreateTaskPayload, UpdateTaskPayload } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Tasks
export const getTasks = () => api.get("/api/tasks/").then((r) => r.data.tasks);

export const createTask = (data: CreateTaskPayload) =>
  api.post("/api/tasks/", data).then((r) => r.data.task);

export const updateTask = (id: string, data: UpdateTaskPayload) =>
  api.patch(`/api/tasks/${id}`, data).then((r) => r.data.task);

export const deleteTask = (id: string) =>
  api.delete(`/api/tasks/${id}`).then((r) => r.data);

// Users
export const getUsers = () => api.get("/api/users/").then((r) => r.data.users);

// Auth
export const syncUser = (data: {
  email: string;
  name: string;
  avatar_url?: string;
  google_id: string;
}) => api.post("/api/auth/sync-user", data).then((r) => r.data.user);

export const getMe = (googleId: string) =>
  api.get(`/api/auth/me?google_id=${googleId}`).then((r) => r.data.user);

export default api;
