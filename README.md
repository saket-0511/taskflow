# TaskFlow — Team Task Management App

A full-stack task management application with Google OAuth, task assignment, and email notifications.

**Live Demo:** [your-deployment-url]  
**GitHub:** [your-github-url]

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                            │
│         Next.js 14 + TypeScript (Vercel)                 │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ /auth    │  │/dashboard│  │  TaskModal Component  │  │
│  │ signin   │  │          │  │  (Create / Edit)      │  │
│  └────┬─────┘  └────┬─────┘  └──────────────────────┘  │
└───────┼─────────────┼───────────────────────────────────┘
        │             │
        │ NextAuth    │ REST API (axios)
        │ (OAuth 2.0) │
        ▼             ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Flask)                        │
│                Railway / Render                          │
│                                                          │
│  POST /api/auth/sync-user   ← sync Google user          │
│  GET  /api/auth/me          ← get current user          │
│  GET  /api/tasks/           ← list all tasks            │
│  POST /api/tasks/           ← create task + email       │
│  PATCH /api/tasks/:id       ← update + completion email │
│  DELETE /api/tasks/:id      ← delete task               │
│  GET  /api/users/           ← list users (for assign)   │
│                                                          │
│  ┌──────────────────┐   ┌──────────────────────────┐   │
│  │  email_service   │   │   supabase_client        │   │
│  │  (Gmail SMTP)    │   │   (Service Role Key)     │   │
│  └──────────────────┘   └──────────────────────────┘   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ supabase-py
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    DATABASE                              │
│                   Supabase (PostgreSQL)                  │
│                                                          │
│   users table                tasks table                 │
│   ─────────────               ──────────────            │
│   id (UUID PK)                id (UUID PK)              │
│   email (unique)              title                     │
│   name                        description               │
│   avatar_url                  status (enum)             │
│   google_id (unique)          priority (enum)           │
│   created_at                  created_by → users.id     │
│                               assigned_to → users.id    │
│                               due_date                  │
│                               created_at / updated_at   │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Auth Provider
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Google OAuth 2.0 + Gmail SMTP               │
│                                                          │
│  • Users sign in with Google account                    │
│  • Email notifications via Gmail App Password           │
│  • Task created → email to assignee                     │
│  • Task completed → email to creator                    │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Flask (Python 3.11+) |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js + Google OAuth 2.0 |
| Email | Gmail SMTP (App Password) |
| Deployment | Vercel (frontend), Railway/Render (backend) |

---

## Features

- ✅ Google OAuth login (no passwords)
- ✅ Create, edit, and delete tasks
- ✅ Assign tasks to any registered user
- ✅ Status tracking (Pending → In Progress → Completed)
- ✅ Priority levels (Low / Medium / High)
- ✅ Due date support
- ✅ Email notification on task assignment
- ✅ Email notification on task completion
- ✅ Search and filter tasks
- ✅ Responsive design (mobile + desktop)

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase project
- Google Cloud project with OAuth 2.0 credentials
- Gmail account with App Password enabled

### 1. Clone the repository
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `backend/migrations/001_initial_schema.sql`
3. Copy your Project URL and keys from Settings → API

### 3. Set up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → Enable Google+ API
3. OAuth 2.0 Credentials → Web Application
4. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

### 4. Set up Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification → App Passwords
3. Generate a password for "Mail"

### 5. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your values in .env

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

python app.py
# Runs on http://localhost:5000
```

### 6. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
# Fill in your values in .env.local

npm install
npm run dev
# Runs on http://localhost:3000
```

---

## Deployment

### Backend → Railway
1. Push `backend/` folder to GitHub
2. New project on [railway.app](https://railway.app) → Deploy from GitHub
3. Set all environment variables from `.env.example`
4. Set `FRONTEND_URL` to your Vercel URL

### Frontend → Vercel
1. Push `frontend/` folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set all environment variables from `.env.example`
4. Set `NEXT_PUBLIC_API_URL` to your Railway URL
5. Add `https://your-app.vercel.app/api/auth/callback/google` to Google OAuth redirect URIs

---

## Project Structure

```
taskflow/
├── backend/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── routes/
│   │   ├── auth.py
│   │   ├── tasks.py
│   │   └── users.py
│   ├── app.py
│   ├── supabase_client.py
│   ├── email_service.py
│   ├── requirements.txt
│   ├── Procfile
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── api/auth/[...nextauth]/route.ts
    │   │   ├── auth/signin/page.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── components/
    │   │   └── TaskModal.tsx
    │   ├── lib/
    │   │   └── api.ts
    │   └── types/
    │       └── index.ts
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── .env.example
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/sync-user | Sync Google user to DB |
| GET | /api/auth/me | Get current user by google_id |
| GET | /api/tasks/ | Get all tasks (with user info) |
| POST | /api/tasks/ | Create task + send email |
| PATCH | /api/tasks/:id | Update task + completion email |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/users/ | Get all users |

---

Built with ❤️ for Hairdrama Tech internship assessment
