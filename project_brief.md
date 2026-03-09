# Project Name: Sanad (Volunteer Assistance Platform for People with Disabilities)

## 1. Project Overview & Mission

Sanad is a web platform connecting people with disabilities (Beneficiaries) with verified Volunteers for daily assistance tasks (e.g., transportation, reading, running errands).
**Core Goal:** Create a safe, accessible, and efficient bridge between those who need help and those willing to offer it.

## 2. Tech Stack & Architecture

- **Frontend:** React.js (Vite) + Tailwind CSS.
  - *Constraint:* Must be fully accessible (WAI-ARIA compliant) for screen readers.
- **Backend:** Node.js + Express.js.
- **Database:** MySQL (Relational).
  - *ORM:* Use Sequelize or Prisma for database interactions.
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).
- **External APIs:** Google Maps API (for location tracking & distance calculation).

## 3. Database Schema (The Truth Source)

(Refer to the provided MySQL Schema code for exact tables and relationships).
Key Tables: Users, Beneficiary_Profiles, Volunteer_Profiles, Requests, Messages, Reviews, SOS_Alerts.

## 4. Key Features & Business Logic

### A. Authentication & Roles

- **Beneficiary:** Can post requests, view volunteer profiles, and rate services.
- **Volunteer:** Must verify ID (National ID), can accept requests nearby, and chat with beneficiaries.
- **Safety:** Accounts with 'flagged' status cannot interact.

### B. The Request Cycle (Core Loop)

1. Beneficiary posts a request (Type, Location, Time).
2. System queries database for available Volunteers within a 5km radius (using Haversine formula or GIS functions).
3. Volunteer accepts -> Status changes to 'accepted'.
4. Chat opens between them.
5. Task completes -> Status 'completed' -> Review is enabled.

### C. Safety Protocols

- **SOS Button:** Triggers an alert stored in `SOS_Alerts` and notifies admins/emergency contacts immediately.
- **Data Privacy:** Phone numbers are hidden; communication happens strictly via in-app chat.

## 5. Coding Standards (Strict Rules)

- Use **MVC Pattern** (Model-View-Controller) for the backend.
- Write modular code: Separate Routes, Controllers, and Services.
- **Error Handling:** All API endpoints must use try-catch blocks and return standardized JSON error messages.
- **Comments:** Comment complex logic, especially the geospatial matching queries.

---
**Instruction to AI Agent:**
Start by setting up the project structure based on this tech stack. Initialize the Node.js server and connect it to the MySQL database using the provided schema structure.
