<div align="center">

# 🛡️ SecureCart

### Enterprise E-Commerce Platform — Spring Boot 3 + React 19

[![CI](https://github.com/titiksha-code/secure-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/titiksha-code/secure-ecommerce/actions)
![Java 21](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?logo=springboot&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MySQL 8.4](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

**[🌐 Live Demo](https://exciting-vision-production-5848.up.railway.app)** • **[📖 Swagger UI](https://pleasant-learning-production-a5fd.up.railway.app/swagger-ui.html)** • **[🚀 Quick Start](#-quick-start)**

</div>

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🛒 **Frontend App** | [https://exciting-vision-production-5848.up.railway.app](https://exciting-vision-production-5848.up.railway.app) |
| 📖 **Swagger / OpenAPI** | [https://pleasant-learning-production-a5fd.up.railway.app/swagger-ui.html](https://pleasant-learning-production-a5fd.up.railway.app/swagger-ui.html) |
| ⚙️ **Backend Health Probe** | [https://pleasant-learning-production-a5fd.up.railway.app/actuator/health](https://pleasant-learning-production-a5fd.up.railway.app/actuator/health) |

### Demo Accounts (pre-seeded)

| Role | Email | Password |
|------|-------|----------|
| 🔑 **Admin** | `admin@securecart.com` | `AdminSecure@2026!` |
| 👤 **Customer** | `john@example.com` | `CustomerPass@123` |

> **Note:** Running on Railway free tier — first cold-start may take ~30s.

---

## ✨ Features

### Security Architecture
- **JWT Auth** — 15-min access tokens + HttpOnly rotating refresh cookies (7-day)
- **Refresh Token Family Rotation** — Replay attack detection; reuse revokes entire token family
- **Login Rate Limiting** — 5 attempts per 5-minute window (configurable)
- **Pessimistic Stock Locking** — `SELECT FOR UPDATE` in ascending ID order; zero deadlock risk under flash-sale concurrency
- **Idempotent Checkout** — UUID `Idempotency-Key` header prevents duplicate orders on retries
- **Spring Security RBAC** — `ROLE_ADMIN` / `ROLE_CUSTOMER` with method-level `@PreAuthorize`
- **BCrypt (cost=12)** password hashing

### E-Commerce Functionality
- Product catalog with full-text search, category filter, sort, paginated results
- Persistent per-user shopping cart
- One-page checkout with confetti on success 🎉
- Complete order history with status tracking
- Admin dashboard: metrics, product/category CRUD, order management

### Engineering Quality
- Flyway versioned migrations (V1 schema + V2 seed)
- OpenAPI 3 / Swagger UI
- Price snapshots on order items (historical accuracy)
- Docker Compose one-command stack
- GitHub Actions CI/CD pipeline

---

## 🏗 Architecture

```
Browser (React 19 + Vite)
   └── HTTP + JWT Bearer Token
         └── Spring Boot 3 REST API (:8080)
               ├── SecurityFilterChain (JWT filter, RBAC, CORS)
               ├── Controllers (10)
               ├── Services (7) + Repositories
               └── MySQL 8.4 via Flyway + Hibernate
```

### Database Schema
```
users ──┬── carts ──── cart_items ──── products ──── categories
        ├── orders ─── order_items (price snapshot)
        ├── refresh_tokens (rotating family)
        └── idempotency_keys
```

---

## 🚀 Quick Start

### Option A — Docker Compose (Recommended)

```bash
git clone https://github.com/titiksha-code/secure-ecommerce.git
cd secure-ecommerce
cp .env.example .env          # Edit credentials if needed
docker compose up -d          # MySQL + Backend + Frontend
open http://localhost          # App ready!
```

> First build ~3-5 min (Maven). Subsequent starts are instant.

### Option B — Local Dev

```bash
# Terminal 1: Backend
cd backend
docker run -d -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=securecart_db -p 3306:3306 mysql:8.4
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
# → http://localhost:8080  |  Swagger: http://localhost:8080/swagger-ui.html

# Terminal 2: Frontend
cd frontend
npm install && npm run dev
# → http://localhost:5173
```

---

## 📁 Project Structure

```
secure-ecommerce/
├── backend/
│   ├── src/main/java/com/securecart/
│   │   ├── config/          # App config, DataSeeder
│   │   ├── controller/      # 10 REST controllers
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # 11 JPA entities
│   │   ├── exception/       # Custom exceptions + GlobalExceptionHandler
│   │   ├── mapper/          # Entity ↔ DTO mappers
│   │   ├── repository/      # Spring Data JPA repos
│   │   ├── security/        # JWT filter, SecurityConfig, UserDetails
│   │   └── service/         # 7 business logic services
│   ├── src/main/resources/
│   │   ├── db/migration/    # V1 schema, V2 seed data
│   │   └── application*.yml # Base + dev + test profiles
│   └── Dockerfile           # Multi-stage Maven → JRE Alpine
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # Fetch + JWT refresh interceptor
│   │   ├── components/      # Navbar, Footer, ProductCard, ProductDetailModal
│   │   ├── context/         # AuthContext, CartContext, ToastContext
│   │   ├── pages/           # Storefront, Admin, Profile, Auth, Cart, Checkout
│   │   ├── index.css        # Glassmorphism CSS design system
│   │   └── App.jsx
│   ├── Dockerfile           # Nginx production build
│   └── nginx.conf           # SPA routing + /api proxy
│
├── .github/workflows/ci.yml # CI/CD pipeline
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔐 Security Deep-Dive

### JWT Flow
```
Login ──► { accessToken (15min), refreshToken cookie (HttpOnly, 7d) }
API call ──► Authorization: Bearer <token>
   401 ──► POST /auth/refresh (cookie auto-sent)
              └──► New accessToken + rotated cookie
```

### Idempotent Checkout
```
Client sends UUID Idempotency-Key header
   ▼
Server checks idempotency_keys table
   ├── EXISTS → return cached order (200 OK)
   └── NEW
        ├── Lock products SELECT FOR UPDATE (asc ID order → no deadlocks)
        ├── Validate + deduct stock
        ├── Create order with price snapshots
        ├── Clear cart
        ├── Save idempotency key
        └── Return order
```

---

## 📖 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | Public | Register customer |
| POST | `/api/v1/auth/login` | Public | Login → JWT |
| POST | `/api/v1/auth/refresh` | Cookie | Rotate refresh token |
| GET | `/api/v1/products` | Public | Paginated catalog |
| GET | `/api/v1/categories` | Public | Category list |
| GET/POST/PATCH/DELETE | `/api/v1/cart/**` | Customer | Cart management |
| POST | `/api/v1/orders/checkout` | Customer | Idempotent checkout |
| GET | `/api/v1/orders` | Customer | Order history |
| GET | `/api/v1/admin/dashboard` | Admin | Metrics |
| POST | `/api/v1/admin/products` | Admin | Create product |
| PATCH | `/api/v1/admin/orders/{id}/status` | Admin | Update order status |

Full docs: http://localhost:8080/swagger-ui.html

---

## 🧪 Tests

```bash
cd backend
./mvnw test      # H2 in-memory, no external deps required
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.3.4 |
| Security | Spring Security 6, JJWT 0.12.6 |
| Database | MySQL 8.4, JPA/Hibernate, Flyway |
| API Docs | SpringDoc OpenAPI 3 / Swagger UI |
| Frontend | React 19, Vite 8 |
| Styling | Vanilla CSS, Glassmorphism |
| Icons | Lucide React |
| Container | Docker, Docker Compose, Nginx |
| CI/CD | GitHub Actions |
| Hosting | Railway |

---

## 📄 License

MIT © [titiksha-code](https://github.com/titiksha-code)
