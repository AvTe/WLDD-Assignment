# Task Tracker

Full-stack task management application with JWT authentication, Redis caching, and a responsive Next.js frontend.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (Mongoose)
- **Caching:** Redis (ioredis)
- **Auth:** JWT (access + refresh tokens), Google OAuth (Firebase)
- **Testing:** Jest, Supertest, Playwright

## Features

- User signup/login with JWT and Google Sign-In
- Task CRUD with status filtering and due date sorting
- Redis caching with automatic invalidation on mutations
- Responsive UI with dark mode support
- Password reset flow

## Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # Fill in your values

# Frontend
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL and Firebase config
```

## Run

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

## Testing

```bash
cd backend && npm test              # Unit tests
cd backend && npm run test:coverage # Coverage report
cd frontend && npm test             # Component tests
cd frontend && npm run test:e2e     # E2E tests
```

## API Endpoints

### Auth (`/api/auth`)
`POST /signup` · `POST /login` · `GET /refresh` · `POST /logout` · `POST /google` · `GET /me` · `POST /forgot-password` · `POST /reset-password`

### Tasks (`/api/tasks`)
`GET /` · `POST /` · `PUT /:id` · `DELETE /:id`
