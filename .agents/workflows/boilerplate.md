---
description: 
---

# Workflow: Scaffold MERN Monorepo Boilerplate

Execute the following steps sequentially to scaffold the base workspace architecture. Do not skip steps, and strictly adhere to the project's global TypeScript and architecture rules.

## Phase 1: Backend Setup
1. Create the `backend/` directory. Initialize a `package.json` and a strict `tsconfig.json`.
2. Install the necessary dependencies for a TypeScript Express server (e.g., `express`, `mongoose`, `cors`, `dotenv`, and their corresponding `@types`).
3. Scaffold the exact file and folder structure below:
   - `backend/src/modules/` (For feature-based architecture: controllers, models, routes)
   - `backend/src/shared/` (For global middlewares, utilities, and generic types)
   - `backend/src/app.ts` (Express app configuration and middleware setup)
   - `backend/src/server.ts` (Entry point: DB connection and server listener)
   - `backend/src/env.ts` (Centralized environment variable validation)
   - `backend/.env.example`
   - `backend/web.config`
4. Write a basic health-check route in `app.ts`.

## Phase 2: Frontend Setup
1. Scaffold a Vite + React + TypeScript application inside the `frontend/` directory.
2. Install the approved project dependencies: `react-router-dom`, `zustand`, `zundo`, `axios`, `clsx`, `tailwind-merge`, and TailwindCSS v4.
3. Scaffold the exact frontend directory structure inside `frontend/src/`:
   - `assets/` (Images, fonts)
   - `components/` (Reusable UI components)
   - `data/` (Static constants or mock data)
   - `hooks/` (Custom React hooks)
   - `layouts/` (Structural page wrappers)
   - `lib/` (Third-party library configurations)
   - `pages/` (Route-level components)
   - `store/` (Zustand state slices)
   - `types/` (Global TypeScript interfaces)
4. Create the core Vite entry files: `App.tsx`, `main.tsx`, `index.css`, and `App.css`.
5. Create an initial Axios client instance in `frontend/src/lib/axios.ts`.

## Phase 3: Finalization
1. Ensure all generated code passes basic TypeScript compilation without strict errors.
2. Print a brief summary of the completed scaffolding.
3. Provide the exact terminal commands the user needs to start both the frontend and backend development servers.