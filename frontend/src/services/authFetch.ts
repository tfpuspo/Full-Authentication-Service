import { tokenStore } from './tokenStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

// Paths that must NEVER trigger the 401 -> refresh -> retry dance
// (refresh itself, and login/register which are expected to 401/other on bad input).
const NO_RETRY_PATHS = ['/auth/refresh', '/auth/login', '/auth/register']

// Ensures concurrent 401s only trigger a single /auth/refresh call.
let refreshInFlight: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return null

    const data = await res.json()
    tokenStore.setToken(data.accessToken ?? null)
    return data.accessToken ?? null
  } catch {
    return null
  }
}

function getSharedRefresh(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

/**
 * Fetch wrapper for all authenticated API calls.
 *  - Adds `Authorization: Bearer <accessToken>` when a token is present.
 *  - Always sends cookies (`credentials: include`) so the HttpOnly refresh
 *    cookie is included for endpoints that need it.
 *  - On a 401, transparently refreshes the access token once and retries
 *    the original request. If refresh also fails, the caller's
 *    "unauthorized" handler (registered by AuthContext) is invoked so the
 *    app can clear auth state and redirect to /login.
 */
export async function authFetch(
  path: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<Response> {
  const token = tokenStore.getToken()
  const headers = new Headers(options.headers)

  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const skipRetry = NO_RETRY_PATHS.some(p => path.startsWith(p))

  if (res.status === 401 && allowRetry && !skipRetry) {
    const newToken = await getSharedRefresh()
    if (newToken) {
      return authFetch(path, options, false)
    }
    tokenStore.notifyUnauthorized()
  }

  return res
}
