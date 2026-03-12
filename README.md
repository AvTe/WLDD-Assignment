# Task Tracker Application

A full-stack, enterprise-grade Task Tracker application designed to manage personal tasks efficiently. This project demonstrates a comprehensive understanding of modern web development, including scalable backend architecture, robust authentication, database management, caching strategies, and an elegant, responsive frontend interface.

## System Architecture

The project follows a decoupled client-server architecture:

- **Frontend:** Next.js application built with React, styled using Tailwind CSS, and optimized for both server-side rendering (SSR) and static site generation (SSG). 
- **Backend:** Node.js server powered by Express, written completely in TypeScript.
- **Database:** MongoDB for persistent document storage, governed by Mongoose ODM.
- **Caching:** Redis for high-performance in-memory caching of recurring database queries.
- **Authentication:** Custom JWT-based authentication featuring HTTP-Only secure refresh tokens, paired with Google OAuth integration via Firebase.

## Technology Stack

- **Frontend Framework:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS, Framer Motion (for animations)
- **State Management:** React Context API
- **Backend Framework:** Node.js, Express, TypeScript
- **Database:** MongoDB (Atlas), Mongoose
- **Caching Layer:** Redis (ioredis)
- **Security & Auth:** JSON Web Tokens (JWT), bcryptjs, cookie-parser, Firebase Auth
- **Testing:** Jest, Supertest (Backend), React Testing Library (Frontend Unit), Playwright (End-to-End)

## Features Implemented

1. **User Authentication:** 
   - Secure Signup and Login workflows.
   - Password hashing utilizing bcrypt.
   - Short-lived Access Tokens and long-lived Refresh Tokens stored in strict HTTP-Only cookies to prevent XSS.
   - Google Sign-In support.
2. **Task Management (CRUD):**
   - Create, Read, Update, and Delete tasks.
   - Filter tasks by status (pending or completed) and sort by due dates.
3. **Advanced Caching Strategy:**
   - User-specific task lists are aggressively cached in Redis to minimize database read operations.
   - Intelligent cache invalidation triggers instantly whenever a user mutates their personal tasks (Create/Update/Delete).
4. **Resilient UI:**
   - Optimistic UI updates ensure instantaneous feedback on user interactions before the server formally responds.
   - Responsive design scaling seamlessly across mobile, tablet, and desktop viewports.
5. **Comprehensive Testing:**
   - Over 70% branch coverage on backend microservices.
   - Automated End-to-End (E2E) UI testing.

## Prerequisites

Ensure you have the following software installed on your local machine:
- Node.js (v18 or higher)
- npm or yarn
- A running Redis server (localhost:6379 by default)
- MongoDB Database (Local instance or Atlas URI)

## Installation Guide

Clone the repository and install the required dependencies for both the frontend and backend environments.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Environment Configuration

You must configure the environment variables for both subsystems before starting the development servers.

### Backend Setup
Navigate to the `backend` directory and create a `.env` file based on the provided example:

```env
PORT=5000
MONGODB_URI=mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_secure_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Frontend Setup
Navigate to the `frontend` directory and create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## Running the Application

For the optimal development experience, run both the backend and frontend servers simultaneously in separate terminal windows.

**1. Start the Backend Server**
```bash
cd backend
npm run dev
```

**2. Start the Frontend Server**
```bash
cd frontend
npm run dev
```

The frontend application will compile and become available at `http://localhost:3000`.

## Database Seeding (Optional)

If you wish to populate your database with initial sample data and a demo user account, run the dedicated seed script from the backend directory:

```bash
cd backend
npm run seed
```

This will generate a demo user (`demo@tasktracker.com` / `demo123456`) along with several pre-configured tasks to demonstrate immediate functionality.

## Testing Documentation

The application enforces a rigorous testing standard to guarantee system stability and prevent regressions.

### Backend Testing (Jest & Supertest)
The backend test suite validates all logical controllers, middleware, and database schema permutations.

```bash
cd backend
npm run test           # Run standard test suite
npm run test:coverage  # Execute tests and output branch coverage metrics
```

### Frontend Unit Testing (React Testing Library)
Validates individual component rendering and DOM interactions.

```bash
cd frontend
npm run test
```

### End-to-End Testing (Playwright)
Executes physical chromium browser instances to validate complex user workflows (e.g., Auth processes, DOM hydration).

```bash
cd frontend
npm run test:e2e
```

## REST API Endpoints Overview

### Authentication `/api/auth`
- `POST /signup` - Register a new user
- `POST /login` - Establish session and retrieve tokens
- `GET /refresh` - Re-issue access tokens via HTTP-Only cookie
- `POST /logout` - Terminate secure session
- `POST /google` - Authenticate via Firebase Google OAuth
- `GET /me` - Retrieve current user profile
- `POST /forgot-password` - Initiate password recovery mechanism
- `POST /reset-password` - Finalize password recovery

### Tasks `/api/tasks`
- `GET /` - Retrieve all tasks for the authenticated user (Cached)
- `POST /` - Create a new task (Invalidates Cache)
- `PUT /:id` - Update an existing task (Invalidates Cache)
- `DELETE /:id` - Remove a task from the system (Invalidates Cache)
