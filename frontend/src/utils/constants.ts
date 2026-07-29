export const APP_NAME = import.meta.env.VITE_APP_TITLE ?? 'My App'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const ROUTES = {
  HOME: '/home',
  ABOUT: '/about',
  SESSIONS: '/sessions',
  LOGIN: '/login',
  REGISTER: '/register',
} as const
