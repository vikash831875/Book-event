# BookIt - Event Booking Platform

A full-stack event booking platform built with React, Node.js, Express, PostgreSQL, and Prisma ORM. Users can browse and book events; organizers can create events, manage attendees, and view analytics.

## Tech Stack

**Frontend:** React (Vite), React Router DOM, Redux Toolkit, Axios, Tailwind CSS, React Hook Form

**Backend:** Node.js, Express.js, JWT Authentication, bcryptjs

**Database:** PostgreSQL with Prisma ORM

## Project Structure

```
BookIt/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── app.js
│       └── server.js
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── store/
│       ├── App.jsx
│       └── main.jsx
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd BookIt
```

### 2. PostgreSQL Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE bookit;
```

Or using psql:

```bash
psql -U postgres
CREATE DATABASE bookit;
\q
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Copy the environment file and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/bookit?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

### 4. Prisma Migration

Generate and apply database migrations:

```bash
npx prisma migrate dev --name init
```

### 5. Prisma Seed

Populate the database with sample data:

```bash
npx prisma db seed
```

### 6. Frontend Setup

```bash
cd ../frontend
npm install
```

Copy the environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:3000`

## Environment Variables

### Backend

| Variable       | Description                    |
|----------------|--------------------------------|
| `PORT`         | Server port (default: 5000)    |
| `DATABASE_URL` | PostgreSQL connection string   |
| `JWT_SECRET`   | Secret key for JWT signing     |

### Frontend

| Variable       | Description              |
|----------------|--------------------------|
| `VITE_API_URL` | Backend API base URL     |

## Demo Credentials

After seeding the database:

| Role      | Email               | Password     |
|-----------|---------------------|--------------|
| Organizer | sarah@bookit.com    | password123  |
| Organizer | michael@bookit.com  | password123  |
| User      | user1@bookit.com    | password123  |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - List upcoming events (search, date filter, pagination)
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/book` - Book event (User only)

### Bookings
- `GET /api/bookings/me` - Get user's bookings
- `DELETE /api/bookings/:id` - Cancel booking

### Organizer
- `GET /api/organizer/dashboard` - Dashboard stats
- `POST /api/organizer/events` - Create event
- `PATCH /api/organizer/events/:id` - Update event
- `GET /api/organizer/events` - List organizer events
- `GET /api/organizer/events/:id/attendees` - Event attendees
- `GET /api/organizer/events/:id/analytics` - Event analytics

## Features

### User
- Register, login, logout
- Browse events with search, date filter, and pagination
- View event details with remaining seats
- Book one seat per event (with transaction-safe concurrency)
- View and cancel bookings

### Organizer
- Dashboard with total events, bookings, and revenue
- Create and edit events
- View events with seats sold and revenue
- Attendee list per event
- Analytics with views, bookings, and conversion rate

### Concurrency Safety
Booking uses PostgreSQL `SELECT ... FOR UPDATE` row locking inside a serializable transaction to prevent overbooking when multiple users book simultaneously.

## License

MIT
