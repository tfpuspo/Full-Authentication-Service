# Authentication Service

A secure and reusable **Authentication Service** built with **Spring Boot**, **Spring Security**, **JWT**, and **PostgreSQL**. The service provides a complete authentication workflow, including email/password authentication, Google OAuth 2.0, email verification, password recovery, refresh token rotation, and session management.

Designed to be integrated into **microservice-based** and **enterprise** applications.


## Why This Project?

Modern applications require more than a simple login system. A production-ready authentication service should provide secure identity management, token lifecycle management, account verification, password recovery, and session control while remaining reusable across multiple applications.

This project demonstrates industry-standard authentication practices using Spring Boot and Spring Security with a focus on security, scalability, and maintainability.


## Features

### Authentication

- User Registration with Email Verification
- Secure Email & Password Login
- Continue with Google (OAuth 2.0)
- JWT-based Authentication
- Access & Refresh Token Management
- Secure Logout

### Account Recovery

- Forgot Password
- Password Reset via Email
- Resend Email Verification

### Session Management

- Multiple Device Login Support
- Active Session Management
- Logout from All Devices
- Refresh Token Family Revocation

### User Management

- Current Authenticated User Information

### Security

- BCrypt Password Hashing
- Stateless JWT Authentication
- Refresh Token Rotation
- Secure Email Verification Workflow


## Token Management

- JWT Access Tokens returned in the response body
- HttpOnly Cookie-based Refresh Tokens
- Database-backed Refresh Token Storage
- Refresh Token Rotation
- Refresh Token Family Revocation


## Technology Stack

Backend
| Category | Technology |
|----------|------------|
| Language | Java|
| Framework | Spring Boot|
| Security | Spring Security |
| Authentication | JWT (Access & Refresh Tokens) |
| OAuth | Google OAuth 2.0 |
| Database | PostgreSQL |
| Email | Spring Mail |


Frontend
| Category | Technology |
|----------|------------|
| Language | TypeScript |
| Library |	React |
| Styling	| Tailwind CSS |


## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/google` | Continue with Google |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/sessions` | Retrieve active sessions |
| POST | `/api/sessions/logout-all` | Logout from all devices |
| DELETE | `/api/sessions/{familyId}` | Revoke refresh token family |
| GET | `/api/users/me` | Retrieve current authenticated user |

### Configure

Update your application configuration with:

- PostgreSQL credentials
- JWT secret
- Email credentials
- Google OAuth Client ID & Client Secret

## Author

**Tanzila Fardous Puspo**
