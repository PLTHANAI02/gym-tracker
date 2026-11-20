import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import ExercisePicker from '../components/ExercisePicker'
import { getMuscleGroups, getExercises } from '../lib/exercises'
import {
  DAYS,
  getRoutineByDay,
  saveRoutine,
  deleteRoutine,
} from '../lib/routines'

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800'

export default function RoutineEdit() {
  const { day } = useParams()
  const dayIndex = Number(day)
  const valid = Number.isInteger(dayIndex) && dayIndex >= 0 && dayIndex <= 6

  const { session } = useAuth()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [exercises, setExercises] = useState([])
  const [routineId, setRoutineId] = useState(null)
  const [name, setName] = useState('')
  const [items, setItems] = useState([]) // [{ exerciseId, sets }]
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    if (!valid) return
    setLoading(true)
    Promise.all([getMuscleGroups(), getExercises(), getRoutineByDay(dayIndex)])
      .then(([g, e, r]) => {
        setGroups(g)
        setExercises(e)
        if (r) {
          setRoutineId(r.id)
          setName(r.name)
          setItems(
            [...r.routine_exercises]
              .sort((a, b) => a.position - b.position)
              .map((x) => ({ exerciseId: x.exercise_id, sets: x.target_sets }))
          )
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [dayIndex, valid])

  const exMap = useMemo(
    () => new Map(exercises.map((e) => [e.id, e])),
    [exercises]
  )
  const groupMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g.name])),
    [groups]
  )
  const excludeIds = useMemo(
    () => new Set(items.map((i) => i.exerciseId)),
    [items]
  )

  if (!valid) return <Navigate to="/routines" replace />

  const autoName = () => {
    const names = []
    items.forEach((item) => {
      const ex = exMap.get(item.exerciseId)
      const g = ex && groupMap.get(ex.muscle_group_id)
      if (g && !names.includes(g)) names.push(g)
    })
    return names.join(' & ')
  }

  const handleAdd = (ids) => {
    setItems((list) => [
      ...list,
      ...ids.map((id) => ({ exerciseId: id, sets: 3 })),
    ])
    setShowPicker(false)
    setSuccess('')
  }

  const changeSets = (index, delta) => {
    setItems((list) =>
      list.map((item, i) =>
        i === index
          ? { ...item, sets: Math.min(20, Math.max(1, item.sets + delta)) }
          : item
      )
    )
    setSuccess('')
  }

  const move = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    setItems((list) => {
      const copy = [...list]
      ;[copy[index], copy[target]] = [copy[target], copy[index]]
      return copy
    })
    setSuccess('')
  }

  const remove = (index) => {
    setItems((list) => list.filter((_, i) => i !== index))
    setSuccess('')
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    if (items.length === 0) {
      setError('Add at least one exercise')
      return
    }
    const finalName = name.trim() || autoName()
    setSaving(true)
    try {
      const id = await saveRoutine({
        routineId,
        userId: session.user.id,
        day: dayIndex,
        name: finalName,
        items,
      })
      setRoutineId(id)
      setName(finalName)
      setSuccess('Routine saved')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${DAYS[dayIndex]} routine?`)) return
    try {
      await deleteRoutine(routineId)
      navigate('/routines', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Layout>
      <Link to="/routines" className="text-sm text-blue-600 hover:underline">
        ← All routines
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-bold">{DAYS[dayIndex]} routine</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              Routine name
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Chest and Triceps (blank = auto)"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSuccess('')
              }}
            />
          </div>

          {items.length === 0 ? (
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              No exercises yet.
            </p>
          ) : (
            <ul className="mb-4 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
              {items.map((item, index) => {
                const ex = exMap.get(item.exerciseId)
                return (
                  <li key={item.exerciseId} className="space-y-2 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {ex?.name ?? 'Unknown exercise'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {ex && groupMap.get(ex.muscle_group_id)}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(index)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeSets(index, -1)}
                          className="h-8 w-8 rounded-lg border border-gray-300 dark:border-gray-700"
                          aria-label="Fewer sets"
                        >
                          −
                        </button>
                        <span className="w-16 text-center text-sm">
                          {item.sets} sets
                        </span>
                        <button
                          onClick={() => changeSets(index, 1)}
                          className="h-8 w-8 rounded-lg border border-gray-300 dark:border-gray-700"
                          aria-label="More sets"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          className="h-8 w-8 rounded-lg border border-gray-300 disabled:opacity-30 dark:border-gray-700"
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => move(index, 1)}
                          disabled={index === items.length - 1}
                          className="h-8 w-8 rounded-lg border border-gray-300 disabled:opacity-30 dark:border-gray-700"
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <button
            onClick={() => setShowPicker(true)}
            className="mb-4 w-full rounded-lg border border-dashed border-gray-400 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            + Add exercises
          </button>

          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
              ✅ {success}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save routine'}
            </button>
            {routineId && (
              <button
                onClick={handleDelete}
                className="rounded-lg border border-red-500 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Delete
              </button>
            )}
          </div>

          {showPicker && (
            <ExercisePicker
              groups={groups}
              exercises={exercises}
              excludeIds={excludeIds}
              onAdd={handleAdd}
              onClose={() => setShowPicker(false)}
            />
          )}
        </>
      )}
    </Layout>
  )
}