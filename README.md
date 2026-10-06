# 🌐 NEXUS HR — People. Performance. Connected.
### Next-Gen 3D Enterprise Digital Workplace & Employee Management System

![NEXUS HR Banner](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80)

**NEXUS HR** is a production-quality enterprise Employee Management System built with **React**, **Vite**, **Tailwind CSS**, **Three.js**, **Framer Motion**, and **Recharts**, prepared with a full **Node.js + Express + MongoDB Atlas** backend architecture.

Designed with a high-end **"Modern Enterprise / Digital Workplace"** aesthetic featuring 3D interactive physics tilt, Three.js neural workforce topology, cybernetic glassmorphism, and instant dual-mode data persistence.

---

## ✨ Key Features & Architecture

### 1. 🎨 Visual Style & Aesthetics
- **Dark-First Enterprise Theme** with sleek, tailored light mode toggle.
- **Glassmorphism & Radial Depth**: Multilayered subtle grain textures, ambient lighting glows, and cybernetic background grid.
- **Interactive 3D Perspective Tilt**: Cards follow the cursor in 3D space (`perspective`, `rotateX`, `rotateY`, `translateZ`, specular reflection sheen).
- **Three.js Neural Network**: 3D "Connected Workforce" visualization representing cross-departmental collaboration.

### 2. 📊 Analytics & Dashboards
- **4 3D Stats Cards**: Total Workforce, Engineering Core, People & HR, and New Hires with mini SVG sparklines.
- **Dynamic 7-Month Headcount Velocity Area Chart** with interactive tooltip and gradient area fills.
- **Modern Donut Chart** showing department distribution with centered counts and metrics.

### 3. 👥 Comprehensive Employee Management
- **Enterprise Data Table & 3D Card Grid Views** with instant toggle.
- **Multi-criteria Live Search & Filters**: Search by name/email/role, department selector, status pills, and sort orders.
- **Real-Time Validated Modals**: Full validation for name (2-100 chars), valid email regex, department, designation, and salary.
- **Bulk Deletion & Multi-Selection** with safety confirmation dialogs.
- **3D Employee Profile ID Badge**: Performance score meters, project assignments, skills badges, and print/export badge tools.

### 4. 🚀 Resilient Dual-Mode API Architecture (`src/api.js`)
- **Centralized Axios Client** with configured `VITE_API_URL`.
- **Seamless Local Hybrid Fallback**: Functions 100% standalone out-of-the-box with `localStorage` state persistence, pre-seeded with 12+ realistic employee records across Engineering, HR, Sales, Finance, and Marketing.
- **Full Turnkey Node.js + Express + MongoDB Atlas Backend** in `/backend` folder with models, routes, controllers, and seed scripts.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + Vite |
| **Styling & Design System** | Tailwind CSS v4 + Vanilla Glassmorphism Tokens |
| **3D Visualizations** | Three.js WebGL Engine |
| **Icons & UI Symbols** | Lucide React |
| **Motion & Micro-interactions** | Framer Motion |
| **Data Visualization & Charts** | Recharts |
| **HTTP Client & API** | Axios |
| **Backend (Optional Live Mode)** | Node.js + Express.js |
| **Database (Optional Live Mode)** | MongoDB Atlas / Mongoose |

---

## 🚀 Quick Start Guide

### 1. Run Frontend (React + Vite)
```bash
# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

### 2. Run Backend (Node.js + Express + MongoDB Atlas - Optional)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# (Optional) Add your MongoDB Atlas connection string in .env
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexus_hr

# Start the Express server
npm run dev
```
The backend will run on `http://localhost:5000/api`.

---

## 📁 Project Structure

```
Employee Management System/
├── public/
│   └── favicon.svg              # Geometric NEXUS "N" node logo
├── src/
│   ├── api.js                   # Unified Axios API + Local Mock DB Fallback
│   ├── App.jsx                  # App Layout, Router & Background textures
│   ├── main.jsx                 # Entry point with Theme & Toast Providers
│   ├── index.css                # Design system tokens, Glassmorphism, 3D tilt
│   ├── context/
│   │   ├── ThemeContext.jsx     # Dark/Light mode manager with localStorage
│   │   └── ToastContext.jsx     # Animated floating toast alerts
│   ├── components/
│   │   ├── Employee3DCanvas.jsx # Three.js Connected Workforce 3D visualizer
│   │   ├── Sidebar.jsx          # Collapsible responsive glass sidebar
│   │   ├── Header.jsx           # Dynamic breadcrumbs, search, notifs, theme
│   │   ├── StatsCard.jsx        # 3D tilt stats cards with sparklines
│   │   ├── SearchFilter.jsx     # Search, department, status, sort toolbar
│   │   ├── EmployeeTable.jsx    # Enterprise data table with bulk actions
│   │   ├── EmployeeCard.jsx     # 3D interactive grid card with sheen
│   │   ├── EmployeeModal.jsx    # Validated Add/Edit Employee modal
│   │   ├── DeleteModal.jsx      # Confirmation modal with danger state
│   │   ├── CommandPalette.jsx   # Ctrl+K global quick search palette
│   │   ├── LoadingSkeleton.jsx  # Shimmer skeleton loader
│   │   ├── EmptyState.jsx       # Futuristic empty state UI
│   │   └── ErrorState.jsx       # Retry error state UI
│   └── pages/
│       ├── Dashboard.jsx        # Homepage with 3D nodes, charts, recent list
│       ├── EmployeeList.jsx     # Full directory with table/grid & filters
│       ├── EmployeeDetails.jsx  # 3D ID badge, personal info, skills & stats
│       ├── Departments.jsx      # Business unit hierarchy & lead profiles
│       ├── Reports.jsx          # Compensation benchmarks & CSV/JSON exports
│       └── Settings.jsx         # Live MongoDB test ping, API URL, Theme
├── backend/
│   ├── controllers/
│   │   └── employeeController.js
│   ├── models/
│   │   └── Employee.js
│   ├── routes/
│   │   └── employeeRoutes.js
│   ├── seed.js                  # Database population script
│   ├── server.js                # Express REST API Server
│   └── package.json
└── README.md
```

---

## 🏆 College Review & Placement Interview Highlights
- **Architecture**: Modular separation of concerns with dual-mode API failover.
- **Enterprise UX**: Keyboard navigation (`Ctrl+K`), custom toast queue, bulk selection actions, and responsive layout.
- **Performance**: High 60fps WebGL render loop with automatic cleanup and lightweight CSS transforms.
- **Data Integrity**: Client-side regex & length validation coupled with authoritative schema rules.
