import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import ExerciseForm from '../components/ExerciseForm'
import {
  getMuscleGroups,
  getExercises,
  addExercise,
  deleteExercise,
} from '../lib/exercises'

export default function Exercises() {
  const { session } = useAuth()
  const [groups, setGroups] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeGroup, setActiveGroup] = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    Promise.all([getMuscleGroups(), getExercises()])
      .then(([g, e]) => {
        setGroups(g)
        setExercises(e)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async ({ name, muscleGroupId }) => {
    const created = await addExercise({
      name,
      muscleGroupId,
      userId: session.user.id,
    })
    setExercises((list) =>
      [...list, created].sort((a, b) => a.name.localeCompare(b.name))
    )
  }

  const handleDelete = async (exercise) => {
    const ok = window.confirm(
      `Delete "${exercise.name}"? This also removes it from routines and logs.`
    )
    if (!ok) return
    try {
      await deleteExercise(exercise.id)
      setExercises((list) => list.filter((e) => e.id !== exercise.id))
    } catch (err) {
      setError(err.message)
    }
  }

  const sections = useMemo(() => {
    const term = search.trim().toLowerCase()
    return groups
      .filter((g) => activeGroup === 'all' || g.id === activeGroup)
      .map((g) => ({
        group: g,
        items: exercises.filter(
          (e) =>
            e.muscle_group_id === g.id &&
            (!term || e.name.toLowerCase().includes(term))
        ),
      }))
      .filter((s) => s.items.length > 0)
  }, [groups, exercises, activeGroup, search])

  const chipClass = (active) =>
    `whitespace-nowrap rounded-full border px-3 py-1 text-sm ${
      active
        ? 'border-blue-600 bg-blue-600 text-white'
        : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
    }`

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Exercise library</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? 'Close' : '+ Custom'}
        </button>
      </div>

      {showForm && (
        <ExerciseForm
          groups={groups}
          defaultGroupId={activeGroup === 'all' ? '' : activeGroup}
          onAdd={handleAdd}
        />
      )}

      <input
        className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
        placeholder="Search exercises"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <button
          className={chipClass(activeGroup === 'all')}
          onClick={() => setActiveGroup('all')}
        >
          All
        </button>
        {groups.map((g) => (
          <button
            key={g.id}
            className={chipClass(activeGroup === g.id)}
            onClick={() => setActiveGroup(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && sections.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No exercises found.</p>
      )}

      <div className="space-y-6">
        {sections.map(({ group, items }) => (
          <section key={group.id}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {group.name} ({items.length})
            </h2>
            <ul className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
              {items.map((ex) => (
                <li
                  key={ex.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span>{ex.name}</span>
                    {ex.user_id && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                        Custom
                      </span>
                    )}
                  </div>
                  {ex.user_id && (
                    <button
                      onClick={() => handleDelete(ex)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Layout>
  )
}