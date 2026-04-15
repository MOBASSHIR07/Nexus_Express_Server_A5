# 🚀 Nexus Express - Advanced Delivery Management Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

**Nexus Express** is a professional-grade delivery and logistics ecosystem. It manages the entire parcel lifecycle—from intelligent dynamic pricing and Stripe-integrated payments to automated rider assignments and recursive tracking. Built for performance and security, it provides tailored dashboards for Senders, Riders, and Administrators.

Built with **TypeScript** and **Node.js**, it leverages **Prisma ORM** for type-safe database interactions and **Better-Auth** for secure, industry-standard authentication.

---

## ⚙️ Business Logic & Workflow

### 💰 Intelligent Pricing Model
The system automatically calculates delivery costs based on parcel category and weight:
*   **Standard Parcel**: Flat rate of **$200** (just an example).
*   **Cargo/Heavy**: Dynamic pricing based on weight. (**$100 per unit**)  just an example.

### 💳 Payment & Security
*   **Checkout Flow**: Parcels are created in a `PENDING` state. The API initiates a **Stripe Checkout Session** immediately.
*   **Verification**: Only paid parcels are eligible for rider assignment.
*   **Integrity**: Zod schemas enforce strict data types, ensuring no malformed data enters the database.

### 🚴 Rider Commission & Payouts
*   **Standard Earnings**: Riders earn a fixed **$50** per successful delivery.
*   **Cargo Commission**: Riders receive **30% of the total delivery fee** for cargo items.
*   **Withdrawals**: Riders can track their `withdrawableBalance` and request payouts via Bank, bKash, or Nagad once their earnings are approved.

### 📍 Recursive Tracking System
*   **Historical Steps**: Every status change (Assigned -> Accepted -> Picked Up -> Delivered) is logged as a `TrackingStep` with a timestamp and location.
*   **Public Access**: Senders can track their parcels via a unique `trackingCode` without needing to log in.

---

## 🏗️ Core Module Functionality

### 👤 User Module (Sender)
*   **Booking**: Create parcel requests with detailed receiver info.
*   **Dashboard**: Monitor active deliveries and historical payments.
*   **Reviews**: Provide feedback and ratings to riders post-delivery.

### 🚴 Rider Module
*   **Application**: Submit onboarding requests with vehicle details and region.
*   **Responses**: Accept or Reject assigned parcels based on availability.
*   **Lifecycle**: Update parcel status (Picked Up, In Transit, Delivered) in real-time.

### 🛡️ Admin Module
*   **Control Center**: Approve new riders and manage user roles (Ban/Unban).
*   **Logistics**: Manually assign riders to paid parcels based on load and location.
*   **Financials**: Review and approve rider withdraw requests.
*   **Business Intelligence**: High-level statistics on revenue, profit, and delivery volume.

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
Distributed under the **MIT License**. See the [LICENSE](LICENSE) file for the full legal text.

---

<p align="center">Made with ❤️ by <b>Mobasshir</b></p>
