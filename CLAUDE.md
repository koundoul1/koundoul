# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on http://localhost:3002
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint (max-warnings 0, strict)
npm test             # Run Jest tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report (70% threshold required)
```

To run a single test file:
```bash
npx jest src/utils/__tests__/errorAnalyzer.test.js
```

## Environment

Copy `.env.example` to `.env` and set:
```env
VITE_API_URL=http://localhost:5000   # or https://koundoul-backend.onrender.com in prod
```

The Vite dev server proxies `/api` → `http://localhost:3001`. The `VITE_` prefix is required for Vite to expose variables to the client.

## Architecture

**Koundoul** is a French/English educational platform (math/science) with gamification (badges, flashcards, challenges, quizzes).

### Provider hierarchy (`src/App.jsx`)
```
I18nProvider → AuthProvider → Router → MobileNavBar + Routes
```
All routes are defined in `src/App.jsx`. Most routes are wrapped in `<ProtectedRoute>`.

### Key modules

- **`src/services/api.js`** — Single API client (custom `fetch` wrapper, not axios). All backend calls go through `api.*` namespace methods. Applies JWT from `localStorage`, handles 401 auto-logout, has 2-minute timeout for `/solver` and `/coach` routes.

- **`src/context/AuthContext.jsx`** — Auth state via `useReducer`. Exports `AuthProvider` and `useAuth()` hook. Persists token/user in `localStorage`.

- **`src/hooks/useTranslation.jsx`** — i18n via `I18nProvider` + `useTranslation()` hook. Two languages: `fr` (default) and `en`. Translation keys use dot notation (e.g. `t('nav.home')`). Strings live in `src/i18n/translations.js`. Language preference is synced to backend when authenticated.

- **`src/utils/learningProfiles.js`** — Defines 4 learning profiles (visual, auditory, kinesthetic, reading/writing) used to personalize explanations in the Solver and exercises.

- **`src/utils/errorAnalyzer.js`** — Analyzes student errors and suggests targeted hints.

- **`src/data/`** — Static data: `formulas.js`, `physics-constants.js`, `unit-conversions.js`.

### UI conventions
- Styling: Tailwind CSS + custom themes in `src/styles/` (`koundoul-dark-theme.css`, `pedagogical-colors.css`). Dark background (`bg-gray-900`) is the default app shell.
- Icons: Lucide React
- Math rendering: KaTeX / react-katex
- Charts: Plotly.js / react-plotly.js
- Navigation: `MobileNavBar` (mobile-first bottom nav) replaces the old `Header`/`Footer`. On desktop (`lg:` breakpoint), bottom padding is removed.
- Some pages have both a "New" and legacy version (e.g. `NewHome`/`Home`, `NewDashboard`/`Dashboard`); the new versions are active.

### PWA
Service worker at `public/sw.js`, manifest at `public/manifest.json`. `src/hooks/usePWA.js` handles install prompts.

### Testing
Tests use Jest + jsdom. Test files are colocated in `__tests__/` subdirectories. Coverage threshold is 70% across branches/functions/lines/statements.
