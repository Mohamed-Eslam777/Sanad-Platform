# Sanad Project - Architecture and Status Report

*Date Generated: March 13, 2026*

## 1. Workspace Analysis & File Structure

The `Sanad` project follows a standard decoupled Monorepo-style structure containing completely separate `backend` (Node.js) and `frontend` (React/Vite) applications.

**High-Level Tree Structure:**

```
Sanad
├── backend
│   ├── src
│   │   ├── config (db.js)
│   │   ├── controllers (admin, auth, message, request, review, sos, user)
│   │   ├── middleware
│   │   ├── models (Sequelize relational models)
│   │   ├── routes
│   │   ├── services
│   │   └── utils (ioInstance.js, socketHandler.js)
│   ├── tests
│   └── server.js / app.js
├── frontend
│   ├── public
│   └── src
│       ├── assets
│       ├── components
│       │   ├── common
│       │   ├── layout
│       │   └── (Modals, Buttons, Notifications)
│       ├── context (AuthContext.jsx)
│       ├── features
│       │   └── dashboard (BeneficiaryDashboard, VolunteerDashboard)
│       ├── hooks
│       ├── pages (AdminDashboard, HomePage, ProfilePage, Auth pages...)
│       ├── services (API and socketService)
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
└── project_brief.md / README.md / tools output
```

## 2. Architectural Overview & Current Progress

**Core Architecture:**

- **Frontend Stack**: React 18+ via Vite, styling using Tailwind CSS, and animations via `framer-motion`. State management primarily relies on React Context (`AuthContext`) and local component state.
- **Backend Stack**: Node.js/Express with Sequelize ORM connected to MySQL.
- **Real-Time capabilities**: Integrated via Socket.io to handle chat applications and instant push notifications.

**Implemented Functionalities:**

- **Authentication**: Registration, Login, Protected Routes, JWT session handling, Password resets.
- **User Roles & Profiles**: Role-based access (beneficiary, volunteer, admin) and distinct dashboard experiences.
- **Core Entity/Ticket System**: Requests creation, acceptance, and completion flows.
- **Real-Time Engagement**: In-app chat messaging (`ChatModal.jsx`) and a notification layer (`NotificationBell.jsx` and toast popups).
- **Admin Utilities**: Basic administrative oversight features and dashboarding.
- **Emergency System**: SOS Button and dedicated SOS controller workflows.

## 3. Deep Frontend Audit

A thorough review of the frontend codebase revealed several structural anomalies, technical debt, and styling inconsistency risks:

1. **Monolithic Component Structures**:
   - Files like `AdminDashboard.jsx` (51 KB) and `ChatModal.jsx` (18 KB) suffer from bloated implementations. They violate the Single Responsibility Principle by bundling UI layout, data fetching, state tracking, and local helper methods together.
2. **Global State & Provider Overloading in App.jsx**:
   - `App.jsx` handles core routing but is also overloaded with internal `Toast` component declarations, raw Web Audio API implementations for notification sounds, and the core `NotificationProvider` contextual wrapper.
3. **Styling Consistency Risks**:
   - The application relies heavily on `index.css` for custom CSS variable tokens (e.g., `--color-royal`, glassmorphism utility classes) instead of purely leveraging the `tailwind.config.js` theme block. This creates duplicate sources of truth and undermines Tailwind's utility-first paradigm.
4. **Prop Drilling Vulnerability**:
   - The codebase heavily relies on standard prop drilling to `features/dashboard/` components. State updates spanning across distant siblings (e.g., a modal deep in a requested component refreshing global dashboard metrics) will become difficult without a stricter global state slice (like Zustand or Redux).

## 4. Issue Tracking & Problem Identification

*Prioritized heavily toward immediate frontend refactoring requirements.*

### Priority 1: Critical Frontend Structural Flaws

- **[Refactor] App.jsx Separation of Concerns**: Extract `NotificationProvider`, `Toast`, and `GlobalWatermark` out of `App.jsx` into a dedicated `src/context/NotificationContext.jsx` and `src/components/layout/` wrappers.
- **[Refactor] Component De-bloating (AdminDashboard)**: Break `AdminDashboard.jsx` into modular pieces (`StatOverview`, `RequestTable`, `UserManagementTable`, etc.) stored under `src/features/admin/`.

### Priority 2: UI/UX & Styling Inconsistencies

- **[Cleanup] Tailwind Integration Optimization**: Migrate custom CSS variables and hardcoded hex behaviors from `index.css` directly into `tailwind.config.js` (`extend.colors`). Convert raw CSS classes like `.glass-heavy` into Tailwind `@apply` directives or config plugins for true consistency.
- **[Refine] Responsive Debt Check**: Some larger Modals (e.g., `ChatModal.jsx`, `ReviewModal.jsx`) need verification for mobile viewport clipping, as complex internal flex layouts are at risk on `< 400px` screens.

### Priority 3: Architecture & State Management (Long-term)

- **[Refactor] Audio Handling**: The notification 'beep' generation using raw `window.AudioContext` in component body is clever but fragile; it should be abstracted into a utility hook `useAudioNotification`.
- **[Refine] Global State Tooling**: Evaluate adopting `React Query` (TanStack Query) to manage async data fetching (like Admin stats or Dashboard requests), replacing `useEffect` + local state `isLoading` patterns.

## Next Steps

This documented baseline dictates that the immediate next phase of development should strictly involve **Frontend Refactoring**—specifically targeting `App.jsx` organization, `AdminDashboard` component splitting, and Tailwind configuration alignment—prior to introducing any new feature sets.
