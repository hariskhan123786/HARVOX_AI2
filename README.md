<div align="center">

# ⚡ HARVOX AI

### The AI-Powered Operating System for Your Browser

*Chat. Automate. Create. Deploy. All from one holographic workspace.*

<br/>

[![License](https://img.shields.io/badge/license-Proprietary-red?style=for-the-badge)](#-license)
[![Made with React](https://img.shields.io/badge/frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#-tech-stack)
[![Node.js](https://img.shields.io/badge/backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](#-tech-stack)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](#-tech-stack)
[![Deployed on Vercel](https://img.shields.io/badge/deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](#-deployment)

<br/>

**[Live Demo](https://harvox-ai-2.vercel.app/login)** · [Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [Roadmap](#-roadmap)

</div>

<br/>

---

## ✨ Overview

**Harvox AI** is a full-stack, AI-native workspace that lives in your browser — part chat assistant, part voice agent, part file system, part terminal, part automation engine. Instead of switching between a dozen apps, Harvox routes your intent through multiple AI providers and executes it: writing code, managing files, controlling media, planning your day, or deploying your project — all from a single glassmorphic, neon-lit interface.

> Think of it as an **AI copilot for your entire desktop**, not just your code editor.

<br/>

## 🚀 Features

<table>
<tr>
<td width="50%" valign="top">

### 🧠 Multi-Provider AI Chat
Chat with Gemini, Groq, Cerebras, or OpenRouter models through one unified interface — with automatic failover, live cost tracking, and per-conversation model switching.

### 🎙️ Voice Assistant
A fully voice-driven agent powered by ElevenLabs, capable of switching models mid-conversation and adapting to different subjects and personas on the fly.

### 🗂️ Workspace OS
A sandboxed file explorer paired with a real in-browser terminal (`xterm.js`) — browse, edit, and run commands against your own isolated workspace.

### 🤖 Automation Engine
A plugin-based automation core that plans and executes multi-step workflows: file operations, browser control, media/streaming control, Git & deployment, and more.

</td>
<td width="50%" valign="top">

### 📚 Productivity & Study Tools
Auto-generate daily plans, reminders, flashcards, MCQs, and notes. Built-in Focus Mode, Study Mode, and Meeting Mode to keep you on track.

### 🧩 Persistent AI Memory
Long-term, user-specific memory with automatic tagging, conflict detection, and identity summarization — your assistant actually remembers you.

### 🛡️ Admin & Billing
Role-gated admin dashboard for user management, payments, and system settings, backed by a full subscription/billing layer.

### 🎨 Premium Design System
A cohesive glass + neon + holographic visual language, complete with 3D effects, animated backgrounds, and a reusable component kit.

</td>
</tr>
</table>

<br/>

## 🛠️ Tech Stack

<div align="center">

| Layer | Technologies |
|:---|:---|
| **Frontend** | React · Tailwind CSS · Framer Motion · `@xterm/xterm` · html2canvas · jsPDF |
| **State** | Zustand-style stores (`useAuthStore`, `useSidebarStore`) |
| **Backend** | Node.js · Express · CORS · dotenv · express-rate-limit |
| **Database** | MongoDB |
| **Auth** | JWT-based auth with route-level `protect()` middleware |
| **AI Providers** | Google Gemini · Groq · Cerebras · OpenRouter · ElevenLabs (voice) |
| **Infra** | Docker Compose · Vercel · Railway · GitHub Actions CI |

</div>

<br/>

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT — React SPA                       │
│                                                                │
│   Landing → Login/Register → Dashboard → WorkspaceOS          │
│                                   │                            │
│              ┌────────────────────┼────────────────────┐      │
│              ▼                    ▼                    ▼      │
│           Chat.jsx        VoiceAssistant.jsx      Settings.jsx │
│         (AI + Automation)   (Voice Agent)        (Providers)   │
└───────────────────────────────┬────────────────────────────────┘
                                 │  REST API (axios)
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVER — Express API                       │
│                                                                │
│   authController · aiController · automationController        │
│   fsController · settingsRoutes · UserAnalytics · subscription │
│                                                                │
│   ┌────────────────────────────────────────────────────────┐ │
│   │  automationRegistry.js  →  plugin modules:              │ │
│   │  fileModule · browserModule · mediaModule ·              │ │
│   │  productivityModule · studyModule                        │ │
│   └────────────────────────────────────────────────────────┘ │
│                                                                │
│   aiProviderManager.js → routePrompt() → Gemini/Groq/Cerebras │
│   memoryService.js → persistent AI memory + event bus          │
└───────────────────────────────┬────────────────────────────────┘
                                 ▼
              MongoDB  ·  AI Provider APIs  ·  Vercel / Railway
```

<details>
<summary><strong>📦 Core abstractions (click to expand)</strong></summary>
<br/>

Harvox is built around a small set of shared primitives that every feature routes through:

| Primitive | Role |
|:---|:---|
| `logActivity()` | Central activity logger used across nearly every module |
| `runPS()` / `execCmd()` | Command execution engine behind OS-level automations |
| `useAuthStore` | Client-side session/auth state |
| `routePrompt()` | AI provider routing with failover and cost tracking |
| `registerModule()` | Plugin registration for the automation engine |

</details>

<br/>

## ⚙️ Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB instance (local or Atlas)
- API keys for at least one AI provider (Gemini / Groq / Cerebras / OpenRouter)
- *(Optional)* ElevenLabs API key for voice features

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-org>/harvox-ai.git
cd harvox-ai

# Install dependencies (client + server)
npm install

# Configure environment variables
cp .env.example .env
```

### Environment Variables

```env
# Server
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# AI Providers
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
CEREBRAS_API_KEY=your_cerebras_key
OPENROUTER_API_KEY=your_openrouter_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Run Locally

```bash
# Start backend
cd server && npm run dev

# Start frontend
cd client && npm run dev
```

The app will be available at `http://localhost:5173` (client) and `http://localhost:5000` (API).

### Run with Docker

```bash
docker compose up --build
```

<br/>

## 🚢 Deployment

| Target | Config |
|:---|:---|
| **Frontend** | Vercel (`vercel.json`) |
| **Backend** | Railway (Docker-based, with health checks) |
| **CI** | GitHub Actions (`.github/workflows/ci.yml`) |

Deployments can also be triggered directly from within the app via the built-in `deployVercel()` / `deployRailway()` automation actions.

<br/>

## 📁 Project Structure

```
harvox-ai/
├── client/
│   ├── src/
│   │   ├── components/       # Shared UI kit (NeonButton, GlassCard, etc.)
│   │   ├── pages/             # Landing, Auth, Dashboard, Admin, App pages
│   │   └── store/             # Zustand stores (auth, sidebar)
│   └── index.html
├── server/
│   ├── controllers/           # auth, ai, automation, fs, settings
│   ├── services/
│   │   ├── automation/
│   │   │   └── modules/       # file, browser, media, productivity, study
│   │   ├── aiProviderManager.js
│   │   ├── automationService.js
│   │   ├── memoryService.js
│   │   └── rollbackService.js
│   └── models/
├── docker-compose.yml
├── vercel.json
└── .github/workflows/ci.yml
```

<br/>

## 🗺️ Roadmap

- [ ] Split `automationController.js` into per-domain controllers
- [ ] Resolve automation ↔ rollback import cycle
- [ ] Expand automation module marketplace (plugin SDK)
- [ ] Add granular access control for environment/deployment actions
- [ ] Mobile-responsive Workspace OS

<br/>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "feat: add your feature"

# Push and open a PR
git push origin feature/your-feature-name
```

<br/>

## 📄 License

This project is proprietary. All rights reserved © Harvox AI.

<br/>

<div align="center">

**Built with ⚡ by the Harvox AI team**

[⬆ Back to top](#-harvox-ai)

</div>
