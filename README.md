# 🏘️ Hometown Hub – Digital Community Platform

A full-stack community platform built with Next.js 14, Express.js, MongoDB Atlas, and Socket.io to help people stay connected with their hometown communities digitally.

---

## 📖 About The Project

Hometown Hub is a full-stack community platform designed to help people stay connected with their hometowns, local communities, and cultural groups even when living in different cities.

The platform allows users to create communities, share posts, organize events, and interact with others through a modern real-time web application.

---

## 🌐 Live Demo

Deployment in progress...

---

## ✨ Features

- 🔐 User authentication using JWT
- 🏘️ Create and join hometown communities
- 📝 Create posts with likes and comments
- 📅 Community events with RSVP support
- 🔔 Real-time notifications using Socket.io
- 👤 User profiles and activity feed
- 🔍 Search users, posts, communities, and events
- ☁️ Image uploads using Cloudinary
- 📱 Fully responsive design for mobile and desktop

---

## 📸 Screenshots

### Homepage
![Homepage](./screenshots/homepage.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Community Page
![Community](./screenshots/community.png)

---

## 🗂️ Project Structure

```bash
hometown-hub/
│
├── backend/      # Express.js backend API
├── frontend/     # Next.js frontend
├── README.md
```

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/rachan-98/hometown-hub.git
cd hometown-hub
```

### 2. Set up the Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

### 3. Set up the Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

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

1. Go to https://cloud.mongodb.com
2. Create a new project
3. Build a database using the M0 Free cluster
4. Create a database user
5. Allow network access
6. Copy your MongoDB connection string
7. Add the URI to your backend `.env`

---

## ☁️ Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Copy your Cloud Name, API Key, and API Secret
3. Add them to your backend `.env`

---

## 🚢 Deploy Backend to Railway

1. Push your code to GitHub repository
2. Go to https://railway.app
3. Create a new project from GitHub
4. Select the `backend` folder as root directory
5. Add all backend environment variables
6. Deploy the project
7. Copy your Railway deployment URL

---

## ▲ Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Set the root directory to `frontend`
4. Add frontend environment variables
5. Deploy the project
6. Copy your Vercel deployment URL

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-time | Socket.io |
| Image Uploads | Cloudinary |
| Deployment | Vercel, Railway |

---

## 🏗️ Architecture

```bash
Client (Next.js 14)
    │
    ├── Auth Context
    ├── API Services
    │
    ▼
Express API
    │
    ├── Middleware
    ├── Controllers
    ├── Models
    │
    ├── MongoDB Atlas
    ├── Cloudinary
    └── Socket.io
```

---

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Protected API routes
- Rate limiting
- Input validation
- Secure environment variables

---

## 📄 License

MIT License

---

Built by Rachan Kumar Gantha using the MERN stack and modern web technologies.