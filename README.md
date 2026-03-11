# Mini Task Tracker

A full-stack Task Tracker web application built with **Node.js + TypeScript + Express + MongoDB + Redis** (backend) and **Next.js + Tailwind CSS** (frontend).

## 📌 Features

- **User Authentication** — Signup / Login with JWT-based auth
- **Task CRUD** — Create, Read, Update, Delete tasks
- **Redis Caching** — Task list cached per user, auto-invalidated on mutations
- **Task Filtering** — Filter by status (pending / completed)
- **Optimistic UI** — Instant feedback on status toggle and delete
- **Responsive Design** — Tailwind CSS with a clean, minimal UI
- **Backend Tests** — Jest + Supertest with mongodb-memory-server and ioredis-mock

---

## 🏗 Project Structure

```
mini-task-tracker/
├── backend/               # Express + TypeScript API
│   ├── src/
│   │   ├── config/        # DB, Redis, app config
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/        # Mongoose models (User, Task)
│   │   ├── routes/        # API route handlers
│   │   ├── __tests__/     # Jest test suites
│   │   ├── app.ts         # Express app setup
│   │   └── server.ts      # Entry point
│   ├── .env.example
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/              # Next.js + Tailwind CSS
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context provider
│   │   ├── lib/           # API client (Axios)
│   │   ├── pages/         # Next.js pages
│   │   └── styles/        # Global CSS
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🔧 Prerequisites

- **Node.js** v18+
- **MongoDB** (local or cloud — e.g., MongoDB Atlas)
- **Redis** (local or cloud — e.g., Redis Cloud)
- **npm** or **yarn**

---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd mini-task-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (or copy from `.env.example`):

```bash
cp .env.example .env
```

**Environment Variables** (`.env`):

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/task-tracker` |
| `JWT_SECRET` | Secret key for JWT signing | (change this!) |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `REDIS_HOST` | Redis host | `127.0.0.1` |
| `REDIS_PORT` | Redis port | `6379` |

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file (or copy from `.env.example`):

```bash
cp .env.example .env.local
```

**Environment Variables** (`.env.local`):

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create a new user |
| `POST` | `/api/auth/login` | Authenticate & get JWT |
| `GET` | `/api/auth/me` | Get current user (auth required) |

### Tasks (all require authentication)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List tasks (supports `?status=pending\|completed`) |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

### Test Coverage Report

```bash
npm run test:coverage
```

Tests use:
- **mongodb-memory-server** — In-memory MongoDB for integration tests
- **ioredis-mock** — Redis mock for caching tests
- **supertest** — HTTP request testing

---

## 🏛 Architecture & Design Decisions

### Backend
- **Mongoose Schema Validation** — All fields validated at the schema level with appropriate constraints
- **Indexes** — Compound indexes on `owner + status` and `owner + dueDate` for efficient queries
- **Password Security** — bcrypt with 12 salt rounds, password excluded from queries by default (`select: false`)
- **JWT Auth Middleware** — Validates token, handles expiry, and verifies user existence
- **Redis Caching Strategy** — Cache key per user + filter combination, 5-minute TTL, invalidated on any task mutation
- **Input Validation** — express-validator on all endpoints with proper error messages
- **Error Handling** — Centralized error handler, no sensitive info leaked

### Frontend
- **Auth Context** — React Context for global auth state, persisted in localStorage
- **Optimistic UI** — Delete and status toggle update UI immediately, revert on failure
- **Task Filtering** — Client sends filter params to backend, leveraging MongoDB indexes
- **Axios Interceptors** — Auto-attach JWT token, auto-redirect on 401

---

## 📋 Models

### User
| Field | Type | Constraints |
|---|---|---|
| `name` | String | Required, 2-50 chars |
| `email` | String | Required, unique, valid email |
| `password` | String | Required, min 6 chars, hashed with bcrypt |
| `createdAt` | Date | Auto-generated |

### Task
| Field | Type | Constraints |
|---|---|---|
| `title` | String | Required, 1-200 chars |
| `description` | String | Optional, max 2000 chars |
| `status` | String | `pending` \| `completed`, default `pending` |
| `dueDate` | Date | Required |
| `owner` | ObjectId | Ref to User, required |
| `createdAt` | Date | Auto-generated |

---

## 🛡 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT stored in `Authorization: Bearer <token>` header
- CORS configured for frontend origin only
- Input validation on all endpoints
- Tasks scoped to authenticated user only (no access to other users' tasks)
- Password field excluded from queries by default

---

## 📝 License

ISC
