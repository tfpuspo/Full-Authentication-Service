import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import authService from '@/services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      // Backend always returns a generic success message, whether or not
      // the email is registered — we deliberately don't distinguish here.
      await authService.forgotPassword({ email })
      setSubmitted(true)
    } catch {
      // Even on an unexpected error, don't hint at whether the email exists.
      setSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Forgot your password?</h2>
        <p className="text-sm text-gray-500 mb-8">
          Enter your email and we'll send you a link to reset it.
        </p>

        {submitted ? (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-700">
            If an account exists for <strong>{email}</strong>, a password reset link is on its way.
            Check your inbox (and spam folder).
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`input ${error ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}`}
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
