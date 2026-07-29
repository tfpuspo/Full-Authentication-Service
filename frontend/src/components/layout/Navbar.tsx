import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTES, APP_NAME } from '@/utils/constants'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { to: ROUTES.HOME, label: 'Home' },
  { to: ROUTES.ABOUT, label: 'About' },
  { to: ROUTES.SESSIONS, label: 'Sessions' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4 max-w-6xl flex items-center justify-between h-16">
        <Link to={ROUTES.HOME} className="text-lg font-bold text-primary-600 tracking-tight">
          {APP_NAME}
        </Link>
        <ul className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-500 hidden sm:inline">{user.name}</span>
          )}
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>
    </header>
  )
}
