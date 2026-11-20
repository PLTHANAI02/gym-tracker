import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { DAYS, getWeekRoutines, todayIndex } from '../lib/routines'

export default function Routines() {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const today = todayIndex()

  useEffect(() => {
    getWeekRoutines()
      .then(setRoutines)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const byDay = new Map(routines.map((r) => [r.day_of_week, r]))

  return (
    <Layout>
      <h1 className="mb-1 text-xl font-bold">Weekly routines</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Set once. Repeats every week.
      </p>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}

      <ul className="space-y-3">
        {DAYS.map((dayName, index) => {
          const routine = byDay.get(index)
          const count = routine?.routine_exercises?.length ?? 0
          const isToday = index === today
          return (
            <li key={dayName}>
              <Link
                to={`/routines/${index}`}
                className={`flex items-center justify-between rounded-2xl border bg-white p-4 hover:border-blue-500 dark:bg-gray-900 ${
                  isToday
                    ? 'border-blue-500'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    {dayName}
                    {isToday && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {routine
                      ? `${routine.name} · ${count} exercise${count === 1 ? '' : 's'}`
                      : 'Rest day / free workout'}
                  </div>
                </div>
                <span className="text-sm text-blue-600">
                  {routine ? 'Edit' : '+ Create'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </Layout>
  )
}