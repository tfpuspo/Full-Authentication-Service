import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import authService from '@/services/authService'
import { tokenStore } from '@/services/tokenStore'
import { msUntilExpiry } from '@/utils/jwt'
import type { UserRole } from '@/types/auth'

interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextValue {
  accessToken: string | null
  user: AuthUser | null
  // true only during the initial silent-refresh attempt on app load
  isLoading: boolean
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
  // Calls the backend logout endpoint (revokes the session server-side),
  // then clears local state. Never throws — logout should always "succeed"
  // from the UI's point of view.
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Refresh this many ms before the access token actually expires.
const REFRESH_SKEW_MS = 60_000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const setAuth = useCallback((token: string, authUser: AuthUser) => {
    tokenStore.setToken(token)
    setAccessToken(token)
    setUser(authUser)
  }, [])

  const clearAuth = useCallback(() => {
    tokenStore.setToken(null)
    setAccessToken(null)
    setUser(null)
    clearRefreshTimer()
  }, [clearRefreshTimer])

  // ── Auto refresh on access token expiry ─────────────────────────
  // Whenever we have a token, schedule a silent refresh shortly before it
  // expires. If that refresh fails (session revoked/expired elsewhere),
  // fall back to clearing auth so the user is routed back to /login.
  const scheduleRefresh = useCallback((token: string) => {
    clearRefreshTimer()
    const msLeft = msUntilExpiry(token)
    if (msLeft === null) return

    const delay = Math.max(msLeft - REFRESH_SKEW_MS, 5_000)
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const data = await authService.refresh()
        setAuth(data.accessToken, { id: data.id, name: data.name, email: data.email, role: data.role })
        scheduleRefresh(data.accessToken)
      } catch {
        clearAuth()
      }
    }, delay)
  }, [clearAuth, clearRefreshTimer, setAuth])

  useEffect(() => {
    if (accessToken) scheduleRefresh(accessToken)
    return clearRefreshTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  // ── Silent refresh on app load ───────────────────────────────────
  // Restores the session from the HttpOnly refresh cookie, if any, so a
  // page reload doesn't force the user back to /login.
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const data = await authService.refresh()
        if (!cancelled) {
          setAuth(data.accessToken, { id: data.id, name: data.name, email: data.email, role: data.role })
        }
      } catch {
        if (!cancelled) clearAuth()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Reactive refresh failure (from authFetch's 401 handling) ─────
  useEffect(() => {
    tokenStore.setUnauthorizedHandler(() => clearAuth())
    return () => tokenStore.setUnauthorizedHandler(null)
  }, [clearAuth])

  // ── Session termination ──────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Even if the network call fails, still clear local state below.
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  return (
    <AuthContext.Provider value={{ accessToken, user, isLoading, setAuth, clearAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
