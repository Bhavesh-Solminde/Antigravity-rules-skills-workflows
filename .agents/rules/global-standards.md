---
trigger: always_on
---

# Global Architecture and Stack Constraints

## 1. Environment & Package Management
- **Monorepo:** `root/frontend/` and `root/backend/`
- **Package Manager:** Use `npm` ONLY. Never use `pnpm` or `yarn`.
- **Environment Variables:** Use centralized config `src/env.ts`. Access via `ENV`. NEVER use `process.env` directly in business logic.

## 2. Global Language Rules
- **Language:** Strict TypeScript ONLY across the entire stack.
- **Typing:** The use of `any` is strictly prohibited. If you don't know a type, define an `interface` or `type` alias. No implicit returns.
- **Modules:** ES Modules everywhere (`import`/`export`). Never use `require()` or `module.exports`.

## 3. Frontend Architecture (React + Vite)
- **UI/Components:** Build UI components manually using TailwindCSS v4 until a component library is explicitly introduced by the user. Utility merging must use `cn()` (clsx + tailwind-merge).
- **Routing:** Use `react-router-dom`. Never use `next/*`.
- **State Management:** Use `Zustand`. Use `Zundo` middleware for Undo/Redo. Type all state stores strictly.
- **API Calls:** All requests MUST use the shared axios client (`@/lib/axios`). Never create raw axios instances inside components.

## 4. Backend Architecture (Node + Express + MongoDB)
- **Structure:** Feature-based architecture ONLY (e.g., `src/features/auth/auth.controller.ts`, `auth.routes.ts`, `auth.model.ts`). Do not mix logic between features.
- **Controllers:** All controllers MUST be wrapped with `asyncHandler`.
- **Validation:** Type-safe validation MUST run before service logic executes. 
- **Database:** MongoDB + Mongoose. Maintain strict schema-to-interface parity. Every Mongoose schema must have a corresponding exported TypeScript interface.
- **Responses:** All controllers must return standardized classes (`ApiResponse` and `ApiError`). Errors must never be returned as raw responses.