import Card from '@/components/ui/Card'

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">About</h1>
      <Card>
        <p className="text-gray-600 leading-relaxed">
          This starter template is designed for beginners learning React with TypeScript and
          Tailwind CSS. It follows a standard, scalable folder structure used in real-world
          projects and includes reusable components, routing, global state, and API utilities.
        </p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Folder structure</h2>
        <pre className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 overflow-x-auto">{`src/
├── assets/          # Images, fonts, SVGs
├── components/
│   ├── ui/          # Reusable UI primitives
│   ├── layout/      # Navbar, Footer, layouts
│   └── common/      # Shared helpers
├── hooks/           # Custom React hooks
├── pages/           # Route-level pages
├── services/        # Axios API setup
├── store/           # Zustand global state
├── styles/          # Tailwind CSS entry
├── types/           # TypeScript interfaces
└── utils/           # Helpers & constants`}</pre>
      </Card>
    </div>
  )
}
