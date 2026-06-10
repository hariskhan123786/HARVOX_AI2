 # HARVOX AI — Production Deployment Guide

This guide details professional deployment flows to release the HARVOX AI platform to cloud infrastructure or virtual private servers (VPS).

---

## 1. Unified VPS Docker Deployment (Recommended)

Our Docker config bundles the built SPA React client and serves it through the Express.js production server, making single-port scaling effortless.

### Quick Start with Docker Compose
1. Ensure Docker and Docker Compose are installed on your target machine.
2. Clone the repository and copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Populate all variables (especially `MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`).
4. Boot up the service cluster:
   ```bash
   docker-compose up -d --build
   ```
5. Check service health:
   ```bash
   docker-compose ps
   ```
   The backend container exposes port `5000` to direct traffic, serves static web pages on index requests, and handles API operations.

---

## 2. Decoupled Cloud Hosting Setup

For serverless cloud scaling, deploy the React SPA client and Node.js Express server to distinct platforms.

### Frontend Deployment: Vercel or Netlify
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Direct link to your backend server URL (e.g., `https://api.harvox.ai/api`).

> [!TIP]
> Use Vercel's multi-stage CDN edge configurations to serve front-end pages globally under sub-second load times.

### Backend Deployment: Railway or Render
- **Start Script**: `npm start`
- **Port**: Configured automatically or mapped to `5000`.
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: Connection string to your MongoDB cluster.
  - `JWT_SECRET`: Secure encryption key.
  - `CLIENT_URL`: Domain of your frontend deployment (e.g., `https://harvox.ai`).
  - `GROQ_API_KEY` & `GEMINI_API_KEY`.

---

## 3. Database Cluster Optimizations

To prepare your MongoDB Atlas cluster for enterprise workloads:
- **Connection Pooling**: Set `maxPoolSize=10` inside the connection settings (automatically handled by our Database Manager singleton).
- **Index Management**: Ensure your Mongoose schemas compile indexes on startup. Critical query patterns such as `userId` lookups in the `Chat` and `UserSettings` models are indexed.
- **Failover Status**: Monitor database health status dynamically via `GET /api/health` queries.
