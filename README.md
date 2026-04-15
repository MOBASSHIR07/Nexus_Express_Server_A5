# 🚀 Nexus Express - Advanced Delivery Management Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

**Nexus Express** is a robust, scalable backend solution for a modern delivery and logistics platform. It manages the entire parcel lifecycle—from initial booking and secure payment to rider assignment, real-time tracking, and final delivery. 

Built with **TypeScript** and **Node.js**, it leverages **Prisma ORM** for type-safe database interactions and **Better-Auth** for secure, industry-standard authentication.

---

## 🏗️ Core Architecture & Features

### 👤 User Management
*   **Role-Based Access Control (RBAC)**: Distinct permissions for `SENDER`, `RIDER`, and `ADMIN`.
*   **Secure Authentication**: Fully integrated with **Better-Auth** supporting multi-session management and secure token handling.
*   **Profile Services**: Robust user profiles with activity tracking and history.

### 📦 Parcel & Logistics
*   **Lifecycle Management**: Automated transitions through `PENDING`, `RIDER_ASSIGNED`, `ACCEPTED`, `PICKED_UP`, `IN_TRANSIT`, and `DELIVERED`.
*   **Dynamic Assignment**: Intelligent rider assignment based on availability and location.
*   **Real-time Tracking**: Granular tracking steps with location updates and status messages.

### 🚴 Rider Ecosystem
*   **Application Workflow**: Streamlined onboarding for new riders.
*   **Earning Dashboard**: Automated rider payment tracking per successful delivery.
*   **Withdrawal System**: Secure payout requests via Bank, bKash, Nagad, or Rocket.

### 💳 Payments & Security
*   **Stripe Integration**: Secure checkout flows for parcel payments.
*   **Webhooks**: Real-time payment verification and automated status updates.
*   **Zod Validation**: Strict schema validation for all API inputs to ensure data integrity.

### 📧 Automated Notifications
*   **Email Engine**: Powered by **Nodemailer** with dynamic **EJS** templates for rider assignments, payment receipts, and delivery confirmations.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Runtime** | [Node.js](https://nodejs.org/) |
| **Framework** | [Express.js](https://expressjs.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Auth** | [Better-Auth](https://github.com/better-auth/better-auth) |
| **Payment Gateway** | [Stripe](https://stripe.com/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Email** | [Nodemailer](https://nodemailer.com/) |

---

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v18 or higher)
*   **PostgreSQL** instance
*   **Stripe** Account (for payments)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/MOBASSHIR07/Nexus_Express_Server_A5.git
cd Nexus_Express_Backend_A5
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and populate it with the following keys:
```env
PORT=3000
DATABASE_URL="your-postgresql-url"
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="your-stripe-secret"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### 3. Database Setup
Initialize the database and generate Prisma Client:
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Running the Project
```bash
# Development mode (with hot-reloading)
npm run dev

# Production Build
npm run build
npm start
```

---

## 🛣️ API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/*` | Authentication endpoints (Better-Auth) |
| `GET` | `/api/parcel` | Get all parcels (Admin/User filtered) |
| `POST` | `/api/parcel` | Create a new parcel booking |
| `PATCH` | `/api/rider/status` | Update rider availability |
| `GET` | `/api/admin/stats` | Business intelligence & dashboard stats |
| `POST` | `/api/pay/create-checkout` | Initialize Stripe session |

---

## 📁 Project Structure

```text
.
├── prisma/
│   ├── schema.prisma          # Database models & relationships
│   └── migrations/            # SQL migration history
├── src/
│   ├── lib/
│   │   ├── auth.ts            # Better-Auth configuration
│   │   └── prisma.ts          # Global Prisma client instance
│   ├── middleware/
│   │   ├── globalErrorHandler.ts # Centralized error handling
│   │   └── validateRequest.ts  # Zod schema validation middleware
│   ├── modules/
│   │   ├── admin/             # Admin dashboard & user management
│   │   ├── auth/              # Authentication controllers & routes
│   │   ├── parcel/            # Parcel booking & lifecycle management
│   │   ├── payment/           # Stripe integration & webhooks
│   │   ├── review/            # User reviews for riders
│   │   └── rider/             # Rider profiles, earnings & status
│   ├── utils/
│   │   ├── catchAsync.ts      # Async wrapper for controllers
│   │   ├── sendEmail.ts       # Nodemailer service
│   │   └── queryHelpers.ts    # Database query abstractors
│   ├── views/
│   │   └── emails/            # EJS notification templates
│   ├── app.ts                 # Express app configuration
│   └── server.ts              # Entry point & server listener
├── .env.example               # Environment variables template
├── package.json               # Dependencies & scripts
└── tsconfig.json              # TypeScript configuration
```

---

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ by <b>Mobasshir</b></p>
