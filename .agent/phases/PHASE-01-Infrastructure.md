# PHASE 01: Enterprise Infrastructure & Security

## Objective
To establish a rock-solid, production-grade foundation for the Sanad Platform by introducing advanced logging, Docker containerization for consistent deployment environments, comprehensive CI/CD pipelines, and refining the security architecture.

## Target Files to Create/Modify
- **Create:** `Dockerfile` (Backend & Frontend)
- **Create:** `docker-compose.yml` (Root)
- **Create:** `.github/workflows/ci-cd.yml` (CI/CD Pipeline)
- **Create:** `backend/src/utils/logger.js` (Winston Config)
- **Modify:** `backend/app.js` (Integrate Morgan/Winston, confirm Helmet)
- **Modify:** `backend/package.json` (Add winston, morgan)
- **Modify:** `backend/src/middleware/errorHandler.js` (Integrate advanced logging)

## Step-by-Step Implementation Guide

1. **Implement Advanced Logging (Winston & Morgan):**
   - Install `winston` and `morgan` in the backend.
   - Create a `logger.js` utility configuring Winston to output logs to standard out and rotating file logs (e.g., `error.log`, `combined.log`).
   - Integrate Morgan into `app.js` to log HTTP requests, piping the stream output to Winston.
   - Update `errorHandler.js` to log stack traces using the Winston logger instead of `console.error`.

2. **Dockerization:**
   - Create a robust `Dockerfile` for the Node.js backend using a lightweight alpine image, multi-stage build if necessary, and strictly copying `package*.json` before source code to utilize Docker caching.
   - Create a `Dockerfile` for the Vite/React frontend using an Nginx alpine image to serve the static built files.
   - Write a complete `docker-compose.yml` that orchestrates the backend API, the frontend Nginx server, and a MySQL 8.0 instance (with initialized databases via volumes/init scripts).

3. **CI/CD Pipeline Setup:**
   - Define a GitHub Actions workflow `.github/workflows/ci-cd.yml`.
   - The pipeline should trigger on pushes to `main` and Pull Requests.
   - Steps must include: 
     - Linting (frontend & backend).
     - Running Jest test suites (backend).
     - Building Docker images.

4. **Security Hardening & Sequelize Migrations:**
   - Audit `app.js` to ensure Helmet and CORS are production-ready.
   - Ensure explicit Sequelize database migrations and seeders are in place for production deployment (replacing `sync({ alter: true })` which is bad practice for production).

## Testing & Security Checklist
- [ ] Winston logs are generated and correctly formatted in both development console and production log files.
- [ ] `docker-compose up --build` successfully launches the entire stack (DB, Backend, Frontend) without errors.
- [ ] CI/CD pipeline correctly stops passing on test failures or linting errors.
- [ ] Attempted SQL Injection or extreme request payload sizes are successfully absorbed and logged by the security middleware.
