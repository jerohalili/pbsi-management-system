# PBSI Platform

A zero-cost school management system built with the PERN stack (PostgreSQL, Express, React, Node). Administrators, teachers and students each get their own role-based dashboard for courses, modules, assignments, auto-graded quizzes, grades, attendance, timetables, discussions and notifications.

Live app: [https://pbsi-platform.vercel.app](https://pbsi-platform.vercel.app)

## Roles

There are three roles. Accounts are created by staff; public sign-up is disabled (`POST /api/auth/register` returns 403).

| Role        | What they can do                                                                                                                                                                                                                                        |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **admin**   | Everything: manage all users, courses, grades, attendance, timetable and audit logs; export students to CSV                                                                                                                                             |
| **teacher** | Manage their own courses, modules, assignments, quizzes and timetable entries; grade submissions; take attendance; view and adjust grades for the courses they teach; create student accounts and delete the students they added (only while the student has no records) |
| **student** | View their own courses, grades and attendance; submit assignments; take published quizzes; join discussions                                                                                                                                             |

## Features

- **Users and RBAC**: `verifyToken` + `restrictTo(...roles)` middleware, plus ownership checks (a teacher only manages the courses they teach, a student only sees their own records). Admins can create, edit, deactivate/reactivate, reset passwords for and delete users. Deleting an account: an admin can delete any account (except their own and the last active admin), and a teacher only the students they added (`users.created_by`). A teacher cannot delete a student who has grades, attendance, submissions, quiz attempts or discussion posts; an admin can, after a warning that shows what will be deleted along with the account. Audit entries, courses and records someone else recorded or graded always block deletion (deactivate instead).
- **Session revocation**: deactivating an account or resetting its password ends that person's sessions immediately (`users.tokens_valid_after`, checked on every request and on token refresh).
- **Courses and modules**, with teacher assignment. A module has a title, a rich-text description, an optional video link and an optional file attachment (see *File uploads*).
- **Assignments and submissions**: students submit, teachers grade with feedback.
- **Quizzes**: teachers build quizzes and questions; student attempts are graded automatically. Questions are frozen once a student has taken the quiz.
- **Grades**: written automatically when an assignment is graded or a quiz is submitted. Scores are percentages (0-100). A teacher (own courses) or an admin can adjust a grade; the change is audited and the student is notified. A student's average is calculated live from the `grades` table.
- **Grade terms**: `grades.term` is the school year label (June starts a new year, Manila time), e.g. `2026` covers June 2026 to May 2027.
- **Attendance**: teachers and admins load a class roster for a course and date and save it in bulk or one student at a time. There is one record per student, course and day; saving again updates it. Changing an already-recorded status is treated as a correction and audited (`attendance.override`). Students see their own records and a summary.
- **Timetable**: weekly schedule, Monday to Saturday, by period. The API refuses an entry that would double-book a teacher, a room or a course (409 with a message saying what clashes).
- **Discussions** (threads and replies) and **notifications**.
- **Audit logs** for role changes, deactivations, password resets, deletions, grade overrides and attendance corrections (admin only).
- **Dashboards** with role-specific stats.

### File uploads

Admins and teachers can upload images, videos and files for module content. Files are sent to the API, which forwards them to [Cloudinary](https://cloudinary.com) and returns the URL and `public_id`. The module row stores the result, and the old Cloudinary asset is removed after a module's file is replaced, cleared or the module is deleted. Cloudinary credentials are required at server startup.

## Tech Stack

- **Frontend** (`client/`): React 18, Vite 6, TypeScript, Tailwind CSS, Radix UI primitives (shadcn-style components), React Router 7, React Query, react-hook-form + zod, Axios.
- **Backend** (`server/`): Node 20+, Express 4, TypeScript (ESM), zod validation, `jsonwebtoken`, `bcryptjs`, helmet, CORS, `express-rate-limit`, `multer` and `cloudinary` for uploads.
- **Database**: PostgreSQL on [Neon](https://neon.tech), accessed through `@neondatabase/serverless` (tagged-template `sql` queries).
- **Hosting**: client on Vercel (SPA rewrite in `client/vercel.json`), API on Render.

## Repo Structure

```
pbsi-platform/
├── client/                 # Vite + React frontend
│   └── src/{pages,components,contexts,hooks,lib}
├── server/                 # Express API
│   ├── sql/                # One-off SQL scripts to run in the Neon SQL editor (see below)
│   └── src/{routes,controllers,middleware,utils,config,types}
├── neon.ts                 # Neon project config (branch policy)
├── DESIGN_SYSTEM.md        # NOTE: describes the separate PBSI marketing site, not this app
└── README.md
```

## Getting Started

Requires Node.js 20 or newer, a Neon (or any PostgreSQL) database and a Cloudinary account.

```
# 1. Server
cd server
cp .env.example .env        # then fill in the values
npm install
npm run dev                 # http://localhost:4000

# 2. Client (in a second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to localhost:4000)
```

> **Windows only:** `server`'s `dev` script uses `set TS_NODE_TRANSPILE_ONLY=true&&`, which works in Windows `cmd`/npm but not on macOS/Linux. On those systems run `TS_NODE_TRANSPILE_ONLY=true node --env-file=.env --watch --experimental-specifier-resolution=node --loader ts-node/esm src/server.ts`.

Other scripts: `npm run typecheck` (both packages), `npm run build` (both packages), `npm start` (server, runs `dist/`).

## Environment Variables

### Server (`server/.env`)

| Variable                                                               | Purpose                                                                         |
|------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| `PORT`                                                                 | API port (default `4000`)                                                       |
| `NODE_ENV`                                                             | `development` or `production` (production sets secure, `SameSite=None` cookies) |
| `CORS_ORIGIN`                                                          | Allowed frontend origin, e.g. `http://localhost:5173`                           |
| `DATABASE_URL`                                                         | Neon connection string (`?sslmode=require`)                                     |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`                              | Token signing secrets (use long random values)                                  |
| `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`                      | Token lifetimes (default `15m` / `7d`)                                          |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Required: the server refuses to start without them (`src/config/cloudinary.ts`) |

### Client (`client/.env`)

```
VITE_API_URL=http://localhost:4000     # optional; defaults to /api (Vite dev proxy)
```

`/api` is appended automatically if missing.

## Database

The app expects these tables (derived from the queries in `server/src/controllers/`):

`users`, `profiles`, `students`, `teachers`, `courses`, `modules`, `assignments`, `submissions`, `quizzes`, `quiz_questions`, `quiz_attempts`, `grades`, `attendance`, `timetable`, `discussion_threads`, `discussion_replies`, `notifications`, `audit_logs`.

There is no full schema file in the repo yet; create the tables in Neon first. Column names are the ones the controllers use.

### SQL scripts (`server/sql/`)

Run these by hand in the Neon SQL editor. All are safe to run more than once. Scripts marked "check for duplicates first" begin with queries that must return no rows before you create the index.

| Script                             | When                                                                     | Notes                                                                                                                                                                        |
|------------------------------------|--------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `token-revocation.sql`             | **Before** deploying the current server                                  | Adds `users.tokens_valid_after`; the API reads it on every request                                                                                                           |
| `users-created-by.sql`             | **Before** deploying the server that lets teachers delete their students | Adds `users.created_by` (who created each account); existing accounts stay `NULL`, so only admins can delete them                                                            |
| `attendance-unique-index.sql`      | **Before** using attendance                                              | Required. Attendance saves use `ON CONFLICT (student_id, course_id, date)`, which fails without a unique index on exactly those columns. Check for duplicates first          |
| `2d-backfill-grades.sql`           | After deploying                                                          | One-time copy of old graded submissions and quiz attempts into `grades`                                                                                                      |
| `2d-optional-unique-indexes.sql`   | After the backfill                                                       | Optional. Check for duplicates first; adds unique indexes on `grades` and `quiz_attempts`                                                                                    |
| `timetable-constraints.sql`        | After deploying the timetable update                                     | Optional safety net. Check for duplicates first; adds time/day checks and unique indexes so a teacher, room or course cannot be double-booked even by two simultaneous saves |
| `drop-students-cumulative-gpa.sql` | Eventually, once the latest code has been running fine                   | Drops the unused `students.cumulative_gpa` column                                                                                                                            |

## API Overview

All routes are under `/api` and need a valid session except `/auth/login`, `/auth/logout`, `/auth/refresh` and `/health`.

| Prefix                           | Notes                                                                                                                      |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `/auth`                          | `login`, `logout`, `refresh`, `me` (`register` is disabled)                                                                |
| `/users`                         | List/create/edit, activate/deactivate, reset password, delete (admin/teacher, role-limited)                                |
| `/students`                      | List (admin/teacher), detail, `export/csv` (admin)                                                                         |
| `/teachers`                      | List (admin)                                                                                                               |
| `/courses`, `/modules`           | CRUD scoped to the owning teacher or an admin                                                                              |
| `/upload`                        | `POST /:kind` (`image`, `video` or `file`; field name `file`) and `DELETE /:publicId`, admin/teacher only; stored in Cloudinary |
| `/assignments`, `/submissions`   | CRUD and grading                                                                                                           |
| `/quizzes`, `/quiz-attempts`     | Quiz and question management, student attempts                                                                             |
| `/grades`                        | List (scoped by role), `gpa/:student_id` (average percentage; `me` for the signed-in student), `PATCH /:id` adjust a grade |
| `/attendance`                    | List, `roster` (admin/teacher), `summary/:student_id`, `POST /` (one record) and `POST /bulk` (admin/teacher)              |
| `/timetable`                     | List, create, update, delete (admin/teacher); double-booking returns 409                                                   |
| `/discussions`, `/notifications` | Threads, replies, in-app notifications                                                                                     |
| `/audit-logs`                    | Admin only                                                                                                                 |
| `/dashboard/stats`               | Role-specific counts                                                                                                       |
| `/health`                        | Liveness check                                                                                                             |

## Security

- Passwords hashed with bcrypt; access (15 min) and refresh (7 day) JWTs are set as httpOnly cookies. The client also keeps the access token in `localStorage` and sends it as a Bearer header, refreshing it automatically on a 401.
- Every request re-checks that the account is active and that the token was issued after `tokens_valid_after`.
- Zod validation on request bodies; UUID parameters are validated so malformed ids return 400, not a database error.
- `helmet`, CORS locked to `CORS_ORIGIN`, a 10 kB JSON body limit, and rate limiting (20 login attempts per 15 min, 100 per 15 min on other `/auth` routes, 300 per 15 min overall).
- Uploads are restricted to admins and teachers.
- Audit log entries for sensitive admin and grading actions.

## Known Gaps

- No schema/migration tool or tests yet; schema changes are manual SQL in `server/sql/`.
- Uploads are buffered in server memory (multer `memoryStorage`, 1 GB cap) before going to Cloudinary, so very large videos can exhaust memory on a small host.
- `DESIGN_SYSTEM.md` documents a different repository (the PBSI marketing site).
