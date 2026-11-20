import { useState } from 'react'

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800'

export default function ExerciseForm({ groups, defaultGroupId, onAdd }) {
  const [name, setName] = useState('')
  const [groupId, setGroupId] = useState(defaultGroupId ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmed = name.trim()
    if (trimmed.length < 2 || trimmed.length > 60) {
      setError('Name must be 2 to 60 characters')
      return
    }
    if (!groupId) {
      setError('Select muscle group')
      return
    }

    setSubmitting(true)
    try {
      await onAdd({ name: trimmed, muscleGroupId: Number(groupId) })
      setSuccess(`Added "${trimmed}"`)
      setName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
    >
      <h2 className="font-semibold">Add custom exercise</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className={inputClass}
          placeholder="Exercise name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className={inputClass}
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        >
          <option value="">Muscle group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">✅ {success}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? 'Adding...' : 'Add exercise'}
      </button>
    </form>
  )
}