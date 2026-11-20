import { supabase } from './supabase'

const COLUMNS = 'id, name, user_id, muscle_group_id'

export async function getMuscleGroups() {
  const { data, error } = await supabase
    .from('muscle_groups')
    .select('id, name')
    .order('name')
  if (error) throw error
  return data
}

export async function getExercises() {
  const { data, error } = await supabase
    .from('exercises')
    .select(COLUMNS)
    .order('name')
  if (error) throw error
  return data
}

export async function addExercise({ name, muscleGroupId, userId }) {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name: name.trim(),
      muscle_group_id: muscleGroupId,
      user_id: userId,
    })
    .select(COLUMNS)
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('You already have this exercise in that muscle group')
    }
    throw new Error(error.message)
  }
  return data
}

export async function deleteExercise(id) {
  const { error } = await supabase.from('exercises').delete().eq('id', id)
  if (error) throw new Error(error.message)
}