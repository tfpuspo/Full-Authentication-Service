# React + TypeScript + Tailwind CSS Starter

A beginner-friendly project template with a clean, scalable folder structure.

## ✨ Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Zustand | Global state management |
| Axios | HTTP requests |

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Folder Structure

```
src/
├── assets/           # Static files (images, fonts, SVGs)
├── components/
│   ├── ui/           # Reusable primitives (Button, Input, Card, Badge)
│   ├── layout/       # Navbar, Footer, page layouts
│   └── common/       # Shared helpers (LoadingSpinner, ErrorMessage)
├── hooks/            # Custom React hooks (useFetch, useLocalStorage)
├── pages/            # Route-level page components
├── services/         # Axios API instance & interceptors
├── store/            # Zustand global state slices
├── styles/           # Tailwind CSS entry point
├── types/            # Shared TypeScript interfaces & types
└── utils/            # Helper functions & constants
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## 🎨 Adding a New Page

1. Create `src/pages/MyPage.tsx`
2. Add a route in `src/App.tsx`
3. Add a nav link in `src/components/layout/Navbar.tsx`
4. Add the path constant in `src/utils/constants.ts`
