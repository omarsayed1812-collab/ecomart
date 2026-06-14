# 🌿 EcoMart — Sustainable E-Commerce Marketplace

A full-stack marketplace connecting conscious shoppers with eco-friendly products from verified companies. Built with a **MongoDB + Express** backend and a **React + Vite + Tailwind** frontend, organized into `backend/` and `frontend/` folders.

## ✨ Features

- **Three roles** — Customers (shop, cart, wishlist, orders), Companies (submit products for approval, view analytics), Admins (approve/reject companies & product requests).
- **Admin approval workflow** — companies apply to sell; product add/edit/delete go through a review queue before going live.
- **Sustainability data** — per-product eco score, eco badges, and carbon-saved tracking.
- **JWT authentication** with hashed passwords.
- **File uploads** for product images (served from the backend).
- **Analytics dashboards** with charts (revenue, views, category breakdown).

## 🗂 Project Structure

```
ecomart/
├── backend/        # Express + Mongoose REST API
│   ├── config/     # MongoDB connection
│   ├── middleware/ # auth + error handling
│   ├── models/     # Mongoose schemas
│   ├── routes/     # API endpoints
│   ├── utils/      # query helper, seed script, toJSON
│   └── server.js   # app entry point
└── frontend/       # React + Vite + Tailwind SPA
    └── src/
        ├── api/        # API client (entity SDK)
        ├── components/ # UI primitives, layout, shared
        ├── lib/        # auth context, utils, motion presets
        └── pages/      # routes (customer, company, admin)
```

## 🔧 Prerequisites

- **Node.js 18+**
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string.

## 🚀 Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit values as needed
npm run seed                # creates demo users + sample products
npm run dev                 # starts API on http://localhost:5000
```

`.env` values:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecomart
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=7d
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # starts app on http://localhost:5173
```

## 👤 Demo Accounts (after `npm run seed`)

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@ecomart.com    | admin123    |
| Company  | company@ecomart.com  | company123  |
| Customer | customer@ecomart.com | customer123 |

New sign-ups choose to shop as a **Customer** or apply as a **Company** (pending admin approval).

## 🔌 API Overview

| Method | Endpoint                       | Notes                                   |
|--------|--------------------------------|-----------------------------------------|
| POST   | `/api/auth/register`           | Create account, returns JWT             |
| POST   | `/api/auth/login`              | Returns JWT                             |
| GET    | `/api/auth/me`                 | Current user                            |
| GET    | `/api/products`                | Filter by `status`, `category`, `sort`  |
| POST   | `/api/company-applications`    | Apply to become a company               |
| POST   | `/api/product-requests`        | Company submits add/edit/delete request |
| PATCH  | `/api/product-requests/:id`    | Admin approve/reject (executes change)  |
| POST   | `/api/orders`                  | Place order (updates stats, clears cart)|
| POST   | `/api/upload`                  | Multipart image upload                  |

All data routes require an `Authorization: Bearer <token>` header.

## 🧠 Business Logic Highlights

- Approving a **company application** flips the applicant's account to `company`.
- Approving a **product request** performs the actual add/edit/delete on the catalog.
- Placing an **order** increments product `orders_count` / `revenue`, sums carbon saved, and clears the user's cart.
- Customers can only increment a product's view counter; all other product edits are admin-only.

## 🛠 Tech Stack

**Backend:** Node.js, Express, Mongoose, JWT, bcrypt, Multer.
**Frontend:** React, Vite, React Router, TanStack Query, Tailwind CSS, Framer Motion, Recharts, lucide-react, sonner.

---

Made for shopping better for the planet. 🌍
