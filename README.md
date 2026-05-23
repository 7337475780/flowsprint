# FlowSprint

FlowSprint is a high-performance, collaborative project management SaaS designed to streamline team workflows, task tracking, and sprint planning. It draws inspiration from industry-leading platforms like Jira, ClickUp, and GoodDay, while prioritizing a streamlined, elegant user experience tailored for modern, agile product teams.

## Why FlowSprint?

Traditional project management tools often suffer from two extremes: they are either overly complex enterprise beasts that slow engineers down, or simple kanban boards that lack the power to plan sprints and track analytics. FlowSprint bridges this gap. It's built for fast-moving startups that need high-fidelity tracking, dynamic view switching (Kanban, List, Backlog), and rich collaborative features, without the administrative friction.

## Technical Stack Overview

FlowSprint is architected as a robust monorepo, pairing a high-performance Express server with a dynamic, reactive React frontend.

### Frontend (`/client`)
- **Core**: React + Vite + TypeScript (for blistering fast dev feedback and strong typing)
- **Styling**: TailwindCSS (for clean, responsive, and utility-driven UI styling)
- **Design & UI**: Custom handcrafted atomic components built with accessibility and dark mode defaults
- **Routing**: React Router (client-side routing with clean layout boundaries)
- **State Management**: Zustand (lightweight, decoupled global state for UI and user preferences)
- **Server Cache**: TanStack Query / React Query (type-safe cache management, automated refetching, and pagination handling)
- **Forms**: React Hook Form + Zod (declarative validation with robust runtime type checking)

### Backend (`/server`)
- **Core**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose (schemaless storage with schema enforcement at application level)
- **Security & Integrity**: 
  - Helmet (secure HTTP headers)
  - CORS (cross-origin resource sharing configuration)
  - Express Rate Limit (API rate limiting to mitigate DDoS/brute-force attacks)
  - Cookie Parser (secure, HTTP-only cookie management)
- **Validation**: Zod schema validators for requests payload structure
- **Logging**: Morgan for HTTP request logging paired with a custom Winston-based console logger
- **Error Handling**: Centrally managed global error handling middleware with unified response contracts

---

## Monorepo Directory Structure

```
FlowSprint/
 ├── package.json         # Root workspace manager
 ├── .gitignore
 ├── README.md            # Root documentation
 ├── client/              # Frontend client application
 └── server/              # Backend Express API
```

---

## Architecture Philosophy

- **Feature-Based Scalability**: The client uses a feature-based folder structure (`features/`) where logical domains (like `tasks`, `sprints`, `users`) contain their own components, state hooks, and API endpoints, keeping them clean and decoupled from general app assets.
- **Fail-Fast Environment Validation**: The backend uses Zod schema-validated configurations at startup. If critical variables like database URIs or session secrets are missing, the server halts immediately with explicit error logs instead of running in a half-configured state.
- **Unified API Contracts**: Standardized API response wrappers (`sendSuccess` and `sendError`) guarantee that the client always receives predictable responses.
- **Lean State Separation**: Zustand is used strictly for client-side UI states (like active sidebar toggle or dark-mode preferences), while server data is completely managed by TanStack Query, eliminating the anti-pattern of duplicating server cache in a global store.

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup Steps
1. **Clone and Install dependencies**
   ```bash
   cd flowsprint
   npm install
   ```

2. **Configure Environment Variables**
   - Create a `.env` file in the `/server` directory using `/server/.env.example` as a baseline.

3. **Run in Development Mode**
   ```bash
   npm run dev
   ```
   This will concurrently spin up:
   - Client dev server: `http://localhost:5173`
   - Server dev server: `http://localhost:5000`
