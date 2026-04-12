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
- [Deployment](#deployment)

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

> 📖 Each part of the project has its own detailed README:
> - **Mobile:** [`mobile/README.md`](./mobile/README.md) — setup, accessibility standards, and testing
> - **API:** [`api/README.md`](./api/README.md) — endpoints, architecture, and environment config

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

## Deployment

The API is deployed on [Render](https://render.com):

🚀 **Production URL:** `https://watched-it-api.onrender.com/api/`

> ⚠️ The free tier spins down after 15 minutes of inactivity. The first request may take 30–60 seconds to respond.

---
