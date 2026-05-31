# SmartEX

Product catalog SaaS built with Angular 21, NestJS, PostgreSQL and Docker.

## Stack

| Layer    | Technology             |
| -------- | ---------------------- |
| Frontend | Angular 21 + Material  |
| Backend  | NestJS                 |
| Database | PostgreSQL 16 (Docker) |
| ORM      | TypeORM + Migrations   |
| Auth     | JWT (1h access token)  |

## Features

- Register / login with JWT authentication
- Products: create, edit, delete, search, filter by category, pagination (12/24/48)
- Categories: create, edit, delete, search
- Products linked to one or more categories (many-to-many)
- Per-user isolation: each user sees only their own data

## Prerequisites

- Node.js 20+
- npm 11+
- Docker Desktop

## Setup & Run

### 1. Database

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run migration:run
npm run seed
npm run start:dev
```

API available at `http://localhost:3000`

Default backend environment:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5434
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=smartex
JWT_SECRET=change-me
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:4200
```

### 3. Frontend

```bash
cd frontend
npm install
npm run start
```

App available at `http://localhost:4200`

## Seed credentials

| Field    | Value             |
| -------- | ----------------- |
| Email    | admin@smartex.com |
| Password | Admin123!         |

The seed also creates 12 categories and 52 products linked to the admin account.

## API Routes

All routes except `/auth/*` require `Authorization: Bearer <token>`.

```http
GET    /health

POST   /auth/register
POST   /auth/login

GET    /users

GET    /categories
POST   /categories
GET    /categories/:id
PATCH  /categories/:id
DELETE /categories/:id

GET    /products?page=1&limit=24&search=&categoryId=
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
```

## Verification

Backend:

```bash
cd backend
npm run test        # 38 unit tests
npm run test:cov    # coverage report
npm run lint        # backend lint
npm run build       # backend production build
```

Frontend:

```bash
cd frontend
npm run build       # frontend production build
```
