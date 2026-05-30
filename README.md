# SmartEX

Product catalog SaaS application built with Angular 20, NestJS, PostgreSQL and Docker.

## Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Frontend | Angular 20 + Material   |
| Backend  | NestJS                  |
| Database | PostgreSQL 16 (Docker)  |
| ORM      | TypeORM + Migrations    |
| Auth     | JWT (1h access token)   |

## Prerequisites

- Node.js 20+
- Docker Desktop
- Angular CLI 20 (`npm install -g @angular/cli`)

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

API available at: `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
ng serve
```

App available at: `http://localhost:4200`

## Test credentials (seed)

| Field    | Value             |
| -------- | ----------------- |
| Email    | admin@smartex.com |
| Password | Admin123!         |

## API Routes

```
POST   /auth/register
POST   /auth/login

GET    /users/me

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
npm run test
npm run test:cov
```
