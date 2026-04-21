# Simple Notes App

A lightweight multi-user notes application built with Node.js and Express. It supports session-based login, role-based access control, an admin audit log, and a primary/secondary database failover simulation.

---

## Features

- **User authentication** — session-based login with hardcoded demo accounts
- **Role-based access** — regular users see only their own notes; admins see all notes
- **Audit logging** — every login and note creation is timestamped and logged to `audit.log`
- **Admin panel** — admins can view the full audit log via a dedicated page
- **DB failover simulation** — toggle between a primary and secondary JSON database at runtime

---

## Project Structure

```
Simple-Notes-App-main/
├── server.js             # Express backend — routes, auth, DB logic
├── package.json          # Dependencies and start script
├── db_primary.json       # Primary notes database (JSON)
├── db_secondary.json     # Fallback database used when primary is "down"
├── audit.log             # Append-only action log
└── public/
    ├── login.html        # Login page
    ├── notes.html        # Notes dashboard (add & view notes)
    └── audit.html        # Audit log viewer (admin only)
```

---

## Setup

### Requirements
- Node.js v18 or higher

### Install & Run

```bash
npm install
npm start
```

The server starts at **http://localhost:3000**

---

## Demo Accounts

| Username | Password | Role  |
|---|---|---|
| `admin`  | `admin123` | Admin — sees all notes and audit logs |
| `alice`  | `user123`  | User — sees only their own notes |

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | — | Log in with username & password |
| `GET` | `/api/notes` | Required | Get notes (filtered by role) |
| `POST` | `/api/notes` | Required | Create a new note |
| `GET` | `/api/audit` | Admin only | Retrieve audit log entries |
| `GET` | `/toggleDB` | — | Toggle primary DB up/down |

---

## Database Failover

The app simulates primary database failure via a toggle route:

```
GET /toggleDB
```

When the primary is marked as "down", all reads and writes are redirected to `db_secondary.json`. Hitting the route again brings the primary back up. This is useful for demonstrating failover behavior without any infrastructure setup.

---

## Notes

- Passwords are stored in plain text in `server.js` — this is for demo purposes only
- The session secret (`"secretKey"`) should be replaced with a strong, environment-sourced value in any real deployment
- `node_modules/` is included in the zip but should be added to `.gitignore` and excluded from version control — just run `npm install` instead
