import { APP_NAME } from '@/utils/constants'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 max-w-6xl py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {APP_NAME}. Built with React, TypeScript & Tailwind CSS.
      </div>
    </footer>
  )
}
