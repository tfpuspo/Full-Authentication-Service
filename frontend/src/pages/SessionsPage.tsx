import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import type { Session } from '@/types/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function deviceLabel(userAgent: string | null): string {
  if (!userAgent) return 'Unknown device'
  if (/mobile/i.test(userAgent)) return 'Mobile browser'
  if (/chrome/i.test(userAgent)) return 'Chrome'
  if (/firefox/i.test(userAgent)) return 'Firefox'
  if (/safari/i.test(userAgent)) return 'Safari'
  if (/edg/i.test(userAgent)) return 'Edge'
  return 'Browser'
}

export default function SessionsPage() {
  const navigate = useNavigate()
  const { clearAuth } = useAuth()

  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [loggingOutAll, setLoggingOutAll] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await authService.getSessions()
      setSessions(data)
    } catch {
      setError('Could not load your sessions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleRevoke = async (familyId: string, isCurrent: boolean) => {
    setPendingId(familyId)
    try {
      await authService.revokeSession(familyId)
      if (isCurrent) {
        clearAuth()
        navigate('/login')
        return
      }
      setSessions(prev => prev.filter(s => s.familyId !== familyId))
    } catch {
      setError('Could not revoke that session. Please try again.')
    } finally {
      setPendingId(null)
    }
  }

  const handleLogoutAll = async () => {
    setLoggingOutAll(true)
    try {
      await authService.logoutAllDevices()
      clearAuth()
      navigate('/login')
    } catch {
      setError('Could not log out of all devices. Please try again.')
      setLoggingOutAll(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Active sessions</h1>
          <p className="text-sm text-gray-500 mt-1">
            These are the devices currently signed in to your account.
          </p>
        </div>
        <button
          onClick={handleLogoutAll}
          disabled={loggingOutAll || isLoading}
          className="btn-secondary text-sm whitespace-nowrap"
        >
          {loggingOutAll ? 'Logging out…' : 'Log out all devices'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="card text-center text-sm text-gray-500 py-8">
          No active sessions found.
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map(session => (
            <li
              key={session.familyId}
              className="card flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {deviceLabel(session.userAgent)}
                  </span>
                  {session.current && (
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                      This device
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {session.ipAddress ?? 'Unknown IP'} · last active {formatWhen(session.lastUsedAt)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Signed in {formatWhen(session.issuedAt)}
                </p>
              </div>

              <button
                onClick={() => handleRevoke(session.familyId, session.current)}
                disabled={pendingId === session.familyId}
                className="text-sm font-medium text-red-600 hover:text-red-700 whitespace-nowrap disabled:opacity-50"
              >
                {pendingId === session.familyId
                  ? 'Logging out…'
                  : session.current ? 'Log out' : 'Log out device'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
