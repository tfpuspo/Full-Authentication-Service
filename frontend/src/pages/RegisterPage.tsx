// import { useState, FormEvent, ChangeEvent } from 'react'
// import { Link, useNavigate } from 'react-router-dom'

// interface FormState {
//   name:            string
//   email:           string
//   password:        string
//   confirmPassword: string
// }

// interface FormErrors {
//   name?:            string
//   email?:           string
//   password?:        string
//   confirmPassword?: string
//   general?:         string
// }

// function validate(form: FormState): FormErrors {
//   const errors: FormErrors = {}
//   if (!form.name.trim())
//     errors.name = 'Name is required.'
//   else if (form.name.trim().length < 2)
//     errors.name = 'Name must be at least 2 characters.'
//   if (!form.email.trim())
//     errors.email = 'Email is required.'
//   else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
//     errors.email = 'Please enter a valid email address.'
//   if (!form.password)
//     errors.password = 'Password is required.'
//   else if (form.password.length < 8)
//     errors.password = 'Password must be at least 8 characters.'
//   if (!form.confirmPassword)
//     errors.confirmPassword = 'Please confirm your password.'
//   else if (form.password !== form.confirmPassword)
//     errors.confirmPassword = 'Passwords do not match.'
//   return errors
// }

// function EyeOpen() {
//   return (
//     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//       <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//     </svg>
//   )
// }

// function EyeOff() {
//   return (
//     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//     </svg>
//   )
// }

// export default function RegisterPage() {
//   const navigate = useNavigate()

//   const [form, setForm]           = useState<FormState>({ name: '', email: '', password: '', confirmPassword: '' })
//   const [errors, setErrors]       = useState<FormErrors>({})
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPw, setShowPw]       = useState(false)
//   const [showConf, setShowConf]   = useState(false)
//   const [success, setSuccess]     = useState(false)

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setForm(prev => ({ ...prev, [name]: value }))
//     if (errors[name as keyof FormErrors]) {
//       setErrors(prev => ({ ...prev, [name]: undefined }))
//     }
//   }

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault()

//     const errs = validate(form)
//     if (Object.keys(errs).length > 0) {
//       setErrors(errs)
//       return
//     }

//     setErrors({})
//     setIsLoading(true)

//     try {
//       // Call Spring Boot POST /api/auth/register
//       const response = await fetch('http://localhost:8080/api/auth/register', {
//         method:  'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name:     form.name.trim(),
//           email:    form.email.trim(),
//           password: form.password,
//         }),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         if (response.status === 409) {
//           setErrors({ email: 'This email is already registered. Try signing in.' })
//         } else if (response.status === 400 && data.errors) {
//           setErrors(data.errors as FormErrors)
//         } else {
//           setErrors({ general: data.message ?? 'Something went wrong. Please try again.' })
//         }
//         return
//       }

//       setSuccess(true)

//     } catch {
//       setErrors({ general: 'Could not connect to server. Make sure the backend is running.' })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Success screen
//   if (success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//         <div className="max-w-sm w-full text-center space-y-6">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//             <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//             </svg>
//           </div>
//           <div>
//             <h2 className="text-2xl font-semibold text-gray-900 mb-2">Account created!</h2>
//             <p className="text-sm text-gray-500 leading-relaxed">
//               Your account for <strong>{form.email}</strong> is ready.
//             </p>
//           </div>
//           <button onClick={() => navigate('/login')} className="btn-primary px-8 py-2 rounded-lg text-sm">
//             Go to login
//           </button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen flex">

//       {/* Left branding panel */}
//       <div className="hidden lg:flex lg:w-5/12 bg-primary-900 flex-col justify-center px-12 relative overflow-hidden">
//         <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
//         <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-white/5" />
//         <div className="flex items-center gap-3 mb-12">
//           <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
//           <span className="text-white font-medium text-lg">MyApp</span>
//         </div>
//         <h1 className="text-white text-3xl font-semibold leading-snug mb-4">Create your free account</h1>
//         <p className="text-primary-300 text-sm leading-relaxed mb-10">Join thousands of users. Sign up in seconds.</p>
//         {['Fill in your details', 'Verify your email', 'Start using the app'].map((step, i) => (
//           <div key={i} className="flex items-center gap-3 mb-3">
//             <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
//               {i + 1}
//             </div>
//             <span className="text-primary-200 text-sm">{step}</span>
//           </div>
//         ))}
//       </div>

//       {/* Right form panel */}
//       <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
//         <div className="w-full max-w-sm">

//           <h2 className="text-2xl font-semibold text-gray-900 mb-1">Create account</h2>
//           <p className="text-sm text-gray-500 mb-8">
//             Already have an account?{' '}
//             <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link>
//           </p>

//           {errors.general && (
//             <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
//               {errors.general}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} noValidate className="space-y-4">

//             {/* Name */}
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
//               <input id="name" name="name" type="text" autoComplete="name" placeholder="John Doe"
//                 value={form.name} onChange={handleChange}
//                 className={`input ${errors.name ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}`}
//               />
//               {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
//             </div>

//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
//               <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
//                 value={form.email} onChange={handleChange}
//                 className={`input ${errors.email ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}`}
//               />
//               {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//               <div className="relative">
//                 <input id="password" name="password" type={showPw ? 'text' : 'password'}
//                   autoComplete="new-password" placeholder="Min. 8 characters"
//                   value={form.password} onChange={handleChange}
//                   className={`input pr-10 ${errors.password ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}`}
//                 />
//                 <button type="button" onClick={() => setShowPw(v => !v)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                   aria-label="Toggle password">
//                   {showPw ? <EyeOff /> : <EyeOpen />}
//                 </button>
//               </div>
//               {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
//             </div>

