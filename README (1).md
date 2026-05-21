# 🏘️ Hometown Hub – Digital Community Platform

A full-stack, production-ready community platform built with Next.js 14, Express.js, MongoDB Atlas, and real-time notifications via Socket.io.

---

## ✨ Features

- 🔐 JWT Authentication (access + refresh tokens)
- 🏘️ Create & join communities with categories, rules, and moderation
- 📝 Posts with images, tags, likes, and comments
- 📅 Events with RSVP system and capacity management
- 🔔 Real-time notifications via Socket.io
- 👤 User profiles, follow system, activity feed
- 🔍 Global search (users, posts, communities, events)
- 🛡️ Admin dashboard with analytics, user bans, content moderation
- ☁️ Cloudinary image uploads
- 📱 Fully responsive mobile-first UI

---

## 🗂️ Project Structure

```
hometown-hub/
├── backend/                    # Express.js API
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary + Multer config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── communityController.js
│   │   ├── postController.js
│   │   ├── eventController.js
│   │   ├── notificationController.js
│   │   ├── searchController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect/optionalAuth
│   │   ├── errorMiddleware.js  # Global error handler
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Community.js
│   │   ├── Post.js
│   │   ├── Event.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── postRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── searchRoutes.js
│   │   ├── adminRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   └── notificationUtils.js
│   ├── server.js               # Entry point
│   ├── railway.toml            # Railway deployment config
│   ├── package.json
│   └── .env.example
│
└── frontend/                   # Next.js 14 App
    ├── app/
    │   ├── layout.tsx           # Root layout + AuthProvider
    │   ├── page.tsx             # Landing page
    │   ├── globals.css
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── dashboard/
    │   │   ├── layout.tsx       # App shell (navbar + sidebar)
    │   │   └── page.tsx         # Community feed
    │   ├── communities/
    │   │   ├── page.tsx         # Explore communities
    │   │   ├── new/page.tsx     # Create community
    │   │   └── [slug]/page.tsx  # Community detail
    │   ├── events/
    │   │   ├── page.tsx         # Events list
    │   │   ├── new/page.tsx     # Create event
    │   │   └── [id]/page.tsx    # Event detail + RSVP
    │   ├── posts/
    │   │   └── [id]/page.tsx    # Post detail + comments
    │   ├── profile/
    │   │   ├── [username]/page.tsx
    │   │   └── settings/page.tsx
    │   ├── notifications/page.tsx
    │   ├── search/page.tsx
    │   └── admin/page.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── Sidebar.tsx
    │   ├── post/
    │   │   ├── PostCard.tsx
    │   │   └── CreatePostBox.tsx
    │   └── notification/
    │       └── NotificationBell.tsx
    ├── lib/
    │   ├── api.ts               # Axios instance + interceptors
    │   ├── auth.tsx             # Auth context + provider
    │   └── utils.ts             # Helpers, formatters
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── vercel.json
    └── .env.example
```

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/hometown-hub.git
cd hometown-hub
```

### 2. Set up the Backend

```bash
cd backend
cp .env.example .env
# Fill in your .env values (see below)
npm install
npm run dev
# Backend runs on http://localhost:5000
```

### 3. Set up the Frontend

```bash
cd frontend
cp .env.example .env.local
# Fill in your .env.local values
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas — get from: https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hometown-hub?retryWrites=true&w=majority

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_random_secret_here
JWT_REFRESH_SECRET=another_64_char_random_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary — get from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Hometown Hub
```

---

## 🍃 MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up / log in.
2. Create a **new project** → **Build a Database** → choose **M0 Free**.
3. Choose a cloud provider (AWS recommended) and region closest to you.
4. Create a **database user** with a strong password — save it.
5. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
6. Click **Connect** → **Drivers** → copy the connection string.
7. Replace `<username>` and `<password>` in the URI with your credentials.
8. Paste the full URI into `MONGODB_URI` in your backend `.env`.

The app will automatically create all collections and indexes on first run.

---

## ☁️ Cloudinary Setup

1. Sign up at [https://cloudinary.com](https://cloudinary.com) (free tier: 25GB storage).
2. From the Dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Add these to your backend `.env`.

Images are automatically organized into folders:
- `hometown-hub/avatars` — profile photos
- `hometown-hub/posts` — post images
- `hometown-hub/communities` — community avatars/banners

---

## 🚢 Deploy Backend to Railway

1. Push your code to GitHub (see GitHub steps below).
2. Go to [https://railway.app](https://railway.app) and sign up with GitHub.
3. Click **New Project** → **Deploy from GitHub repo** → select your repo.
4. Select the **backend** folder as the root directory (or configure in Railway settings).
5. In **Variables**, add all your backend `.env` values:
   - `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, `NODE_ENV=production`
   - `FRONTEND_URL` = your Vercel URL (add after deploying frontend)
