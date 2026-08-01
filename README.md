# GroupSpace — Private Group Social Platform

A private social web application for a closed group of friends. Features a member gallery, real-time chat, shared calendar, and profile management. Authenticated via a single shared master group password.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS v3, Framer Motion, Lucide React, Socket.io-client  
**Backend:** Node.js 20+, Express 4, Mongoose, Socket.io, JWT, bcrypt  
**Storage:** Cloudflare R2 (S3-compatible) for media, MongoDB for data  
**Image Proxy:** wsrv.nl for image optimization and delivery

---

## Prerequisites

- Node.js 20+
- MongoDB (Atlas or local instance)
- Cloudflare R2 account with a bucket created

---

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd <repo-name>

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Cloudflare R2 Bucket Setup

1. Create an R2 bucket in the Cloudflare dashboard
2. Configure CORS on the bucket to allow browser PUT requests:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

3. Note your R2 account ID, access key ID, and secret access key from the R2 dashboard

### 3. Environment Variables

**Backend (.env):**

```bash
cp .env.example .env
```

Fill in:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — a long random string
- `MASTER_PASSWORD_HASH` — generated via the script below
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` — from Cloudflare R2
- `R2_BUCKET_NAME` — your bucket name
- `R2_PUBLIC_BASE_URL` — your R2 public URL (e.g., `https://pub-xxx.r2.dev`)
- `CLIENT_ORIGIN` — `http://localhost:5173`

**Frontend (.env):**

```bash
cp .env.example .env
```

Defaults work for local development.

### 4. Generate Master Password Hash

```bash
cd backend
node scripts/hashPassword.js "your-group-password-here"
```

Copy the output hash into `MASTER_PASSWORD_HASH` in your backend `.env`.

### 5. Run

```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

Open `http://localhost:5173`. Enter your chosen display name and the master group password to log in.

---

## Build

```bash
# Frontend production build
cd frontend
npm run build
```

The output is in `frontend/dist/`.

---

## Features

- **Home** — Welcome page with stacked member card deck
- **Gallery** — Upload images (auto-compressed) and videos, masonry grid, full-screen viewer
- **Chat** — Real-time messaging with typing indicators, online presence, message history
- **Calendar** — Month view with event creation, editing, and deletion
- **Settings** — Profile editing, profile picture upload, theme toggle, logout
- **Dark/Light Theme** — Persisted to localStorage, respects system preference
