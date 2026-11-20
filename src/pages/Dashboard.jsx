import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function Dashboard() {
  const { profile, signOut } = useAuth()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Hi, {profile?.name ?? '...'} 👋
        </h1>
        <div className="flex gap-2">
          <ThemeToggle />
          <button
            onClick={signOut}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Log out
          </button>
        </div>
      </header>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        Dashboard coming in later steps.
      </div>
    </div>
  )
}