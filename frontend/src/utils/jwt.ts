// Decodes the payload of a JWT WITHOUT verifying its signature.
// This is only ever used client-side to read the `exp` claim so we can
// schedule a proactive refresh — never for any kind of trust decision.
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

// Returns milliseconds until the token's `exp` claim, or null if it can't be read.
export function msUntilExpiry(token: string): number | null {
  const payload = decodeJwtPayload<{ exp?: number }>(token)
  if (!payload?.exp) return null
  return payload.exp * 1000 - Date.now()
}
