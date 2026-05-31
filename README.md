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
- Products — create, edit, delete, search, filter by category, pagination (12/24/48)
- Categories — create, edit, delete, search
- Products linked to one or more categories (many-to-many)
- Per-user isolation — each user sees only their own data

## Prerequisites

- Node.js 20+
- Docker Desktop
- Angular CLI 21 (`npm install -g @angular/cli`)

## Setup & Run

### 1. Database

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```

API available at `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
ng serve
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

```
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

## Tests

```bash
cd backend
npm run test        # 37 unit tests
npm run test:cov    # coverage report
```