6. Railway auto-detects Node.js and runs `node server.js`.
7. After deploy, copy your Railway URL (e.g. `https://hometown-hub-production.up.railway.app`).

---

## ▲ Deploy Frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New Project** → Import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://your-railway-url.railway.app/api`
   - `NEXT_PUBLIC_SOCKET_URL` = `https://your-railway-url.railway.app`
5. Click **Deploy**. Vercel auto-detects Next.js.
6. After deploy, copy your Vercel URL (e.g. `https://hometown-hub.vercel.app`).
7. Go back to **Railway** → update `FRONTEND_URL` = your Vercel URL → redeploy.

---

## 🐙 GitHub Upload Steps

```bash
# 1. Initialize git in the project root
cd hometown-hub
git init

# 2. Add all files
git add .

# 3. Create first commit
git commit -m "feat: initial commit — Hometown Hub v1.0.0"

# 4. Create a new repo on GitHub (github.com → New repository)
#    Name it: hometown-hub
#    DO NOT initialize with README (you already have one)

# 5. Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/hometown-hub.git
git branch -M main
git push -u origin main
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login |
| POST | `/api/auth/refresh` | None | Refresh access token |
| POST | `/api/auth/logout` | Bearer | Logout |
| GET | `/api/auth/me` | Bearer | Get current user |
| PUT | `/api/auth/change-password` | Bearer | Change password |

### Communities
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/communities` | None | List all communities |
| POST | `/api/communities` | Bearer | Create community |
| GET | `/api/communities/feed` | Bearer | Personal feed |
| GET | `/api/communities/:slug` | Optional | Community detail |
| PUT | `/api/communities/:id` | Bearer | Update community |
| POST | `/api/communities/:id/join` | Bearer | Join/leave |
| GET | `/api/communities/:slug/posts` | Optional | Community posts |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/posts` | Bearer | Create post |
| GET | `/api/posts/:id` | Optional | Get post |
| PUT | `/api/posts/:id` | Bearer | Update post |
| DELETE | `/api/posts/:id` | Bearer | Delete post |
| POST | `/api/posts/:id/like` | Bearer | Toggle like |
| POST | `/api/posts/:id/comments` | Bearer | Add comment |
| DELETE | `/api/posts/:id/comments/:cid` | Bearer | Delete comment |
| POST | `/api/posts/:id/report` | Bearer | Report post |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | Optional | List events |
| POST | `/api/events` | Bearer | Create event |
| GET | `/api/events/:id` | Optional | Event detail |
| PUT | `/api/events/:id` | Bearer | Update event |
| POST | `/api/events/:id/rsvp` | Bearer | RSVP (`going`/`maybe`/`not_going`) |
| POST | `/api/events/:id/cancel` | Bearer | Cancel event |

### Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search?q=query&type=all` | None | Global search |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/reports` | Mod | Reported posts |
| PUT | `/api/admin/users/:id/ban` | Admin | Ban/unban user |
| PUT | `/api/admin/users/:id/role` | Admin | Change role |
| DELETE | `/api/admin/posts/:id` | Mod | Remove post |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Real-time | Socket.io |
| Images | Cloudinary, Multer |
| Deployment | Vercel (frontend), Railway (backend) |
| UI Components | Lucide React, React Hot Toast |

---

## 🏗️ Architecture

```
Client (Next.js 14)
    │
    ├── lib/auth.tsx        → Global auth state (React Context)
    ├── lib/api.ts          → Axios instance with JWT interceptors
    │
    ▼
Express API (Railway)
    │
    ├── Middleware          → helmet, cors, rate-limit, JWT verify
    ├── Controllers         → Business logic (MVC)
    ├── Models              → Mongoose schemas
    │
    ├── MongoDB Atlas       → Data persistence
    ├── Cloudinary          → Image CDN
    └── Socket.io           → Real-time notifications
```

---

## 🔒 Security Features

- Passwords hashed with bcryptjs (salt rounds: 12)
- JWT access tokens (7d) + refresh tokens (30d)
- Helmet.js for HTTP security headers
- Rate limiting (100 req/15min global, 10 req/15min for auth)
- CORS restricted to frontend domain
- Input validation with express-validator
- Banned users blocked at middleware level
- MongoDB injection prevention via Mongoose

---

## 📝 Making Yourself Admin

After registering your account, run this in MongoDB Atlas Query Editor:

```js
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Or via MongoDB Compass — connect with your Atlas URI and update the `role` field.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

Built with ❤️ for communities everywhere. If you find this useful, give it a ⭐ on GitHub!