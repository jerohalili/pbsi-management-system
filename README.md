# PBSI Management System

A modern, zero-cost school management system built with the PERN stack (PostgreSQL, Express, React, Node). Features RBAC, student records, courses/modules, assignments, auto-graded quizzes, attendance, timetables, grades & GPA, discussions, notifications, audit logs, and Cloudinary-backed file storage.

## Tech Stack
- **Frontend:** React (Vite) + TypeScript + Tailwind CSS + Lucide Icons + shadcn-style UI (Radix primitives), deployed to Vercel
- **Backend:** Node.js + Express.js + TypeScript, deployed to Render
- **Database:** PostgreSQL serverless via Neon.tech (`@neondatabase/serverless`, SSL pooling)
- **Storage:** Cloudinary (backend-signed uploads)

## Repo Structure
```
pbsi-management-system/
├── client/          # Vite + React frontend (Vercel)
├── server/          # Express API (Render)
└── README.md
```

## Environment Variables

### Server (`server/.env`)
```
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgres://...?sslmode=require"
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:4000
```

## Getting Started

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Run server (dev)
cd server
npm run dev

# Run client (dev)
cd client
npm run dev
```

## Database Schema
Core tables: `users`, `profiles`, `students`, `teachers`, `parents`, `parent_students`, `courses`, `modules`, `assignments`, `submissions`, `quizzes`, `quiz_questions`, `quiz_attempts`, `attendance`, `timetable`, `grades`, `discussion_threads`, `discussion_replies`, `notifications`, `audit_logs`.

Create these tables in your Neon database before running the server. See `server/src/controllers/` for expected column names.

## Security
- JWT access (15m) + refresh (7d) tokens in httpOnly cookies
- bcrypt password hashing (salt 12)
- `verifyToken` + `restrictTo(...roles)` middleware
- Ownership checks on student/grade/attendance/submission routes
- Rate limiting, helmet, CORS, xss-clean, mongo-sanitize
- Audit logs for role changes, deletions, grade overrides
