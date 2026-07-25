<div align="center">

# 🩺 BMI Pulse — Advanced Personal Health & BMI Companion

🎬 **Watch the Demo Video — BodyMetric:** [https://youtu.be/TsdOPMMiHoU](https://youtu.be/TsdOPMMiHoU)

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white&style=flat-square)](https://nodejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<br />

Welcome to **BMI Pulse**, a state-of-the-art, beautifully animated local-first health tracker designed to monitor, log, and analyze your Body Mass Index (BMI), goals, and daily wellness habits. With ambient color schemes that adapt to your health status, interactive charts, cardiorespiratory loggers, and a PDF report generator, BMI Pulse makes wellness gamified and aesthetic.
</div>

---

## 🌟 Key Features

### 1. Dynamic User Onboarding & Identity
- **Gamified 5-Step Flow**: Interactive onboarding that captures Identity/Gender, Age, Height, Weight, and personal Goals (Lose, Maintain, Gain) alongside Activity Level.
- **Ambient Theming**: Dynamic gradients and micro-animations change colors depending on your choices.
- **Automatic Targets**: Recommends target weight values based on healthy biological indices.

### 2. Adaptive Dashboard & Live Status
- **Biological Pulse Header**: Displays current BMI with a dynamic status banner and animated risk meter.
- **Habit Streaks & Progress Logs**: Keep track of daily log streaks.
- **Wellness Tracker Quick Tiles**: Quick-view tracking widgets for Water intake, Step count, and Sleep duration.
- **Cardiorespiratory Tracker**: Interactive logs to track minutes exercised and calories burned.
- **Dynamic Chart range**: Interactively filter metrics across 7 Days, 30 Days, 90 Days, or All-Time.

### 3. Precision Calculator & Result Engine
- **Sliders & Steppers**: Easily dial in your measurements with precision steppers.
- **Advanced Classification**: Automatic mapping into *Underweight*, *Healthy*, *Overweight*, or *Obese* zones.
- **PDF Report Builder**: Generate and download an official Multi-Page PDF Health Report including data summaries, trend charts, distribution profiles, and clean data tables.

### 4. Custom Profile & UI Personalization
- **Theme Color Wheel**: Tailor the app frame with a customizable HSV-hue profile avatar.
- **History Logs**: Search, edit, update, or remove past weight entries with automatic recalculation of charts.
- **Notification Inbox**: Read, unread, and filter logs, system achievements, and tip reminders.

---

## 📂 Project Architecture

The project is structured as a monorepo consisting of an Express API backend and a TanStack Start React frontend.

```
BodyMetric/
├── backend/                   # Node.js + Express API Backend
│   ├── config/                # Database Server configurations (db.js)
│   ├── database/              # MSSQL database setup scripts & migrations
│   ├── server.js              # Express REST server entrypoint
│   └── package.json           # Backend package configuration
│
├── frontend/                  # TanStack Start + React + Tailwind Frontend
│   ├── src/
│   │   ├── components/        # Shared components (AppFrame, charts, Shadcn UI)
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── lib/               # Business logic, stores, PDF builders, error boundary handlers
│   │   └── routes/            # File-based routing pages (__root, onboarding, home, results, etc.)
│   ├── tsconfig.json          # TypeScript Configuration
│   ├── vite.config.ts         # Vite bundler options
│   └── package.json           # Frontend package configuration
│
└── screenshots/               # Application UI Screenshots (41 high-res files)
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 & Vite 7
- **Routing**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (File-based SSR/CSR routing)
- **Styling**: Tailwind CSS v4 & Framer Motion (Dynamic micro-animations)
- **Charts**: Recharts (Responsive vector SVGs)
- **Exporting**: jsPDF & jsPDF-AutoTable (Client-side PDF report rendering)
- **State**: Custom local-first storage context API hooks with window events sync

### Backend
- **Framework**: Express API (Node.js)
- **Database**: Microsoft SQL Server (MSSQL Client driver)
- **Security**: BcryptJS (Password hashes) & JSON Web Tokens (JWT user sessions)

---

## 🚀 Installation & Running the Project

### Prerequisites
1. Install [Node.js](https://nodejs.org) (v18+ recommended).
2. Install [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) and SSMS/sqlcmd.

### 1. Database Setup
Execute the SQL migration script located in `backend/database/BodyMetricDB_setup.sql` in your SQL Server instance (e.g. via SSMS). This creates the `BodyMetricDB` database, configures the tables (`Users`, `BmiEntries`, `Activities`, `Notifications`).

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in `.env` (use `.env.example` as a template):
   ```env
   DB_SERVER=localhost
   DB_PORT=1433
   DB_NAME=BodyMetricDB
   DB_USER=sa
   DB_PASSWORD=your_mssql_password
   JWT_SECRET=super_secret_bodymetric_token_generator_key_123
   PORT=5000
   ```
4. Start the backend REST API:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the local development server:
   ```bash
   npm run dev
   ```
4. Open in your browser. Note that the layout is optimised as a premium mobile app simulator.

---

## 📸 Application Screenshot Gallery

Here is the complete sequence of all high-definition screenshots detailing every user interaction flow, UI detail, and responsive animation phase.

### 🏁 Step 1: Landing, Splash, and Credentials

<table align="center">
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095006.png" width="100%"/><br/><b>01. Splash Screen</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095015.png" width="100%"/><br/><b>02. Welcome Hub</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095022.png" width="100%"/><br/><b>03. Sign In Modal</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095029.png" width="100%"/><br/><b>04. Registration Modal</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095037.png" width="100%"/><br/><b>05. Terms of Use</b></td>
    <td align="center" width="50%"></td>
  </tr>
</table>

---

### 🧭 Step 2: Interactive User Onboarding Flow

<table align="center">
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095049.png" width="100%"/><br/><b>06. Gender Selection</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095125.png" width="100%"/><br/><b>07. Age Input</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095133.png" width="100%"/><br/><b>08. Height Slider</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095141.png" width="100%"/><br/><b>09. Weight Dial</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095151.png" width="100%"/><br/><b>10. Goal & Activity Selection</b></td>
    <td align="center" width="50%"></td>
  </tr>
</table>

---

### 📊 Step 3: Main Dashboard (Home) View

<table align="center">
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095158.png" width="100%"/><br/><b>11. Dashboard View</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095207.png" width="100%"/><br/><b>12. Live Health Meter</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095219.png" width="100%"/><br/><b>13. Wellness Tracker Tiles</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095225.png" width="100%"/><br/><b>14. Wellness Quick Stepper</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095348.png" width="100%"/><br/><b>15. Trend Visualization Charts</b></td>
    <td align="center" width="50%"></td>
  </tr>
</table>

---

### 📋 Step 4: Full Calculator, Classification, & PDF Exports

<table align="center">
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095400.png" width="100%"/><br/><b>16. Full Calculator</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095406.png" width="100%"/><br/><b>17. Healthy BMI Result</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095411.png" width="100%"/><br/><b>18. Overweight Risk Warning</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095418.png" width="100%"/><br/><b>19. PDF Report Config</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095425.png" width="100%"/><br/><b>20. PDF Generation Progress</b></td>
    <td align="center" width="50%"></td>
  </tr>
</table>

---

### 🕰️ Step 5: History Log & Entries Management

<table align="center">
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095441.png" width="100%"/><br/><b>21. History Data Sheet</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095452.png" width="100%"/><br/><b>22. Search Filtering</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095458.png" width="100%"/><br/><b>23. Add Manual Entry</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095503.png" width="100%"/><br/><b>24. Modify Weight Entry</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095515.png" width="100%"/><br/><b>25. Activity Tracker Page</b></td>
    <td align="center" width="50%"></td>
  </tr>
</table>

---

### 🎯 Step 6: Goal Planners & Wellness Metrics

<table align="center">
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095523.png" width="100%"/><br/><b>26. Fitness Goals Hub</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095536.png" width="100%"/><br/><b>27. Daily Water Tracker</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095543.png" width="100%"/><br/><b>28. Steps Counter Log</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095548.png" width="100%"/><br/><b>29. Sleep Tracker Logger</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095554.png" width="100%"/><br/><b>30. Activity Type Selector</b></td>
    <td align="center" width="50%"></td>
  </tr>
</table>

---

### 💡 Step 7: Advice, Customization, Alerts & Notifications

<table align="center">
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095606.png" width="100%"/><br/><b>31. Cardio Energy Chart</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095615.png" width="100%"/><br/><b>32. Health Advice Center</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095632.png" width="100%"/><br/><b>33. Category Diet Guides</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095638.png" width="100%"/><br/><b>34. Target Exercises</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095644.png" width="100%"/><br/><b>35. Settings Panel Page</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095659.png" width="100%"/><br/><b>36. Menu Drawer</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095712.png" width="100%"/><br/><b>37. Avatar Hue Customizer</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095717.png" width="100%"/><br/><b>38. Profile Update Toast</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095735.png" width="100%"/><br/><b>39. Notifications History</b></td>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095752.png" width="100%"/><br/><b>40. Storage Toggles Dialog</b></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="screenshots/Screenshot%202026-06-24%20095757.png" width="100%"/><br/><b>41. Storage Clean Alert</b></td>
    <td align="center" width="50%"></td>
  </tr>
</table>

---

## 🛠️ Project Cleanup & Sequence Finalization

We have conducted a thorough code inspection and cleanup of the project:
1. **Removed Redundant Folders**: Deleted a nested/useless `BodyMetric/` directory that contained only duplicate `.git` structures.
2. **Added Global Repository Configurations**: Created a comprehensive root `.gitignore` to keep package management modules (`node_modules/`), environmental files (`.env`), database logs, and workspace assets (`.idea/`) secure.
3. **Consolidated Image Assets**: Gathered and mapped all 41 high-definition user-flow screenshots under a unified `/screenshots` repository folder.
4. **Verified Local Codebase Compliance**: Confirmed local storage context integrations (`bmi-store.ts`), responsive UI frame grids (`app-frame.tsx`), and error boundary log components are perfectly aligned.

---

## 📄 License

```
MIT License

Copyright (c) BodyMetric --- 2026 AnasQ2003🩺

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👨‍💻 Author

**Anas Ahmed Qureshi.** — [@AnasQ2003](https://github.com/AnasQ2003)

---

<div align="center">
  <p>Built with ❤️ by <strong>Anas</strong></p>
  
 <div align="center">

Made with 🔥 and a lot of ☕

**⭐ If you found this useful, please star the repository!**

</div>
