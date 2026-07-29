import type {
  RegisterRequest,
  RegisterResponse,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  Session,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserSummary,
} from '@/types/auth'
import { authFetch } from './authFetch'
import { tokenStore } from './tokenStore'

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw { response: { status: res.status, data } }
  return data as T
}

const authService = {

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleResponse<RegisterResponse>(res)
  },

  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const res = await authFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    return handleResponse<VerifyEmailResponse>(res)
  },

  resendVerification: async (
    data: ResendVerificationRequest
  ): Promise<ResendVerificationResponse> => {
    const res = await authFetch('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleResponse<ResendVerificationResponse>(res)
  },

  // ── Session creation ─────────────────────────────────────────
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false) // never let a failed login trigger a refresh retry
    const result = await handleResponse<LoginResponse>(res)
    tokenStore.setToken(result.accessToken)
    return result
  },

  // ── Session maintenance ──────────────────────────────────────
  // Silent refresh: relies solely on the HttpOnly refresh cookie.
  refresh: async (): Promise<LoginResponse> => {
    const res = await authFetch('/auth/refresh', { method: 'POST' }, false)
    const result = await handleResponse<LoginResponse>(res)
    tokenStore.setToken(result.accessToken)
    return result
  },

  // ── Session termination ──────────────────────────────────────
  logout: async (): Promise<MessageResponse> => {
    const res = await authFetch('/auth/logout', { method: 'POST' }, false)
    tokenStore.setToken(null)
    return handleResponse<MessageResponse>(res)
  },

  // ── Multi-session management ─────────────────────────────────
  getSessions: async (): Promise<Session[]> => {
    const res = await authFetch('/auth/sessions')
    return handleResponse<Session[]>(res)
  },

  revokeSession: async (familyId: string): Promise<MessageResponse> => {
    const res = await authFetch(`/auth/sessions/${familyId}`, { method: 'DELETE' })
    return handleResponse<MessageResponse>(res)
  },

  logoutAllDevices: async (): Promise<MessageResponse> => {
    const res = await authFetch('/auth/sessions/logout-all', { method: 'POST' })
    tokenStore.setToken(null)
    return handleResponse<MessageResponse>(res)
  },

  // ── Forgot / reset password ──────────────────────────────────
  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const res = await authFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false)
    return handleResponse<MessageResponse>(res)
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const res = await authFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false)
    return handleResponse<MessageResponse>(res)
  },

  // ── Users (private API, rendered on the Home screen) ────────
  getUsers: async (): Promise<UserSummary[]> => {
    const res = await authFetch('/users')
    return handleResponse<UserSummary[]>(res)
  },

  getMe: async (): Promise<UserSummary> => {
    const res = await authFetch('/users/me')
    return handleResponse<UserSummary>(res)
  },

  updateUserRole: async (userId: string, role: string): Promise<UserSummary> => {
    const res = await authFetch(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
    return handleResponse<UserSummary>(res)
  },

}

export default authService
