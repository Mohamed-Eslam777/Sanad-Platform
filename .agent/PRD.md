# 📄 Product Requirements Document (PRD) - Sanad Platform (Enterprise Edition)

## 1. Executive Summary

**Sanad (سند)** is an advanced, real-time, mission-critical web application dedicated to connecting vulnerable demographics (Elderly & Individuals with Special Needs) with registered, verified volunteers in their vicinity. The platform facilitates everyday assistance requests and high-priority emergency (SOS) interventions.

## 2. System Architecture & High-Level Design

The platform operates on a decoupled architecture:

- **Frontend:** React.js (Vite) Single Page Application (SPA) designed for mobile-first responsiveness and high accessibility (a11y).
- **Backend:** Node.js/Express.js RESTful API serving as the core engine.
- **Database:** Relational database using **MySQL**, interacting with the application strictly through the **Sequelize ORM**.
- **Real-Time Engine:** Socket.io for bi-directional, low-latency communication (Chat & Notifications).

## 3. User Personas & Role-Based Access Control (RBAC)

The system strictly enforces permissions across three primary roles:

### A. Beneficiary (المستفيد)

- **Profile:** Requires specific accessibility settings. Has a `BeneficiaryProfile` relation.
- **Capabilities:**
  - Create standard help requests (with potential price/compensation logic).
  - Trigger one-tap SOS Emergency alerts.
  - Review and rate volunteers post-completion.
  - Access real-time chat with the assigned volunteer.

### B. Volunteer (المتطوع)

- **Profile:** Requires verification. Has a `VolunteerProfile` relation.
- **Capabilities:**
  - View a feed of nearby requests based on location.
  - Accept/Decline requests.
  - Update request status (In-progress, Completion-requested).
  - Receive localized broadcast SOS alerts.

### C. Admin (المشرف)

- **Capabilities:**
  - System oversight via `AdminDashboard`.
  - User verification, dispute resolution, and monitoring system health.

## 4. Core Modules & Data Entities

### 4.1. Request Lifecycle Management (RLM)

Entity: `Request` (Sequelize Model)

- **Flow:** Created -> Pending Match -> Accepted -> In Progress -> Completion Requested -> Completed/Reviewed.
- **Constraints:** Volunteers can only chat if the request status is `accepted` or `in_progress`.

### 4.2. Real-Time Communication Module (RTC)

Entity: `Message` (Sequelize Model) & `SocketHandler`

- **Architecture:** Employs room-based isolation.
  - `user_<id>`: Auto-joined upon connection for system-wide and personal push notifications.
  - `request_<id>`: Joined dynamically when entering a specific chat interface.
- **Features:** Supports text content, attachment URLs, typing indicators, and atomic read-receipts (`is_read`).

### 4.3. Emergency Response System (SOS)

Entity: `SOSAlert` (Sequelize Model)

- **Logic:** Bypasses standard request flow. Instantly broadcasts to active volunteers within the vicinity via WebSockets, supported by aggressive frontend audio-visual cues.

## 5. Non-Functional Requirements (NFRs)

- **Security:** Strict rate-limiting on Auth, SOS, and Messages to prevent DoS/Abuse. Helmet integration for HTTP header security.
- **Performance:** WebSocket payloads must remain lightweight. MySQL queries must be optimized using proper indexing and associations.
- **UX/UI:** The interface must support offline-first capabilities (PWA ready), utilize fluid state transitions, and guarantee zero-layout-shift (CLS) for elderly users.
