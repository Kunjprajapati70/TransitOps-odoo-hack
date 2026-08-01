# 🚌 TransitOps — Transport Management System

> **ODOO Hackathon Project** | A full-stack Transport Management System built for operational efficiency and real-time fleet oversight.

![TransitOps](https://img.shields.io/badge/TransitOps-Transport%20Management-blue?style=for-the-badge&logo=bus&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
  - [Seeding the Database](#seeding-the-database)
- [API Reference](#-api-reference)
- [Modules](#-modules)
- [Screenshots](#-screenshots)
- [Team Members](#-team-members)
- [Acknowledgements](#-acknowledgements)

---

## 🚀 About the Project

**TransitOps** is a comprehensive, production-ready Transport Management System (TMS) developed as part of the **ODOO Hackathon**. It provides transport companies with a centralized platform to manage their entire fleet operation — from vehicle tracking and driver management to trip scheduling, fuel logging, maintenance records, and business analytics.

The system features a **role-based access control (RBAC)** model with secure JWT authentication, a RESTful API backend, and a responsive React dashboard with real-time data visualization.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | JWT-based login with bcrypt password hashing |
| 🚗 **Fleet Management** | Full CRUD for vehicles — status, registration, capacity |
| 👨‍✈️ **Driver Management** | Driver profiles, license tracking, assignment status |
| 🗺️ **Trip Management** | Schedule, track, and close trips with route & passenger data |
| 🔧 **Maintenance Logs** | Record and monitor vehicle service history |
| ⛽ **Fuel & Expense Tracker** | Log fuel fills and operational expenses per vehicle |
| 📊 **Analytics Dashboard** | KPIs, charts, and exportable reports (CSV/PDF) |
| 🔔 **Notifications** | System-level alerts for operational events |
| 📱 **Responsive UI** | Mobile-friendly React dashboard with TailwindCSS |
| 🛡️ **Protected Routes** | Frontend route guards based on authentication state |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│              React 19 + TailwindCSS + Chart.js                  │
└─────────────────────────────┬──────────────────────────────────┘
                              │ HTTP / REST API (Axios)
┌─────────────────────────────▼──────────────────────────────────┐
│                      BACKEND (Node.js)                          │
│               Express.js REST API Server (:5000)                │
│                                                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│   │   Auth   │ │ Vehicles │ │ Drivers  │ │  Trips / Maint.  │ │
│   │  Routes  │ │  Routes  │ │  Routes  │ │  Fuel / Analytics│ │
│   └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
│                                                                 │
│              JWT Middleware + CORS + Body Parser                │
└─────────────────────────────┬──────────────────────────────────┘
                              │ Mongoose ODM
┌─────────────────────────────▼──────────────────────────────────┐
│                       DATABASE (MongoDB)                        │
│     Users │ Vehicles │ Drivers │ Trips │ Maintenance           │
│     FuelLogs │ Expenses │ Notifications                         │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18.x | Runtime Environment |
| **Express.js** | 4.19.x | REST API Framework |
| **MongoDB** | Atlas | NoSQL Database |
| **Mongoose** | 8.3.x | ODM / Schema Modeling |
| **JSON Web Token** | 9.0.x | Authentication |
| **bcryptjs** | 2.4.x | Password Hashing |
| **PDFKit** | 0.15.x | PDF Report Generation |
| **json2csv** | 6.0.x | CSV Export |
| **Multer** | 1.4.x | File Uploads |
| **dotenv** | 16.4.x | Environment Config |
| **nodemon** | 3.1.x | Dev Auto-Reload |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI Framework |
| **Vite** | 8.x | Build Tool & Dev Server |
| **TailwindCSS** | 3.4.x | Utility-First Styling |
| **Chart.js** | 4.4.x | Data Visualization |
| **react-chartjs-2** | 5.2.x | React Chart Bindings |
| **Lucide React** | 0.468.x | Icon Library |
| **Axios** | 1.7.x | HTTP Client |

---

## 📁 Project Structure

```
ODOO Heckathon/
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── controllers/                # Request handlers per module
│   ├── middleware/                 # JWT auth, error handling
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Driver.js
│   │   ├── Trip.js
│   │   ├── MaintenanceLog.js
│   │   ├── FuelLog.js
│   │   ├── Expense.js
│   │   └── Notification.js
│   ├── routes/                     # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   ├── fuelExpenseRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── analyticsRoutes.js
│   ├── services/                   # Business logic / analytics
│   ├── utils/                      # Helper utilities
│   ├── seed.js                     # Database seeder script
│   ├── server.js                   # App entry point
│   └── package.json
│
└── frontend/                       # React + Vite SPA
    ├── public/                     # Static assets
    ├── src/
    │   ├── assets/                 # Images, icons
    │   ├── components/
    │   │   └── ProtectedRoute.jsx  # Auth route guard
    │   ├── context/                # React Context (auth state)
    │   ├── layouts/                # Shared layout wrappers
    │   ├── pages/
    │   │   ├── Login.jsx           # Authentication page
    │   │   ├── Dashboard.jsx       # KPI overview
    │   │   ├── Fleet.jsx           # Vehicle management
    │   │   ├── Drivers.jsx         # Driver management
    │   │   ├── Trips.jsx           # Trip scheduling & tracking
    │   │   ├── Maintenance.jsx     # Service records
    │   │   ├── FuelExpenses.jsx    # Fuel & cost tracking
    │   │   ├── Analytics.jsx       # Reports & charts
    │   │   └── Settings.jsx        # App configuration
    │   ├── services/               # Axios API service layer
    │   ├── App.jsx                 # Router & layout
    │   └── main.jsx                # App bootstrap
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (v9 or higher) — comes with Node.js
- **MongoDB Atlas** account or a local MongoDB instance — [Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** — [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/transitops.git
   cd transitops
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/transitops?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

> ⚠️ **Never commit your `.env` file to version control.**

### Running the Application

**Start the Backend (Development Mode)**
```bash
cd backend
npm run dev
```
The API server will start at: `http://localhost:5000`

**Start the Frontend (Development Mode)**
```bash
cd frontend
npm run dev
```
The React app will start at: `http://localhost:5173`

### Seeding the Database

To populate the database with sample operational data:

```bash
cd backend
npm run seed
```

This will create sample vehicles, drivers, trips, maintenance records, and fuel logs for testing.

---

## 📡 API Reference

All API endpoints are prefixed with `/api`.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Vehicles (Fleet)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles` | List all vehicles |
| `POST` | `/api/vehicles` | Add a new vehicle |
| `GET` | `/api/vehicles/:id` | Get vehicle details |
| `PUT` | `/api/vehicles/:id` | Update vehicle |
| `DELETE` | `/api/vehicles/:id` | Remove vehicle |

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/drivers` | List all drivers |
| `POST` | `/api/drivers` | Add a new driver |
| `GET` | `/api/drivers/:id` | Get driver details |
| `PUT` | `/api/drivers/:id` | Update driver |
| `DELETE` | `/api/drivers/:id` | Remove driver |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips` | List all trips |
| `POST` | `/api/trips` | Schedule a new trip |
| `GET` | `/api/trips/:id` | Get trip details |
| `PUT` | `/api/trips/:id` | Update trip |
| `DELETE` | `/api/trips/:id` | Remove trip |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/maintenance` | List maintenance logs |
| `POST` | `/api/maintenance` | Add maintenance record |
| `PUT` | `/api/maintenance/:id` | Update record |
| `DELETE` | `/api/maintenance/:id` | Delete record |

### Fuel & Expenses
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/fuel-expenses/fuel` | List fuel logs |
| `POST` | `/api/fuel-expenses/fuel` | Add fuel log |
| `GET` | `/api/fuel-expenses/expenses` | List expenses |
| `POST` | `/api/fuel-expenses/expenses` | Add expense |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/kpis` | Get dashboard KPIs |
| `GET` | `/api/analytics/report` | Generate report (CSV/PDF) |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | List notifications |
| `PUT` | `/api/notifications/:id/read` | Mark as read |

---

## 📦 Modules

### 🏠 Dashboard
- Real-time KPI cards: Total Vehicles, Active Drivers, Ongoing Trips, Monthly Expenses
- Quick overview of fleet utilization and recent activity

### 🚗 Fleet Management
- Add, edit, and retire vehicles
- Track vehicle status: Active, In Maintenance, Retired
- Vehicle details: registration, capacity, model, year

### 👨‍✈️ Driver Management
- Manage driver profiles and contact information
- Track license validity and assignment status
- Assign/unassign drivers to vehicles

### 🗺️ Trip Management
- Schedule trips with origin, destination, and timing
- Assign vehicles and drivers to trips
- Track trip status: Scheduled → In Progress → Completed

### 🔧 Maintenance
- Log service events per vehicle
- Track service type, cost, and next service due date
- Filter by vehicle and date range

### ⛽ Fuel & Expense Tracking
- Record fuel fill-ups with quantity, cost, and odometer readings
- Log operational expenses by category
- View cost trends per vehicle

### 📊 Analytics & Reporting
- Interactive bar, line, and pie charts (Chart.js)
- Trip completion rates, fleet utilization, and expense breakdowns
- Export reports as **PDF** or **CSV**

---

## 👨‍💻 Team Members

Meet the amazing team behind **TransitOps**:

| # | Name | Role |
|---|---|---|
| 1 | **Kunj Prajapati** | Frontend Developer |
| 2 | **Vijay Prajapati** | Backend Developer |
| 3 | **Sumit Prajapati** | Database Developer |
| 4 | **Diya Mahta** | UI/UX Designer & Frontend Developer |

---

## 🙏 Acknowledgements

- **ODOO Hackathon** — For providing the platform and opportunity
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — Cloud database hosting
- [Lucide Icons](https://lucide.dev/) — Beautiful open-source icons
- [Chart.js](https://www.chartjs.org/) — Flexible data visualization library
- [TailwindCSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Vite](https://vitejs.dev/) — Lightning-fast frontend build tool

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <strong>Built with ❤️ for ODOO Hackathon</strong><br/>
  <em>TransitOps — Driving Operational Excellence</em>
</div>
