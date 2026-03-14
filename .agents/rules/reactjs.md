---
trigger: always_on
---

# React + TypeScript Development Standards

## 1. Component Architecture & Typing
- **TypeScript Only:** Write strictly typed functional components (`React.FC` is forbidden; type props directly). 
- **File Extensions:** Use `.tsx` for components and `.ts` for utility files. `.jsx` and `.js` are strictly prohibited.
- **Prop Validation:** Do NOT use `PropTypes`. Rely entirely on TypeScript `interface` or `type` definitions for props.
- **State:** Use `useState` for simple local state and `useReducer` for complex localized logic.

## 2. Global State & Data Flow
- **State Management:** Use `Zustand` exclusively for global state. Redux and Context API are prohibited for global stores. 
- **Undo/Redo:** Implement the `Zundo` middleware within Zustand stores if history tracking is required.
- **Data Fetching:** All external API requests MUST pass through the shared `@/lib/axios` client. Do not use Apollo, SWR, or instantiate raw fetch/axios calls inside components.

## 3. Styling & UI
- **Framework:** TailwindCSS v4 exclusively. Do not use CSS Modules, Styled Components, or external `.css`/`.scss` files.
- **Component Design:** Build reusable UI components from scratch using Tailwind utilities. 
- **Class Merging:** Always use `cn()` (combining `clsx` and `tailwind-merge`) when applying dynamic or conditional Tailwind classes to prevent specificity collisions.

## 4. Hooks & Performance
- **Custom Hooks:** Extract reusable business logic and complex `useEffect` chains into custom hooks (e.g., `useAuth`, `useMatchmaking`).
- **Optimization:** Use `useMemo` and `useCallback` ONLY when passing props to heavily memoized child components or preventing expensive recalculations. Do not prematurely optimize.
- **Refs:** Use `useRef` for direct DOM manipulation and storing mutable values that should not trigger re-renders.

## 5. Routing
- **Library:** `react-router-dom` exclusively.
- **Implementation:** Use modern data routers (`createBrowserRouter`). Do not use Next.js routing paradigms (`next/router` or `next/navigation`).

## 6. Forms
- **Handling:** Use controlled components. For complex forms, use `react-hook-form`.
- **Validation:** Integrate `zod` for schema-based validation alongside TypeScript interfaces to guarantee type safety from input to API payload.