//             {/* Confirm password */}
//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
//               <div className="relative">
//                 <input id="confirmPassword" name="confirmPassword" type={showConf ? 'text' : 'password'}
//                   autoComplete="new-password" placeholder="Repeat your password"
//                   value={form.confirmPassword} onChange={handleChange}
//                   className={`input pr-10 ${errors.confirmPassword ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}`}
//                 />
//                 <button type="button" onClick={() => setShowConf(v => !v)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                   aria-label="Toggle confirm password">
//                   {showConf ? <EyeOff /> : <EyeOpen />}
//                 </button>
//               </div>
//               {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
//             </div>

//             {/* Submit */}
//             <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
//               {isLoading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
//                   </svg>
//                   Creating account…
//                 </span>
//               ) : 'Create account'}
//             </button>
//           </form>

//           <p className="mt-6 text-center text-xs text-gray-400">
//             By signing up you agree to our{' '}
//             <a href="#" className="underline">Terms</a> and{' '}
//             <a href="#" className="underline">Privacy Policy</a>.
//           </p>

//         </div>
//       </div>
//     </div>
//   )
// }


import { useState, FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '@/services/authService'
import type { RegisterFormState, RegisterFormErrors } from '@/types/auth'
import { API_BASE_URL } from '@/utils/constants'

// ── Validation ────────────────────────────────────────────────
function validate(form: RegisterFormState): RegisterFormErrors {
  const errors: RegisterFormErrors = {}
  if (!form.name.trim())
    errors.name = 'Name is required.'
  else if (form.name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters.'
  if (!form.email.trim())
    errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Please enter a valid email address.'
  if (!form.password)
    errors.password = 'Password is required.'
  else if (form.password.length < 8)
    errors.password = 'Password must be at least 8 characters.'
  if (!form.confirmPassword)
    errors.confirmPassword = 'Please confirm your password.'
  else if (form.password !== form.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.'
  return errors
}

// ── Eye icons ─────────────────────────────────────────────────
function EyeOpen() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}
function EyeOff() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm]           = useState<RegisterFormState>({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors]       = useState<RegisterFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPw, setShowPw]       = useState(false)
  const [showConf, setShowConf]   = useState(false)

  // ✅ Stores the registered email for the success screen
  const [successEmail, setSuccessEmail] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof RegisterFormErrors])
      setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setErrors({})
    setIsLoading(true)

    try {
      // Call Spring Boot POST /api/auth/register
      await authService.register({
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
      })

      // ✅ Show success screen with the registered email
      setSuccessEmail(form.email.trim())

    } catch (error: unknown) {
      const err = error as {
        response?: { status: number; data?: { message?: string; errors?: Record<string, string> } }
      }
      if (err.response?.status === 409)
        setErrors({ email: 'This email is already registered. Try signing in.' })
      else if (err.response?.data?.errors)
        setErrors(err.response.data.errors as RegisterFormErrors)
      else
        setErrors({ general: err.response?.data?.message ?? 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // ── Success screen — EMAIL VERIFICATION MESSAGE ────────────
  // User must check their email — do NOT redirect to login yet
  if (successEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm w-full text-center space-y-6">

          {/* Email icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Check your inbox!
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We sent a verification link to{' '}
              <strong className="text-gray-700">{successEmail}</strong>.<br />
              Click the link in the email to activate your account.
            </p>
          </div>

          {/* Steps */}
          <div className="card text-left space-y-3">
            {[
              { step: '1', text: 'Open your email inbox' },
              { step: '2', text: 'Find the email from MyApp' },
              { step: '3', text: 'Click the verification link' },
              { step: '4', text: 'You will be redirected to login' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-medium flex-shrink-0">
                  {step}
                </div>
                <span className="text-sm text-gray-600">{text}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            Didn't receive it?{' '}
            <button
              onClick={() => navigate('/verify-email')}
              className="text-primary-600 underline hover:text-primary-500"
            >
              Resend verification email
            </button>
          </p>

          <Link to="/login" className="block text-sm text-gray-500 hover:text-gray-700 underline">
            Back to login
          </Link>

        </div>
      </div>
    )
  }

  // ── Register form ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary-900 flex-col justify-center px-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-white/5" />
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="text-white font-medium text-lg">MyApp</span>
        </div>
        <h1 className="text-white text-3xl font-semibold leading-snug mb-4">
          Create your free account
        </h1>
        <p className="text-primary-300 text-sm leading-relaxed mb-10">
          Join thousands of users. Sign up in seconds.
        </p>
        {['Fill in your details', 'Verify your email', 'Start using the app'].map((step, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {i + 1}
            </div>
            <span className="text-primary-200 text-sm">{step}</span>
          </div>
        ))}
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>

          {errors.general && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input id="name" name="name" type="text" autoComplete="name"
                placeholder="John Doe" value={form.name} onChange={handleChange}
                className={`input ${errors.name ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input id="email" name="email" type="email" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={handleChange}
                className={`input ${errors.email ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input id="password" name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password" placeholder="Min. 8 characters"
                  value={form.password} onChange={handleChange}
                  className={`input pr-10 ${errors.password ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle password">
                  {showPw ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword"
                  type={showConf ? 'text' : 'password'}
                  autoComplete="new-password" placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={handleChange}
                  className={`input pr-10 ${errors.confirmPassword ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle confirm password">
                  {showConf ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Google — same backend endpoint as Login. /api/auth/google/callback
                creates the user if they don't exist yet, so this one button
                covers both "sign up with Google" and "sign in with Google". */}
            <button
              type="button"
              className="btn-secondary w-full flex items-center justify-center gap-2"
              onClick={() => {
                window.location.href = `${API_BASE_URL}/auth/google`
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By signing up you agree to our{' '}
            <a href="#" className="underline">Terms</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>

        </div>
      </div>
    </div>
  )
}
