# FlowSprint

A collaborative agile project management and sprint tracking platform. It is built as a monorepo containing a React client and an Express backend server.

## Features

*   **Sprint Planning**: Create sprints, define story points, track progress, and manage the sprint lifecycle (planned, active, completed, cancelled).
*   **Kanban Board**: Drag-and-drop task board with backlog, todo, in-progress, review, and done lanes.
*   **Real-time Collaboration**: User online/offline presence tracking and comment typing indicators using Socket.io.
*   **Analytics**: Sprint velocity tracking and daily burndown charts.
*   **File Attachments**: Support for uploading and previewing attachments using Cloudinary.
*   **Security**: JWT-based authentication, HTTP-only cookie management, CORS configurations, and API rate limiting.

## Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- TailwindCSS
- Zustand (client state)
- TanStack Query (server state caching)
- React Hook Form + Zod

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Socket.io
- Cloudinary SDK
- Zod (request validation)

## Directory Structure

```text
FlowSprint/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # API clients & base configurations
│   │   ├── components/     # Reusable UI elements
│   │   ├── features/       # Feature-specific code (auth, sprints, tasks)
│   │   └── store/          # Zustand stores
├── server/                 # Express backend
│   ├── src/
│   │   ├── middleware/     # Auth, error handling, rate limits
│   │   ├── models/         # Mongoose schemas
│   │   ├── modules/        # Modular routers and controllers
│   │   └── sockets/        # Socket handlers
```

## Local Development

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB (local or Atlas)

### Setup

1. **Install Dependencies**
   Run from the root directory:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the `server` directory using `server/.env.example` as a template:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/flowsprint
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173

   # Optional Cloudinary Credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Database Credentials Warning**
   Never hardcode the `MONGO_URI` connection string (especially with production Atlas passwords) in the repository. All seeding and script files load `MONGO_URI` dynamically from the environment variables.

4. **Run the Application**
   Start both the backend and frontend servers in development mode:
   ```bash
   npm run dev
   ```
   - Client runs on: `http://localhost:5173`
   - Server runs on: `http://localhost:5000`

## Production Deployment

### Build
To build both packages for production:
```bash
npm run build
```
- Compiles the backend into `server/dist`
- Bundles the frontend static assets into `client/dist`

### Serving Static Files
In production mode (`NODE_ENV=production`), the Express server is configured to serve the frontend client directly from the built `client/dist` folder. 
Any request that does not match an `/api` endpoint is served the static `index.html` file, supporting client-side routing. This allows deploying the entire monorepo on a single dyno or service (running `node server/dist/server.js`).
