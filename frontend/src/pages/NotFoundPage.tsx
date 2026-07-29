import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { ROUTES } from '@/utils/constants'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to={ROUTES.HOME}><Button>Back to Home</Button></Link>
    </div>
  )
}
