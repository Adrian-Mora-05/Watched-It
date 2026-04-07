# 🎬 Watched It

> A social mobile app for tracking movies & shows, getting personalized recommendations, and chatting with friends about what to watch next.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running with Docker](#running-with-docker)
  - [Running the Mobile App](#running-the-mobile-app)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | [Expo](https://expo.dev/) (React Native) |
| Backend API | [NestJS](https://nestjs.com/) |
| Containerization | [Docker](https://www.docker.com/) & Docker Compose |

---

## Architecture

```
watched-it/
├── api/            # NestJS REST API
├── mobile/         # Expo (React Native) app
└── shared/         # Shared types & validation schemas
```

The backend is a NestJS application containerized with Docker. The mobile app is built with Expo and communicates with the backend via REST API. Both ends share a common `shared/` package for TypeScript types and validation schemas, keeping the contract between frontend and backend consistent and type-safe.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) & Docker Compose
- [Expo Go](https://expo.dev/go/) on your phone

---

### Environment Variables

Create a `.env` file in the `api/` directory based on the example below:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

### Running with Docker

From the root of the project, start the backend with Docker Compose:

```bash
docker compose up --build
```

The API will be available at `http://localhost:3000/api`.

To stop the containers:

```bash
docker compose down
```

---

### Running the Mobile App

Navigate to the `mobile/` directory and install dependencies:

```bash
cd mobile
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Then scan the QR code with the **Expo Go** app on your phone, or press:
- `a` to open on an Android emulator
- `i` to open on an iOS simulator

> Make sure your mobile device and development machine are on the same network.

---

## Project Structure

```
watched-it/
├── shared/               # Shared between api & mobile
│
├── api/
│   ├── src/
│   │   ├── app/
│   │   ├── main.ts
│   │   └── ...           # Feature modules
│   ├── Dockerfile
│   └── .env
│
├── mobile/
│   ├── app/              # Expo Router screens
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service calls
│   └── app.json
│
└── docker-compose.yml
```

> The `shared/` package is referenced locally by both `api/` and `mobile/` via their `package.json`. Any type or validation change made in `shared/` is instantly reflected across the entire project.

---

## Deployment

The API is deployed on [Render](https://render.com):

🚀 **Production URL:** `https://watched-it-api.onrender.com/api/`

> ⚠️ The free tier spins down after 15 minutes of inactivity. The first request may take 30–60 seconds to respond.

---

## API Documentation

Base URL (local): `http://localhost:3000/api`  
Base URL (production): `https://watched-it-api.onrender.com/api/`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Create user with authentication |

> 📝 Full API documentation coming soon.
