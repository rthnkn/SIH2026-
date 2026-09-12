#  MindCare AI — Smarter Care. Simpler Days. Better Ageing.

**AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in the North Eastern Region (NER)**

> *SIH26003 — Smart India Hackathon 2026*

---

##  Table of Contents

- [About](#about)
- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Demo Credentials](#demo-credentials)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [SIH26003 Alignment](#sih26003-alignment)
- [Offline Support](#offline-support)
- [AI & Adaptive Engine](#ai--adaptive-engine)
- [Multilingual Support](#multilingual-support)
- [North Eastern Region Focus](#north-eastern-region-focus)
- [Security](#security)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## About

MindCare AI is a comprehensive, AI-powered elderly care and cognitive assistance platform designed specifically for the North Eastern Region of India. It combines medication management, cognitive games, daily-routine assistance, hydration tracking, appointment reminders, caregiver monitoring, voice assistance, multilingual support, and offline-first functionality — all wrapped in an accessible, warm, and friendly interface designed for elderly users.

**Design Philosophy:** Inspired by the Sundose medication care aesthetic — warm cream tones, serif headings, large touch targets, and minimal cognitive load.

---

## Problem Statement

**SIH26003** addresses the critical challenges faced by elderly dementia patients in the North Eastern Region:

-  **Cognitive Decline** — Memory loss and reduced cognitive function affect daily life
-  **Medication Mismanagement** — Complex schedules lead to missed doses and health complications
-  **Caregiver Burden** — Family members struggle to provide 24/7 monitoring remotely
-  **Low Connectivity** — Remote areas lack reliable internet for digital health tools
-  **Language Barriers** — Most health apps don't support NER regional languages

---

## Our Solution

MindCare AI tackles every aspect of SIH26003 with a dual-interface platform:

### Patient Side
| Page | Description |
|------|-------------|
|  **Dashboard** | Personalized greeting, today's care overview, quick actions |
|  **My Medicines** | Full medication CRUD, timeline, mark taken/skipped, reminders |
|  **Brain Care Hub** | Today's cognitive plan + 4 interactive games |
|  **Memory Match** | Flip-card matching with score, accuracy, adaptive difficulty |
|  **Pattern Recognition** | Sequence completion with multiple-choice |
|  **Object Recognition** | NER-focused familiar objects identification |
|  **Routine Recall** | Daily routine-based questions with scoring |
|  **Daily Routine** | Visual timeline with toggle completion |
|  **Hydration** | Water glass visualization, +Drink button, daily log |
|  **Appointments** | Add/edit/delete, upcoming/past tabs |
|  **Voice Assistant** | Speech recognition + synthesis, text fallback |
|  **Progress** | Cognitive analytics with 7-day chart, difficulty breakdown |
|  **Settings** | Language selector (EN/HI/AS/BN), profile, security |

### Caregiver Side
| Page | Description |
|------|-------------|
|  **Dashboard** | Patient overview, 4 key metrics, weekly chart, active alerts |
|  **Patients** | Assigned patient list with stats |
|  **Medications** | Weekly adherence analytics, per-medication breakdown |
|  **Cognitive** | Performance trends, activity breakdown, difficulty distribution |
|  **Alerts** | Filter by status/severity, resolve/dismiss actions |
|  **Reports** | Comprehensive weekly summary with trend comparisons |
|  **Settings** | Language, profile, security |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **State Management** | Zustand (with persist middleware) |
| **Offline Database** | Dexie.js (IndexedDB wrapper) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Routing** | React Router v6 |
| **PWA** | vite-plugin-pwa (Service Worker + Manifest) |
| **i18n** | Custom translation store (EN/HI/AS/BN) |
| **Voice** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Design System** | Sundose-inspired warm cream aesthetic |

---

## Getting Started

### Prerequisites

- **Node.js** v18+ ([Install Node.js](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/rthnkn/SIH2026-.git
cd SIH2026-

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Demo Credentials

The app comes with a **fully pre-seeded demo mode** for instant hackathon judging.

### Quick Access (Landing Page)
Click **"Load Demo Patient "** on the landing page to instantly load with sample data.

### Manual Login

| Role | Email | Password |
|------|-------|----------|
| **Patient** | `ramesh@demo.com` | `demo123` |
| **Caregiver** | `anita@demo.com` | `demo123` |

### Demo Data Includes
- **Patient:** Ramesh Kumar, Age 68, North Eastern Region, India
- **Caregiver:** Anita Kumar
- **Medications:** 5 medicines with varied schedules
- **Medication History:** 7 days of adherence logs
- **Cognitive Sessions:** 7 days of game performance data
- **Hydration Logs:** Daily water tracking records
- **Appointments:** Upcoming and past appointments
- **Alerts:** Active and resolved caregiver alerts
- **Daily Routine:** Configured daily activities

---

## Architecture

```
src/
├── components/          # Shared UI components
│   ├── CaregiverLayout.tsx
│   ├── ConnectivityBanner.tsx
│   ├── Modal.tsx
│   └── PatientLayout.tsx
├── data/                # Data layer
│   ├── db.ts            # Dexie.js IndexedDB schema
│   └── seed.ts          # Demo data seeder
├── i18n/                # Internationalization
│   └── index.ts         # EN/HI/AS/BN translations
├── pages/
│   ├── LandingPage.tsx  # Marketing landing page
│   ├── LoginPage.tsx    # Authentication
│   ├── patient/         # 12 patient-facing pages
│   │   ├── Dashboard.tsx
│   │   ├── Medicines.tsx
│   │   ├── CognitiveCare.tsx
│   │   ├── games/
│   │   │   ├── MemoryMatch.tsx
│   │   │   ├── PatternRecognition.tsx
│   │   │   ├── ObjectRecognition.tsx
│   │   │   └── RoutineRecall.tsx
│   │   ├── Routine.tsx
│   │   ├── Hydration.tsx
│   │   ├── Appointments.tsx
│   │   ├── Progress.tsx
│   │   ├── VoiceAssistant.tsx
│   │   └── Settings.tsx
│   └── caregiver/       # 7 caregiver-facing pages
│       ├── Dashboard.tsx
│       ├── Patients.tsx
│       ├── Medications.tsx
│       ├── Cognitive.tsx
│       ├── Alerts.tsx
│       ├── Reports.tsx
│       └── Settings.tsx
├── store/               # State management
│   ├── auth.ts          # Auth + role-based routing
│   └── connectivity.ts  # Online/offline detection
├── types/               # TypeScript definitions
│   └── index.ts
├── App.tsx              # Router configuration
├── main.tsx             # Entry point
└── index.css            # Global styles + components
```

---

## Features

###  Medication Management
- Add, edit, delete medications
- Set dosage, frequency, scheduled times
- Set start/end dates, instructions, notes
- Mark medicines as taken or skipped
- View today's timeline with upcoming doses
- Adherence tracking with percentage stats
- Missed medication alerts for caregivers

###  Cognitive Care (4 Games)

####  Memory Match
Flip cards to find matching pairs. Tracks accuracy, attempts, completion time, and score. Difficulty adapts based on performance.

####  Pattern Recognition
Identify the next element in a sequence (e.g., 🔵 🟢 🔵 🟢 ?). Multiple-choice answers with scoring.

####  Object Recognition
Identify familiar everyday objects with NER-relevant items (lotus, tea, bamboo, elephant). Includes hints system.

####  Routine Recall
Answer daily routine-based questions ("What do you usually do after breakfast?"). Tracks accuracy, response time, and score.

###  Daily Routine
- Customizable activity timeline
- Toggle completion for each activity
- Visual progress indicators

###  Hydration Tracking
- Configurable daily glass target
- Large +DRINK WATER button
- Visual glass visualization
- Daily log with timestamps

###  Appointments
- Add/edit/delete appointments
- Doctor, hospital, date, time, notes
- Upcoming and past tabs
- Reminder functionality

###  Voice Assistant
- Browser Speech Recognition for voice input
- Speech Synthesis for spoken responses
- Text input fallback
- Queries actual application data
- Answers medication, appointment, and routine questions

###  Progress & Analytics
- 7-day cognitive performance chart
- Activity difficulty breakdown
- Score, accuracy, and response time trends
- Medication adherence history

###  Caregiver Alerts
- 🔴 Missed medication alerts
- 🟡 Reduced activity performance
- 🟡 Skipped activities
- 🔵 Upcoming appointment reminders
- 🟢 Completed daily routines
- Filter by status and severity
- Resolve/dismiss actions

###  Settings
- Language selection (English, Hindi, Assamese, Bengali)
- Profile information
- Security info
- Region display (North Eastern Region, India)

---

## AI & Adaptive Engine

MindCare AI uses a **performance-based cognitive adaptation system**:

### How It Works
1. Every cognitive activity records: score, accuracy, response time, attempts, difficulty, and timestamp
2. A performance score is calculated from recent sessions
3. Difficulty adjusts automatically:

| Performance | Action |
|-------------|--------|
| Consistently high | Increase difficulty (Easy → Medium → Hard) |
| Average | Maintain current difficulty |
| Low | Reduce difficulty, provide simpler activities |
| Sudden drop | Keep manageable, flag trend for caregiver |

### Difficulty Levels
-  **Easy** — 4-6 items, simple patterns, familiar objects
-  **Medium** — 6-8 items, moderate patterns, varied objects
-  **Hard** — 8-12 items, complex patterns, challenge objects

### Daily Cognitive Plan
The system generates a personalized daily plan based on:
- Weak areas → More activities in that category
- Strong areas → Increased difficulty
- Inactive periods → Short, simple re-engagement activities

> **Important:** This system tracks *activity performance* for cognitive engagement purposes. It does **NOT** diagnose dementia, Alzheimer's, or any medical condition. All terminology uses "performance-based cognitive adaptation" and "personalized cognitive activities."

---

## Multilingual Support

MindCare AI supports 4 languages out of the box, with an extensible translation system:

| Language | Code | Coverage |
|----------|------|----------|
| English | `en` | Full |
| Hindi | `hi` | Full |
| Assamese | `as` | Full |
| Bengali | `bn` | Full |

### Translation Coverage
-  Navigation labels
-  Medication reminders
-  Cognitive game instructions
-  Daily routine text
-  Hydration prompts
-  Appointment labels
-  Voice assistant responses
-  Alert messages
-  System messages and disclaimers

### Adding New Languages
To add a new NER language (e.g., Manipuri, Mizo, Naga):

1. Open `src/i18n/index.ts`
2. Add a new language code key (e.g., `mni`)
3. Translate all keys from the English object
4. Add the language option to `src/pages/patient/Settings.tsx`

---

## North Eastern Region Focus

MindCare AI is specifically designed for the NER:

-  **Regional Languages** — Assamese, Bengali, Hindi supported natively
-  **Culturally Familiar Content** — Cognitive games include NER-relevant objects
-  **Low-Connectivity Architecture** — PWA with offline-first design
-  **Simple Interface** — Designed for users with limited tech experience
-  **Caregiver Connectivity** — Remote monitoring for distributed families

### NER Content in Cognitive Games
-  Lotus (India's national flower)
-  Tea (NER's primary crop)
-  Bamboo (widely used in NER culture)
-  Elephant (familiar to NER wildlife)
-  Mountains (NER landscape)
-  Regional foods and household items

---

## Offline Support

MindCare AI is built as a **Progressive Web App (PWA)** with offline-first architecture:

### What Works Offline
-  Medication schedules and logging
-  All 4 cognitive games
-  Daily routine tracking
-  Hydration logging
-  Voice assistant (text fallback)
-  Appointment viewing

### What Requires Connectivity
-  Syncing pending activity results
-  Loading new cognitive content
-  Caregiver alert delivery

### Connectivity Indicator
- 🟢 **Synced** — All data is current
- 🟠 **Offline** — Changes will sync when connected

---

## Security

-  **Authentication** — Email/password login with role-based access
-  **Role-Based Authorization** — Patients see only their own data; caregivers see only assigned patients
-  **Local-First Data** — Data stored in IndexedDB, not sent to external servers
-  **No Public Exposure** — Private patient information is never publicly accessible

---

## Disclaimer

> *This platform is designed for cognitive engagement, medication organisation, and caregiver support. It does **not** diagnose or replace professional medical care. All cognitive performance metrics reflect activity engagement levels, not clinical assessments.*

---

## License

This project was developed for **Smart India Hackathon 2026** under problem statement **SIH26003**.

---

<div align="center">

**Built with love for the North Eastern Region**

 MindCare AI — *Smarter Care. Simpler Days. Better Ageing.*

</div>
