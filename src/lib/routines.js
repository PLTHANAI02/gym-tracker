import { supabase } from './supabase'

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

// Monday = 0 ... Sunday = 6
export const todayIndex = () => (new Date().getDay() + 6) % 7

export async function getWeekRoutines() {
  const { data, error } = await supabase
    .from('routines')
    .select('id, name, day_of_week, routine_exercises(id)')
    .order('day_of_week')
  if (error) throw new Error(error.message)
  return data
}

export async function getRoutineByDay(day) {
  const { data, error } = await supabase
    .from('routines')
    .select(
      'id, name, day_of_week, routine_exercises(id, exercise_id, target_sets, position)'
    )
    .eq('day_of_week', day)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function saveRoutine({ routineId, userId, day, name, items }) {
  let id = routineId

  if (id) {
    const { error } = await supabase
      .from('routines')
      .update({ name })
      .eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { data, error } = await supabase
      .from('routines')
      .insert({ user_id: userId, day_of_week: day, name })
      .select('id')
      .single()
    if (error) {
      if (error.code === '23505') {
        throw new Error('Routine already exists for this day. Reload page.')
      }
      throw new Error(error.message)
    }
    id = data.id
  }

  // Insert new rows first, then remove old rows. Safer than delete-first.
  let oldIds = []
  if (routineId) {
    const { data, error } = await supabase
      .from('routine_exercises')
      .select('id')
      .eq('routine_id', id)
    if (error) throw new Error(error.message)
    oldIds = data.map((r) => r.id)
  }

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      routine_id: id,
      user_id: userId,
      exercise_id: item.exerciseId,
      target_sets: item.sets,
      position: index,
    }))
    const { error } = await supabase.from('routine_exercises').insert(rows)
    if (error) throw new Error(error.message)
  }

  if (oldIds.length > 0) {
    const { error } = await supabase
      .from('routine_exercises')
      .delete()
      .in('id', oldIds)
    if (error) throw new Error(error.message)
  }

  return id
}

export async function deleteRoutine(id) {
  const { error } = await supabase.from('routines').delete().eq('id', id)
  if (error) throw new Error(error.message)
}