import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
