# Authentication Database — Documentation

A complete JWT-based authentication system using **10 tables**.

---

## Table of Contents

- [Core Tables](#core-tables)
- [Extra Tables](#extra-tables)
- [SQL — All 10 Tables](#sql--all-10-tables)
- [Summary](#summary)

---

## Core Tables

These 4 tables are **always needed** in every project.

| # | Table | Covers |
|---|-------|--------|
| 1 | `users` | Register, store user info |
| 2 | `sessions` | Login, logout, active sessions list |
| 3 | `refresh_tokens` | Stay logged in, remember me |
| 4 | `password_resets` | Forgot password, reset password |

---

## Extra Tables

Add these **only when you need that feature**.

| # | Table | Covers |
|---|-------|--------|
| 5 | `email_verifications` | Verify email on signup |
| 6 | `oauth_accounts` | Login with Google / GitHub |
| 7 | `two_factor_auth` | OTP / 2FA on login |
| 8 | `audit_logs` | Full login history |
| 9 | `failed_login_attempts` | Block brute force after 5 tries |
| 10 | `user_devices` | Trusted devices, remember this device |

---

## SQL — All 10 Tables

### 1. users

Stores every registered user.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

### 2. sessions

Tracks every device login. JWT version — no token column needed.

```sql
CREATE TABLE sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name    VARCHAR(100),
  ip_address     VARCHAR(45),
  user_agent     TEXT,
  last_active_at TIMESTAMP     NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

### 3. refresh_tokens

Keeps users logged in for 30 days. Can be revoked anytime.

```sql
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(500)  NOT NULL UNIQUE,
  is_revoked BOOLEAN       NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP     NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

### 4. password_resets

Handles forgot password and reset password flow.

```sql
CREATE TABLE password_resets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reset_token VARCHAR(500)  NOT NULL UNIQUE,
  is_used     BOOLEAN       NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMP     NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

### 5. email_verifications

Verifies user email on signup with a one-time token.

```sql
CREATE TABLE email_verifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verify_token VARCHAR(500)  NOT NULL UNIQUE,
  is_used      BOOLEAN       NOT NULL DEFAULT FALSE,
  expires_at   TIMESTAMP     NOT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

### 6. oauth_accounts

Supports login with Google, GitHub, Facebook etc.

```sql
CREATE TABLE oauth_accounts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider     VARCHAR(50)   NOT NULL,
  provider_id  VARCHAR(255)  NOT NULL,
  access_token TEXT,
  created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_id)
);
```

---

### 7. two_factor_auth

Handles OTP / 2FA codes that expire every 30 seconds.

```sql
CREATE TABLE two_factor_auth (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_code   VARCHAR(6)    NOT NULL,
  is_enabled BOOLEAN       NOT NULL DEFAULT FALSE,
  is_used    BOOLEAN       NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP     NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

### 8. audit_logs

Stores full history of every login, logout, and password change.

```sql
CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID          REFERENCES users(id) ON DELETE SET NULL,
  action     VARCHAR(100)  NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status     VARCHAR(20)   NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

### 9. failed_login_attempts

Blocks brute force attacks after 5 failed attempts.

```sql
CREATE TABLE failed_login_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255)  NOT NULL,
  ip_address    VARCHAR(45)   NOT NULL,
  attempt_count INT           NOT NULL DEFAULT 1,
  blocked_until TIMESTAMP,
  attempted_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

### 10. user_devices

Remembers trusted devices so users skip 2FA on known devices.

```sql
CREATE TABLE user_devices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name  VARCHAR(100),
  is_trusted   BOOLEAN       NOT NULL DEFAULT FALSE,
  ip_address   VARCHAR(45),
  last_used_at TIMESTAMP     NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

## Summary

| # | Table | Covers | Type |
|---|-------|--------|------|
| 1 | `users` | Register, store user info | Core |
| 2 | `sessions` | Login, logout, active sessions list | Core |
| 3 | `refresh_tokens` | Stay logged in, remember me | Core |
| 4 | `password_resets` | Forgot password, reset password | Core |
| 5 | `email_verifications` | Verify email on signup | Extra |
| 6 | `oauth_accounts` | Login with Google / GitHub | Extra |
| 7 | `two_factor_auth` | OTP / 2FA on login | Extra |
| 8 | `audit_logs` | Full login history | Extra |
| 9 | `failed_login_attempts` | Block brute force after 5 tries | Extra |
| 10 | `user_devices` | Trusted devices, remember this device | Extra |

> Start with the **4 core tables** and add extra tables only when you need that feature.
