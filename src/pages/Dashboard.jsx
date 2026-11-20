import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { profile } = useAuth()

  return (
    <Layout>
      <h1 className="mb-4 text-xl font-bold">
        Hi, {profile?.name ?? '...'} 👋
      </h1>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        Dashboard coming in later steps.
      </div>
    </Layout>
  )
}