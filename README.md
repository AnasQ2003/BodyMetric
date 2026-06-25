# 🩺 BMI Pulse — Advanced Personal Health & BMI Companion

Welcome to **BMI Pulse**, a state-of-the-art, beautifully animated local-first health tracker designed to monitor, log, and analyze your Body Mass Index (BMI), goals, and daily wellness habits. With ambient color schemes that adapt to your health status, interactive charts, cardiorespiratory loggers, and a PDF report generator, BMI Pulse makes wellness gamified and aesthetic.

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
Execute the SQL migration script located in `backend/database/BodyMetricDB_setup.sql` in your SQL Server instance (e.g. via SSMS). This creates the `BodyMetricDB` database, configures the tables (`Users`, `BmiEntries`, `Activities`, `Notifications`), and seeds a default user:
- **Email**: `anas@example.com`
- **Password**: `anas123`

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
4. Open [http://localhost:3000](http://localhost:3000) in your browser. Note that the layout is optimised as a premium mobile app simulator.

---

## 📸 Application Screenshot Gallery

Here is the complete sequence of 41 high-definition screenshots detailing every user interaction flow, UI detail, and responsive animation phase.

### 🏁 Step 1: Landing, Splash, and Credentials
| Screenshot | Preview | Description |
|---|---|---|
| **01** | ![Splash Screen](screenshots/Screenshot%202026-06-24%20095006.png) | Ambient dynamic splash screen with progress loader and orbiting health icons. |
| **02** | ![Welcome Hub](screenshots/Screenshot%202026-06-24%20095015.png) | Authentication landing page showcasing live logs feed and feature tags. |
| **03** | ![Sign In Modal](screenshots/Screenshot%202026-06-24%20095022.png) | Interactive login form dialog with glassmorphism header overlay. |
| **04** | ![Registration Modal](screenshots/Screenshot%202026-06-24%20095029.png) | Account creation dialog including user name validation fields. |
| **05** | ![Terms of Use](screenshots/Screenshot%202026-06-24%20095037.png) | Health disclaimer and data ownership modal popup. |

### 🧭 Step 2: Interactive User Onboarding Flow
| Screenshot | Preview | Description |
|---|---|---|
| **06** | ![Gender Selection](screenshots/Screenshot%202026-06-24%20095049.png) | Step 1 of onboarding: Identity/gender choice with spring hover effects. |
| **07** | ![Age Input](screenshots/Screenshot%202026-06-24%20095125.png) | Step 2 of onboarding: Tailoring metric values using age input. |
| **08** | ![Height Slider](screenshots/Screenshot%202026-06-24%20095133.png) | Step 3 of onboarding: Height slider with dynamic metric gauge visual. |
| **09** | ![Weight Dial](screenshots/Screenshot%202026-06-24%20095141.png) | Step 4 of onboarding: Weight input selection setup. |
| **10** | ![Goal & Activity Selection](screenshots/Screenshot%202026-06-24%20095151.png) | Step 5 of onboarding: Fitness goals selection and physical activity toggles. |

### 📊 Step 3: Main Dashboard (Home) View
| Screenshot | Preview | Description |
|---|---|---|
| **11** | ![Dashboard View](screenshots/Screenshot%202026-06-24%20095158.png) | Main home view displaying user name, BMI category status, and streak tiles. |
| **12** | ![Live Health Meter](screenshots/Screenshot%202026-06-24%20095207.png) | Live health status dashboard highlighting target weight gauge meters. |
| **13** | ![Wellness Tracker Tiles](screenshots/Screenshot%202026-06-24%20095219.png) | Status grid containing Water tracker, Steps metrics, and Sleep logs. |
| **14** | ![Wellness Quick Stepper](screenshots/Screenshot%202026-06-24%20095225.png) | Inline sliders for real-time local height and weight calculations. |
| **15** | ![Trend Visualization Charts](screenshots/Screenshot%202026-06-24%20095348.png) | Interactive charts plotting historical BMI scores vs actual bodyweight. |

### 📋 Step 4: Full Calculator, Classification, & PDF Exports
| Screenshot | Preview | Description |
|---|---|---|
| **16** | ![Full Calculator](screenshots/Screenshot%202026-06-24%20095400.png) | Extended measurement page with interactive sliders and instant category readout. |
| **17** | ![Healthy BMI Result](screenshots/Screenshot%202026-06-24%20095406.png) | Result screen displaying healthy classification, ideal ranges, and advice. |
| **18** | ![Overweight Risk Warning](screenshots/Screenshot%202026-06-24%20095411.png) | Result screen showing alert indicators and medical advisories for warnings. |
| **19** | ![PDF Report Generation Config](screenshots/Screenshot%202026-06-24%20095418.png) | Config modal to preview time period filter ranges for custom document downloads. |
| **20** | ![PDF Generation In Progress](screenshots/Screenshot%202026-06-24%20095425.png) | Visual representation of local PDF creation builder task process. |

### 🕰️ Step 5: History Log & Entries Management
| Screenshot | Preview | Description |
|---|---|---|
| **21** | ![History Data Sheet](screenshots/Screenshot%202026-06-24%20095441.png) | Complete data log sheet highlighting all historic records. |
| **22** | ![Search Filtering](screenshots/Screenshot%202026-06-24%20095452.png) | Filtering list view utilizing instant textual keyword search. |
| **23** | ![Add Manual Entry](screenshots/Screenshot%202026-06-24%20095458.png) | Form interface allowing manual entry creation with timestamp logs. |
| **24** | ![Modify Weight Log Entry](screenshots/Screenshot%202026-06-24%20095503.png) | Quick edit dialog allowing users to correct or rewrite existing entries. |
| **25** | ![Activity Tracker Page](screenshots/Screenshot%202026-06-24%20095515.png) | Exercise logs showing list of sports types, durations, and calories. |

### 🎯 Step 6: Goal Planners & Wellness Metrics
| Screenshot | Preview | Description |
|---|---|---|
| **26** | ![Fitness Goals Hub](screenshots/Screenshot%202026-06-24%20095523.png) | Targeted planner view displaying calorie caps, target weight, and pacing indexes. |
| **27** | ![Daily Water Intake Tracker](screenshots/Screenshot%202026-06-24%20095536.png) | Dynamic logger tracking fluid hydration with instant cup additions. |
| **28** | ![Steps Counter Log](screenshots/Screenshot%202026-06-24%20095543.png) | Visual card layout recording daily footsteps milestone metrics. |
| **29** | ![Sleep Tracker Logger](screenshots/Screenshot%202026-06-24%20095548.png) | Deep sleep, REM cycle tracking interface, and target goals. |
| **30** | ![Activity Type Selector](screenshots/Screenshot%202026-06-24%20095554.png) | Category selector representing various sport intensities. |

### 💡 Step 7: Advice, Customization, Alerts & Notifications
| Screenshot | Preview | Description |
|---|---|---|
| **31** | ![Cardio Energy Chart](screenshots/Screenshot%202026-06-24%20095606.png) | Live bar charts displaying daily physical output. |
| **32** | ![Health Advice Center](screenshots/Screenshot%202026-06-24%20095615.png) | Lifestyle tips feed customized to the user's active health category. |
| **33** | ![Category Diet Guides](screenshots/Screenshot%202026-06-24%20095632.png) | Detailed nutritional recommendations and menus. |
| **34** | ![Target-Specific Exercises](screenshots/Screenshot%202026-06-24%20095638.png) | Curated workout regimes suitable for selected goals. |
| **35** | ![Settings Panel Page](screenshots/Screenshot%202026-06-24%20095644.png) | Global settings panel containing profile edit actions and data backup options. |
| **36** | ![Interactive Menu Drawer](screenshots/Screenshot%202026-06-24%20095659.png) | Smooth spring menu drawer representing primary links across modules. |
| **37** | ![Avatar Hue Customizer](screenshots/Screenshot%202026-06-24%20095712.png) | Sliders setting color tint and profile design features. |
| **38** | ![Profile Update Success Dialog](screenshots/Screenshot%202026-06-24%20095717.png) | Validation toast indicating successful updates to local database records. |
| **39** | ![Notifications History Page](screenshots/Screenshot%202026-06-24%20095735.png) | Structured list tracking read, unread, and custom reminders. |
| **40** | ![Clean Storage Toggles](screenshots/Screenshot%202026-06-24%20095752.png) | Safe dialog options checking before purging user application database cache. |
| **41** | ![Storage Clean Success Alert](screenshots/Screenshot%202026-06-24%20095757.png) | Final message showing successful memory clearing. |

---

## 🛠️ Project Cleanup & Sequence Finalization

We have conducted a thorough code inspection and cleanup of the project:
1. **Removed Redundant Folders**: Deleted a nested/useless `BodyMetric/` directory that contained only duplicate `.git` structures.
2. **Added Global Repository Configurations**: Created a comprehensive root `.gitignore` to keep package management modules (`node_modules/`), environmental files (`.env`), database logs, and workspace assets (`.idea/`) secure.
3. **Consolidated Image Assets**: Gathered and mapped all 41 high-definition user-flow screenshots under a unified `/screenshots` repository folder.
4. **Verified Local Codebase Compliance**: Confirmed local storage context integrations (`bmi-store.ts`), responsive UI frame grids (`app-frame.tsx`), and error boundary log components are perfectly aligned.

---

## ⚖️ License
This project is licensed under the MIT License. Feel free to customize and expand it!
