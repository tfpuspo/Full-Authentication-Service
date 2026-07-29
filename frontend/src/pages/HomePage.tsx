import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import authService from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import type { UserSummary, UserRole } from '@/types/auth'

const ROLES: UserRole[] = ['USER', 'MANAGER', 'ADMIN']

function roleBadgeVariant(role: UserRole): 'info' | 'success' | 'default' {
  if (role === 'ADMIN') return 'success'
  if (role === 'MANAGER') return 'info'
  return 'default'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

export default function HomePage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [users, setUsers] = useState<UserSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await authService.getUsers()
        if (!cancelled) setUsers(data)
      } catch {
        if (!cancelled) setError('Could not load the user list. Please try again.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleRoleChange = async (targetId: string, newRole: UserRole) => {
    setSavingId(targetId)
    setError('')
    try {
      const updated = await authService.updateUserRole(targetId, newRole)
      setUsers(prev => prev.map(u => (u.id === targetId ? { ...u, role: updated.role } : u)))
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      setError(apiErr.response?.data?.message ?? "Could not update that user's role.")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back{user ? `, ${user.name}` : ''} 👋</h1>
        <p className="text-gray-500 mt-1">
          This list comes from a private, Bearer-token-protected API (<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">GET /api/users</code>) —
          only signed-in users can see it.
        </p>
      </section>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All registered users</h2>
          <Badge variant="default">{users.length} total</Badge>
        </div>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Provider</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Verified</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {u.name}
                      {u.id === user?.id && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">(you)</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{u.email}</td>
                    <td className="px-6 py-3">
                      <Badge variant={u.provider === 'GOOGLE' ? 'warning' : 'default'}>
                        {u.provider}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      {isAdmin && u.id !== user?.id ? (
                        <select
                          value={u.role}
                          disabled={savingId === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white disabled:opacity-50"
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {u.isVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!isAdmin && (
        <p className="text-xs text-gray-400">
          Signed in as <strong>{user?.role}</strong>. Sign in as an ADMIN to manage other users&apos; roles.
        </p>
      )}
    </div>
  )
}
