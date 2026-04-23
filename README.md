# 🎓 EduSync
### *Orchestrating Academic Excellence through Intelligent Scheduling*

<p align="center">
  <img src="client/public/logo.png" alt="EduSync Logo" width="200" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/React-2023-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js" alt="Nodejs" />
  <img src="https://img.shields.io/badge/MongoDB-Community-47A248?logo=mongodb" alt="MongoDB" />
</p>

---

## 📖 Project Overview

**EduSync** is a sophisticated Smart Academic Scheduler designed to eliminate the logistical nightmare of manual timetable creation in educational institutions. By leveraging a powerful constraint-satisfaction logic, EduSync automates the generation of conflict-free weekly schedules.

The platform balances multiple complex variables—including teacher availability, room capacities, and specific course requirements—to ensure an optimized learning environment for students and an organized workflow for faculty.

## ✨ Key Features

### 🛠️ Comprehensive Resource Management
Full-scale CRUD capabilities for the core pillars of the institution:
- **Batches**: Manage student cohorts and their academic years.
- **Courses**: Define subjects, credit hours, and prerequisite requirements.
- **Teachers**: Maintain detailed faculty profiles and specializations.
- **Rooms**: Manage physical infrastructure, including lecture halls and specialized labs.

### 📅 Intelligent Teacher Availability
No more scheduling conflicts. Teachers can define their specific "Available Slots" for each day of the week, ensuring that the system only assigns classes when the instructor is actually available.

### 🏛️ Resource Optimization
The system doesn't just find a room; it finds the *right* room. EduSync matches course requirements (e.g., "Chemistry Lab" or "Seminar Hall") with room capacities and available facilities to maximize space utilization.

### ⚙️ The EduSync Engine
The heart of the application. A powerful automated scheduling algorithm that processes all constraints to generate a conflict-free timetable in seconds, drastically reducing administrative overhead.

### 🎨 Premium User Experience
- **Sleek Dashboard**: A modern, responsive administrative interface built with **Tailwind CSS**.
- **Intuitive Icons**: Integrated **Lucide React** icons for a professional, clean aesthetic.
- **Seamless State**: Powered by **Redux Toolkit (RTK) Query** for real-time server-state synchronization and lightning-fast data fetching.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **State Management**: Redux Toolkit & RTK Query
- **Routing**: React Router v6
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose

---

## 📦 Installation Guide

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (Local instance or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/ManiDeep1822/EduSync.git
cd EduSync
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
Start the server:
```bash
npm run dev # or npm start
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `/client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the development server:
```bash
npm run dev
```

---

## 📂 Project Structure

```text
edusync/
├── client/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── app/           # Redux Store & API Slices
│   │   ├── components/    # Reusable UI Components
│   │   ├── pages/         # Page-level components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Helper functions
│   └── tailwind.config.js
├── server/                # Backend (Node + Express)
│   ├── config/            # DB and Environment configs
│   ├── controllers/       # Request handlers
│   ├── models/            # Mongoose Schemas
│   ├── routes/            # API Endpoints
│   ├── utils/             # Scheduling Algorithm (EduSync Engine)
│   └── server.js          # Entry point
└── README.md
```

---

## 🖼️ Screenshots & Demo

*(Replace these placeholders with your actual images or a Loom video link)*

| Dashboard | Scheduling Engine | Resource Management |
| :---: | :---: | :---: |
| ![Dashboard](screenshots/dashboard.png) | ![Engine](screenshots/engine.png) | ![Management](screenshots/management.png) |

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

<p align="center">
  Built with ❤️ by Team EduSync
</p>
