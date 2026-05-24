"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Plus, LogOut, CheckSquare, Clock, AlertCircle,
  Search, Filter, Trash2, Edit3, ChevronDown, User
} from "lucide-react";
import { Task, User as UserType } from "@/types";
import { getTasks, getUsers, createTask, updateTask, deleteTask } from "@/lib/api";
import { getMe } from "@/lib/api";
import { format } from "date-fns";
import TaskModal from "@/components/TaskModal";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckSquare },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", color: "bg-orange-100 text-orange-700" },
  high: { label: "High", color: "bg-red-100 text-red-700" },
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin");
  }, [status, router]);

  const loadData = useCallback(async () => {
    if (!session) return;
    try {
      const [tasksData, usersData] = await Promise.all([getTasks(), getUsers()]);
      setTasks(tasksData);
      setUsers(usersData);

      const googleId = (session.user as any).googleId;
      if (googleId) {
        const me = await getMe(googleId);
        setCurrentUser(me);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTask = async (data: any) => {
    await createTask({ ...data, created_by: currentUser?.id });
    await loadData();
    setShowModal(false);
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, { ...data, updated_by: currentUser?.id });
    await loadData();
    setEditingTask(null);
    setShowModal(false);
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    await updateTask(task.id, { status: newStatus as any, updated_by: currentUser?.id });
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    setTasks((t) => t.filter((task) => task.id !== id));
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {session?.user?.name}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Tasks", value: stats.total, color: "bg-indigo-50 text-indigo-700", border: "border-indigo-200" },
            { label: "Pending", value: stats.pending, color: "bg-yellow-50 text-yellow-700", border: "border-yellow-200" },
            { label: "In Progress", value: stats.in_progress, color: "bg-blue-50 text-blue-700", border: "border-blue-200" },
            { label: "Completed", value: stats.completed, color: "bg-green-50 text-green-700", border: "border-green-200" },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl p-5 border ${s.border} shadow-sm`}>
              <div className={`text-3xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Tasks Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No tasks found</h3>
            <p className="text-gray-400 text-sm mt-1">Create your first task to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Assigned To</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Priority</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Due Date</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((task) => {
                    const statusCfg = STATUS_CONFIG[task.status];
                    const priorityCfg = PRIORITY_CONFIG[task.priority];
                    return (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-400 truncate max-w-xs mt-0.5">{task.description}</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1 md:hidden">
                              {task.assigned_to_user?.name || "Unassigned"}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          {task.assigned_to_user ? (
                            <div className="flex items-center gap-2">
                              {task.assigned_to_user.avatar_url ? (
                                <img src={task.assigned_to_user.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                              ) : (
                                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-700">
                                  {task.assigned_to_user.name?.[0]}
                                </div>
                              )}
                              <span className="text-sm text-gray-700">{task.assigned_to_user.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 ${statusCfg.color} cursor-pointer focus:outline-none`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityCfg.color}`}>
                            {priorityCfg.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 hidden lg:table-cell text-sm text-gray-500">
                          {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditingTask(task); setShowModal(true); }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          users={users}
          currentUserId={currentUser?.id}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
