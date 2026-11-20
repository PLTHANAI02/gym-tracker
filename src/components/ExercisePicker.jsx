import { useMemo, useState } from 'react'

export default function ExercisePicker({
  groups,
  exercises,
  excludeIds,
  onAdd,
  onClose,
}) {
  const [activeGroup, setActiveGroup] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])

  const groupName = useMemo(
    () => new Map(groups.map((g) => [g.id, g.name])),
    [groups]
  )

  const list = useMemo(() => {
    const term = search.trim().toLowerCase()
    return exercises.filter(
      (e) =>
        (activeGroup === 'all' || e.muscle_group_id === activeGroup) &&
        (!term || e.name.toLowerCase().includes(term))
    )
  }, [exercises, activeGroup, search])

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const chipClass = (active) =>
    `whitespace-nowrap rounded-full border px-3 py-1 text-sm ${
      active
        ? 'border-blue-600 bg-blue-600 text-white'
        : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
    }`

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white dark:bg-gray-900 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h2 className="font-semibold">Add exercises</h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>

        <div className="space-y-3 px-4 py-3">
          <input
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
            placeholder="Search exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
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
        </div>

        <ul className="flex-1 divide-y divide-gray-200 overflow-y-auto border-t border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {list.length === 0 && (
            <li className="px-4 py-6 text-center text-gray-500">
              No exercises found.
            </li>
          )}
          {list.map((ex) => {
            const added = excludeIds.has(ex.id)
            const checked = selected.includes(ex.id)
            return (
              <li key={ex.id}>
                <button
                  disabled={added}
                  onClick={() => toggle(ex.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left disabled:opacity-50"
                >
                  <span>
                    {ex.name}
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {groupName.get(ex.muscle_group_id)}
                    </span>
                  </span>
                  {added ? (
                    <span className="text-xs text-gray-500">Added</span>
                  ) : (
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                        checked
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-400'
                      }`}
                    >
                      {checked ? '✓' : ''}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <button
            disabled={selected.length === 0}
            onClick={() => onAdd(selected)}
            className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Add {selected.length > 0 ? `(${selected.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}