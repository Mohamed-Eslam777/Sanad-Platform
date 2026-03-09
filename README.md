<div align="center">

# منصة سَنَد | Sanad Platform

### Community Support System — Connecting Beneficiaries with Volunteers

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

</div>

---

## 📖 About

**Sanad** (سَنَد — meaning "Support" in Arabic) is a full-stack community platform that connects people in need (**beneficiaries**) with **volunteers** who can help. Built with a modern, AI-ready architecture and a premium dark glassmorphism UI, the platform provides real-time communication, location-based assistance, and a powerful admin dashboard for oversight.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎨 **Glassmorphism UI** | Premium dark-mode interface with glass effects, glowing borders, and smooth Framer Motion animations |
| 🌌 **Logo Galaxy Loading** | Cinematic loading experience with scattered logo particles and animated gradients |
| 👥 **Dual-Role Dashboards** | Separate interfaces for beneficiaries (request help) and volunteers (offer assistance) |
| 🛡️ **Admin Control Panel** | Full admin dashboard with real-time stats, user management, and SOS alert monitoring |
| 🔔 **Real-Time Notifications** | Socket.io–powered notification system with live updates and toast alerts |
| 🆘 **SOS Emergency System** | One-tap emergency alerts with GPS location sharing and Google Maps integration |
| 🔐 **Secure Authentication** | JWT-based auth with bcrypt hashing, rate limiting, and password reset flow |
| 📱 **Fully Responsive** | Mobile-first design that works seamlessly on all screen sizes |

---

## 🛠️ Tech Stack

### Frontend

- **React 19** — Component-based UI with hooks
- **Tailwind CSS 4** — Utility-first CSS with custom design tokens
- **Framer Motion** — Production-ready animations
- **Lucide React** — Beautiful, consistent icon set
- **Axios** — HTTP client with interceptors
- **Socket.io Client** — Real-time bidirectional communication
- **Vite** — Lightning-fast development server and build tool

### Backend

- **Node.js** — JavaScript runtime
- **Express.js** — Minimalist web framework
- **Sequelize** — Promise-based ORM for MySQL
- **MySQL** — Relational database
- **Socket.io** — Real-time event-based communication
- **JWT** — Stateless authentication
- **Helmet** — Security headers
- **express-rate-limit** — Brute-force protection

---

## 📸 Screenshots

> _Screenshots coming soon — replace these placeholders with actual images._

| Landing Page | Beneficiary Dashboard |
|---|---|
| ![Landing Page](./docs/screenshots/landing.png) | ![Dashboard](./docs/screenshots/dashboard.png) |

| Admin Dashboard | Loading Screen |
|---|---|
| ![Admin](./docs/screenshots/admin.png) | ![Loading](./docs/screenshots/loading.png) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MySQL** 8.0+
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/sanad.git
cd sanad
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual database credentials and JWT secret, then start the server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Optionally create a `.env` file (the Vite dev proxy handles API routing automatically):

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## 📁 Project Structure

```
sanad/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic (auth, etc.)
│   │   └── utils/           # Validators, helpers
│   ├── app.js              # Express app setup
│   ├── server.js           # Entry point (HTTP + Socket.io)
│   └── .env.example        # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Images and static files
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context (Auth)
│   │   ├── features/        # Feature-specific components
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API & Socket clients
│   │   ├── App.jsx          # Root component + routing
│   │   └── index.css        # Global styles + design system
│   ├── tailwind.config.js   # Custom theme tokens
│   ├── vite.config.js       # Vite + proxy configuration
│   └── .env.example         # Environment template
│
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | `development` or `production` |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (default: `3306`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiration (e.g., `7d`) |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key for SOS location |
| `ALLOWED_ORIGIN` | Frontend URL for CORS |
| `FRONTEND_URL` | Frontend URL for password reset links |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## 👤 Author

**Mohamed Eslam** — Full-Stack Developer

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
