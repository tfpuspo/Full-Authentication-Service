import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

/**
 * The backend's /api/auth/google/callback already:
 *   1. exchanged the Google auth code
 *   2. created/linked the User row
 *   3. set the HttpOnly refreshToken cookie
 *   4. redirected the browser here
 *
 * So all this page has to do is call the normal /auth/refresh endpoint —
 * exactly the same silent-refresh AuthContext does on every page load — to
 * turn that cookie into an access token.
 */
export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const ranOnce = useRef(false)

  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true

    ;(async () => {
      try {
        const data = await authService.refresh()
        setAuth(data.accessToken, {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
        navigate('/home', { replace: true })
      } catch {
        navigate('/login?oauthError=' + encodeURIComponent('Google sign-in failed. Please try again.'), {
          replace: true,
        })
      }
    })()
  }, [navigate, setAuth])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-500">Finishing sign-in…</p>
    </div>
  )
}
