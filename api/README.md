# 🎬 Watched It — API

The backend for Watched It, built with NestJS. This document covers the project structure, setup, architecture decisions, and available endpoints.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
  - [Auth Flow](#auth-flow)
  - [Guards](#guards)
- [API Endpoints](#api-endpoints)
---

## Tech Stack

| Purpose        | Technology                                              |
|----------------|---------------------------------------------------------|
| Framework      | [NestJS](https://nestjs.com/)                           |
| Language       | TypeScript                                              |
| Auth           | [Supabase Auth](https://supabase.com/docs/guides/auth) |
| Database       | Supabase (Postgres)                                     |
| Runtime        | Node.js                                                 |
| Containerization | Docker                                                |

---

## Project Structure

```
api/
├── src/
│   ├── app/          # Root module and app bootstrap
│   ├── auth/         
│   ├── config/       # Environment config
│   ├── movie/        
│   ├── show/         
│   └── user/        
│   └── main.ts       # Application entry point
├── .env              # Local environment variables (not committed)
├── .env.example      # Environment variable template
├── Dockerfile        # Container definition
└── nest-cli.json     # NestJS CLI config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project with Auth enabled

### Installation

```bash
cd api
npm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase service role key |
|`SUPABASE_JWT_PUBLIC_KEY` | Secret used to verify Supabase JWTs server-side |

### Running locally

```bash
# Development (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Running with Docker

```bash
docker build -t watched-it-api ./api
docker run --env-file ./api/.env -p 3000:3000 watched-it-api
```

---

## Architecture

### Auth Flow

Authentication is delegated entirely to **Supabase Auth**. The API does not store passwords or manage sessions directly.

1. The client calls `POST /api/auth/signin` or `POST /api/auth/signup` with credentials.
2. The `auth` module forwards the request to Supabase and returns the session JWT to the client.
3. For protected routes, the client includes the JWT in the `Authorization: Bearer <token>` header.
4. The auth guard validates the token against Supabase on every request before the route handler runs.

### Guards

Protected routes use a NestJS guard that calls Supabase to verify the incoming JWT. If the token is missing, expired, or invalid, the guard returns a `401 Unauthorized` before the request reaches the controller.

Routes under `/api/auth` (sign in, sign up) are public and bypass the guard.

---

## API Endpoints

Base URL: `http://localhost:3000/api`

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | No | Health check |

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signin` | No | Sign in with email and password |
| `POST` | `/auth/signup` | No | Register a new account |
| `POST` | `/auth/forgot-password` | No | Send an email to the user to change the password |
| `POST` | `/auth/reset-password` | Yes | Change the password |

### User

| Method | Path | Auth | Description |
|---|---|---|---|
| `PATCH` | `/user/profile-picture` | Yes | Update the authenticated user's profile picture |
| `POST` | `/user/favorites` | Yes | Add a movie or show to favorites |
| `POST` | `/user/rating` | Yes | Add a rating and a review (optional) of a movie or show |

### Movie

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/movie/` | No | Get a list of movies |


### Show

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/show/` | No | Get a list of shows |

### Catalog

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/catalog/` | No | Get a list of shows and movies mixed |