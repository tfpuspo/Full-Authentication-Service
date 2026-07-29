// import { useEffect, useState } from 'react'
// import { Link, useSearchParams } from 'react-router-dom'
// import authService from '@/services/authService'

// // ── Types ──────────────────────────────────────────────────────
// type Status = 'loading' | 'success' | 'error'

// // ── Component ──────────────────────────────────────────────────
// export default function VerifyEmailPage() {
//   const [searchParams] = useSearchParams()

//   const [status,      setStatus]      = useState<Status>('loading')
//   const [message,     setMessage]     = useState('')
//   const [resendEmail, setResendEmail] = useState('')
//   const [resendError, setResendError] = useState('')
//   const [resending,   setResending]   = useState(false)
//   const [resendDone,  setResendDone]  = useState(false)

//   // ── On mount — read token from URL and call backend ───────
//   useEffect(() => {
//     const token = searchParams.get('token')

//     if (!token) {
//       setStatus('error')
//       setMessage('No verification token found in the URL.')
//       return
//     }

//     authService
//       .verifyEmail(token)
//       .then(data => {
//         setMessage(data.message)
//         setStatus('success')
//       })
//       .catch((err: { response?: { data?: { message?: string } } }) => {
//         setMessage(
//           err.response?.data?.message ??
//           'This link is invalid or has expired. Please request a new one.'
//         )
//         setStatus('error')
//       })
//   }, [searchParams])

