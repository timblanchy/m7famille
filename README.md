# M7 Famille

## Description

## Tech stack

### API definitions

API definition in `packages/api` using `effect`

### Backend

API implementation in `apps/backend` using `effect`

- Effect
- PostgreSQL

### Frontend

Frontend in `apps/web` using `react`

- React
- Tailwind CSS
- TanStack Router
- Shadcn UI
- Effect API client

## Dev setup

### Prerequisites

- Node.js 24+
- pnpm 10+
- docker

### Setup

1. `cp apps/backend/.env.example apps/backend/.env`
1. Generate random app secrets (use: `openssl rand -base64 32 | tr -d '=+/'`)
1. Fill in the .env files with your desired values
1. `pnpm i` to install dependencies

### Run

1. `docker compose -f docker-compose.dev.yml up -d` to start the database server
1. `pnpm dev` to start the development server

You will be able to access :

- Web application at `http://localhost:3000`
- API swagger documentation at `http://localhost:8000/docs`

