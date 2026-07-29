// In-memory-only store for the current access token.
//
// The access token deliberately lives ONLY in memory (never localStorage/
// sessionStorage) so it can't be lifted by an XSS payload reading storage.
// AuthContext is the source of truth for React renders; this module lets
// non-React code (authFetch) read/write the same value without importing
// React hooks.

let accessToken: string | null = null
let unauthorizedHandler: (() => void) | null = null

export const tokenStore = {
  getToken(): string | null {
    return accessToken
  },
  setToken(token: string | null): void {
    accessToken = token
  },
  // AuthContext registers a handler that clears auth state + sends the user
  // back to /login whenever a refresh attempt definitively fails.
  setUnauthorizedHandler(handler: (() => void) | null): void {
    unauthorizedHandler = handler
  },
  notifyUnauthorized(): void {
    if (unauthorizedHandler) unauthorizedHandler()
  },
}