//   // ── Resend verification email ──────────────────────────────
//   const handleResend = async () => {
//     if (!resendEmail.trim()) {
//       setResendError('Please enter your email address.')
//       return
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendEmail)) {
//       setResendError('Please enter a valid email address.')
//       return
//     }

//     setResendError('')
//     setResending(true)

//     try {
//       const data = await authService.resendVerification({ email: resendEmail.trim() })
//       setResendDone(true)
//       setMessage(data.message)
//     } catch (err: unknown) {
//       const error = err as { response?: { data?: { message?: string } } }
//       setResendError(
//         error.response?.data?.message ?? 'Could not resend email. Please try again.'
//       )
//     } finally {
//       setResending(false)
//     }
//   }

//   // ── Render ─────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <div className="w-full max-w-sm">

//         {/* ── Loading state ─────────────────────────────────── */}
//         {status === 'loading' && (
//           <div className="text-center space-y-4">
//             <svg
//               className="h-12 w-12 animate-spin text-primary-600 mx-auto"
//               viewBox="0 0 24 24"
//               fill="none"
//             >
//               <circle
//                 className="opacity-25" cx="12" cy="12" r="10"
//                 stroke="currentColor" strokeWidth="4"
//               />
//               <path
//                 className="opacity-75" fill="currentColor"
//                 d="M4 12a8 8 0 018-8v8H4z"
//               />
//             </svg>
//             <p className="text-gray-500 text-sm">Verifying your email address…</p>
//           </div>
//         )}

//         {/* ── Success state ─────────────────────────────────── */}
//         {status === 'success' && (
//           <div className="text-center space-y-6">
//             {/* Green checkmark */}
//             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//               <svg
//                 className="w-10 h-10 text-green-600"
//                 fill="none" viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round" strokeLinejoin="round"
//                   strokeWidth={2} d="M5 13l4 4L19 7"
//                 />
//               </svg>
//             </div>

//             <div>
//               <h2 className="text-2xl font-semibold text-gray-900 mb-2">
//                 Email verified!
//               </h2>
//               <p className="text-sm text-gray-500">{message}</p>
//             </div>

//             <Link
//               to="/login"
//               className="inline-block btn-primary px-8 py-2.5 rounded-lg text-sm"
//             >
//               Go to login
//             </Link>
//           </div>
//         )}

//         {/* ── Error state ───────────────────────────────────── */}
//         {status === 'error' && (
//           <div className="space-y-6">

//             {/* Red X */}
//             <div className="text-center">
//               <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg
//                   className="w-10 h-10 text-red-600"
//                   fill="none" viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round" strokeLinejoin="round"
//                     strokeWidth={2} d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </div>
//               <h2 className="text-2xl font-semibold text-gray-900 mb-2">
//                 Verification failed
//               </h2>
//               <p className="text-sm text-gray-500">{message}</p>
//             </div>

//             {/* Resend email form */}
//             {!resendDone ? (
//               <div className="card space-y-4">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-900 mb-1">
//                     Request a new link
//                   </h3>
//                   <p className="text-xs text-gray-500">
//                     Enter your email address and we will send a fresh verification link.
//                   </p>
//                 </div>

//                 {/* Email input */}
//                 <div>
//                   <label
//                     htmlFor="resend-email"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Email address
//                   </label>
//                   <input
//                     id="resend-email"
//                     type="email"
//                     placeholder="you@example.com"
//                     value={resendEmail}
//                     onChange={e => {
//                       setResendEmail(e.target.value)
//                       if (resendError) setResendError('')
//                     }}
//                     className={`input ${resendError ? 'border-red-400 bg-red-50' : ''}`}
//                   />
//                   {resendError && (
//                     <p className="mt-1 text-xs text-red-600">{resendError}</p>
//                   )}
//                 </div>

//                 {/* Resend button */}
//                 <button
//                   onClick={handleResend}
//                   disabled={resending}
//                   className="btn-primary w-full"
//                 >
//                   {resending ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
//                         <circle className="opacity-25" cx="12" cy="12" r="10"
//                           stroke="currentColor" strokeWidth="4" />
//                         <path className="opacity-75" fill="currentColor"
//                           d="M4 12a8 8 0 018-8v8H4z" />
//                       </svg>
//                       Sending…
//                     </span>
//                   ) : 'Resend verification email'}
//                 </button>
//               </div>
//             ) : (
//               /* Resend success message */
//               <div className="card text-center space-y-3">
//                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//                   <svg className="w-5 h-5 text-green-600" fill="none"
//                     viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round"
//                       strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                 </div>
//                 <p className="text-sm font-medium text-gray-900">{message}</p>
//                 <p className="text-xs text-gray-400">
//                   Check your inbox and spam folder.
//                 </p>
//               </div>
//             )}

//             {/* Back links */}
//             <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
//               <Link to="/login" className="hover:text-gray-600 underline">
//                 Back to login
//               </Link>
//               <span>·</span>
//               <Link to="/register" className="hover:text-gray-600 underline">
//                 Create new account
//               </Link>
//             </div>

//           </div>
//         )}

//       </div>
//     </div>
//   )
// }


import { useEffect, useRef, useState } from 'react'  // CHANGED: added useRef
import { Link, useSearchParams } from 'react-router-dom'
import authService from '@/services/authService'

// ── Types ──────────────────────────────────────────────────────
type Status = 'loading' | 'success' | 'error'

// ── Component ──────────────────────────────────────────────────
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()

  const [status,      setStatus]      = useState<Status>('loading')
  const [message,     setMessage]     = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendError, setResendError] = useState('')
  const [resending,   setResending]   = useState(false)
  const [resendDone,  setResendDone]  = useState(false)

  // NEW: guard ref to prevent StrictMode double-invoking the verify call
  const verifiedRef = useRef(false)

  // ── On mount — read token from URL and call backend ───────
  useEffect(() => {
    // NEW: skip second invocation caused by React StrictMode in dev
    if (verifiedRef.current) return
    verifiedRef.current = true

    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('No verification token found in the URL.')
      return
    }

    authService
      .verifyEmail(token)
      .then(data => {
        setMessage(data.message)
        setStatus('success')
      })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        setMessage(
          err.response?.data?.message ??
          'This link is invalid or has expired. Please request a new one.'
        )
        setStatus('error')
      })
  }, [searchParams])

  // ── Resend verification email ──────────────────────────────
  const handleResend = async () => {
    if (!resendEmail.trim()) {
      setResendError('Please enter your email address.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendEmail)) {
      setResendError('Please enter a valid email address.')
      return
    }

    setResendError('')
    setResending(true)

    try {
      const data = await authService.resendVerification({ email: resendEmail.trim() })
      setResendDone(true)
      setMessage(data.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setResendError(
        error.response?.data?.message ?? 'Could not resend email. Please try again.'
      )
    } finally {
      setResending(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        {/* ── Loading state ─────────────────────────────────── */}
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <svg
              className="h-12 w-12 animate-spin text-primary-600 mx-auto"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <p className="text-gray-500 text-sm">Verifying your email address…</p>
          </div>
        )}

        {/* ── Success state ─────────────────────────────────── */}
        {status === 'success' && (
          <div className="text-center space-y-6">
            {/* Green checkmark */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Email verified!
              </h2>
              <p className="text-sm text-gray-500">{message}</p>
            </div>

            <Link
              to="/login"
              className="inline-block btn-primary px-8 py-2.5 rounded-lg text-sm"
            >
              Go to login
            </Link>
          </div>
        )}

        {/* ── Error state ───────────────────────────────────── */}
        {status === 'error' && (
          <div className="space-y-6">

            {/* Red X */}
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none" viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Verification failed
              </h2>
              <p className="text-sm text-gray-500">{message}</p>
            </div>

            {/* Resend email form */}
            {!resendDone ? (
              <div className="card space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Request a new link
                  </h3>
                  <p className="text-xs text-gray-500">
                    Enter your email address and we will send a fresh verification link.
                  </p>
                </div>

                {/* Email input */}
                <div>
                  <label
                    htmlFor="resend-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="resend-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resendEmail}
                    onChange={e => {
                      setResendEmail(e.target.value)
                      if (resendError) setResendError('')
                    }}
                    className={`input ${resendError ? 'border-red-400 bg-red-50' : ''}`}
                  />
                  {resendError && (
                    <p className="mt-1 text-xs text-red-600">{resendError}</p>
                  )}
                </div>

                {/* Resend button */}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="btn-primary w-full"
                >
                  {resending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending…
                    </span>
                  ) : 'Resend verification email'}
                </button>
              </div>
            ) : (
              /* Resend success message */
              <div className="card text-center space-y-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 text-green-600" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">{message}</p>
                <p className="text-xs text-gray-400">
                  Check your inbox and spam folder.
                </p>
              </div>
            )}

            {/* Back links */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <Link to="/login" className="hover:text-gray-600 underline">
                Back to login
              </Link>
              <span>·</span>
              <Link to="/register" className="hover:text-gray-600 underline">
                Create new account
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
