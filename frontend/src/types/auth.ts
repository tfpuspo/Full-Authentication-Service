// ── Register ──────────────────────────────────────────────────
export interface RegisterRequest {
  name:     string
  email:    string
  password: string
}

export interface RegisterResponse {
  id:         string
  name:       string
  email:      string
  isVerified: boolean
  message:    string
}

// ── Email Verification ────────────────────────────────────────
export interface VerifyEmailResponse {
  success: boolean
  message: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ResendVerificationResponse {
  success: boolean
  message: string
}

// ── Login ─────────────────────────────────────────────────────
export interface LoginRequest {
  email:    string
  password: string
}

export interface LoginResponse {
  id:          string
  name:        string
  email:       string
  role:        UserRole
  accessToken: string
}

// ── Logout / generic message ───────────────────────────────────
export interface MessageResponse {
  success: boolean
  message: string
}

// ── Multi-session ────────────────────────────────────────────────
export interface Session {
  familyId:   string
  userAgent:  string | null
  ipAddress:  string | null
  issuedAt:   string
  lastUsedAt: string
  expiresAt:  string
  current:    boolean
}

// ── Forgot / Reset password ─────────────────────────────────────
export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token:       string
  newPassword: string
}

// ── Users (private API rendered on Home screen) ─────────────────
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'
export type AuthProviderType = 'LOCAL' | 'GOOGLE'

export interface UserSummary {
  id:         string
  name:       string
  email:      string
  role:       UserRole
  provider:   AuthProviderType
  isVerified: boolean
  isActive:   boolean
  createdAt:  string
}

// ── API Error ─────────────────────────────────────────────────
export interface ApiError {
  status:  number
  error:   string
  message: string
  errors?: Record<string, string>
}

// ── Form ──────────────────────────────────────────────────────
export interface RegisterFormState {
  name:            string
  email:           string
  password:        string
  confirmPassword: string
}

export interface RegisterFormErrors {
  name?:            string
  email?:           string
  password?:        string
  confirmPassword?: string
  general?:         string
}
