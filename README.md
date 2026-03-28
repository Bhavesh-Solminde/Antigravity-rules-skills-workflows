# `.agents` Configuration Directory

Welcome to the `.agents` folder! This directory contains configuration files, development standards, workflows, and specialized skills that govern the behavior, code generation, and architectural decisions of the AI agent within this workspace.

By centralizing these instructions, the agent ensures highly consistent, production-grade output tailored to the specific needs of this MERN (MongoDB, Express, React, Node) stack project.

## Directory Structure

### 1. `rules/`
The files in this directory enforce strict coding standards and architectural constraints. They are configured with `trigger: always_on` to ensure the agent adheres to these principles on every interaction.

*   **`global-standards.md`**: Defines global constraints such as enforcing strict TypeScript, using `npm` exclusively, using ES Modules, and setting up the expected structural separation of the frontend (Vite/React) and backend (Express/MongoDB).
*   **`reactjs.md`**: Outlines deep React constraints, strictly enforcing functional components, `Zustand` for state management, strict integration of `React Router DOM` and `TailwindCSS v4`, and forbidding older patterns (like `PropTypes` or Class Components).

### 2. `skills/`
Skills represent specialized behavioral profiles or expert knowledge domains that the agent can adopt when handling specific requests.

*   **`frontend/SKILL.md` (`frontend-design`)**: A specialized guide for generating outstanding, distinctive, and highly creative frontend UI/UX. It drives the agent away from generic, plain, "AI-like" aesthetics towards bold, maximalist, or highly-refined minimalist production-ready views with deliberate typography, thoughtful motion, and engaging composition.

### 3. `workflows/`
Workflows define precise, step-by-step procedures to accomplish complex tasks securely and consistently.

*   **`boilerplate.md`**: A structured sequence for scaffolding a complete MERN monorepo from scratch. It guides the creation of both the backend (Express routes, MongoDB integration, `env.ts`) and the frontend (React, Vite, Tailwind v4, Zustand) components, establishing the exact initial architecture expected for this workspace.

## How it Works
When the AI agent operates in this repository, it automatically reads everything within `.agents` (subject to triggers) to orient itself. 

*   **Rules** are passively enforced to restrict the agent from using forbidden dependencies or incorrect architectures.
*   **Skills** are invoked depending on the nature of the User's prompt to elevate the quality of the generated code.
*   **Workflows** can be called directly by the user (or implicitly inferred) to trigger a structured process, ensuring no steps are missed during scaffolding.
