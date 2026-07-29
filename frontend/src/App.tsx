// import { Routes, Route, Navigate } from 'react-router-dom'
// import MainLayout from '@/components/layout/MainLayout'
// import ProtectedRoute from '@/components/common/ProtectedRoute'
// import LoginPage from '@/pages/LoginPage'
// import HomePage from '@/pages/HomePage'
// import AboutPage from '@/pages/AboutPage'
// import NotFoundPage from '@/pages/NotFoundPage'

// function App() {
//   return (
//     <Routes>

//       {/* Public routes — anyone can visit */}
//       <Route path="/"      element={<Navigate to="/login" replace />} />
//       <Route path="/login" element={<LoginPage />} />

//       {/* Protected routes — only logged in users */}
//       <Route element={<MainLayout />}>
//         <Route path="/home" element={
//           <ProtectedRoute>
//             <HomePage />
//           </ProtectedRoute>
//         } />
//         <Route path="/about" element={
//           <ProtectedRoute>
//             <AboutPage />
//           </ProtectedRoute>
//         } />
//       </Route>

//       {/* 404 */}
//       <Route path="*" element={<NotFoundPage />} />

//     </Routes>
//   )
// }

// export default App


// import { Routes, Route, Navigate } from 'react-router-dom'
// import MainLayout from '@/components/layout/MainLayout'
// import HomePage from '@/pages/HomePage'
// import AboutPage from '@/pages/AboutPage'
// import NotFoundPage from '@/pages/NotFoundPage'
// import LoginPage from '@/pages/LoginPage'
// import RegisterPage from '@/pages/RegisterPage'    // ← Phase 1

// function App() {
//   return (
//     <Routes>
//       {/* Public routes — no JWT needed */}
//       <Route path="/"              element={<Navigate to="/login" replace />} />
//       <Route path="/login"         element={<LoginPage />} />
//       <Route path="/register"      element={<RegisterPage />} />       {/* Phase 1 */}
      

//       {/* Protected routes — inside MainLayout with Navbar + Footer */}
//       <Route element={<MainLayout />}>
//         <Route path="/home"  element={<HomePage />} />
//         <Route path="/about" element={<AboutPage />} />
//       </Route>

//       <Route path="*" element={<NotFoundPage />} />
//     </Routes>
//   )
// }

// export default App

import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout    from '@/components/layout/MainLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import HomePage      from '@/pages/HomePage'
import AboutPage     from '@/pages/AboutPage'
import NotFoundPage  from '@/pages/NotFoundPage'
import LoginPage     from '@/pages/LoginPage'
import RegisterPage  from '@/pages/RegisterPage'       // Phase 1
import VerifyEmailPage from '@/pages/VerifyEmailPage'  // Phase 1
import SessionsPage  from '@/pages/SessionsPage'       // Phase 2: multi-session management
import ForgotPasswordPage from '@/pages/ForgotPasswordPage' // Phase 3: forgot password
import ResetPasswordPage  from '@/pages/ResetPasswordPage'  // Phase 3: reset password
import OAuthCallbackPage  from '@/pages/OAuthCallbackPage' // Phase 3: continue with Google

function App() {
  return (
    <Routes>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ── Public routes — no token needed ─────────────────── */}
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/register"     element={<RegisterPage />} />

      {/*
        /verify-email is called when user clicks link in email:
        e.g. http://localhost:5173/verify-email?token=abc123
        Backend sends: http://localhost:8080/api/auth/verify-email?token=abc123
        But frontend also needs this route to show the result page
      */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/*
        Google redirects here after /api/auth/google/callback has already
        set the refreshToken cookie — this page just picks up the session.
      */}
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      {/* ── Protected routes — JWT token required ────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={
          <ProtectedRoute><HomePage /></ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute><AboutPage /></ProtectedRoute>
        } />
        <Route path="/sessions" element={
          <ProtectedRoute><SessionsPage /></ProtectedRoute>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  )
}

export default App

