import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usernameToEmail } from '../lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setProfile(null)
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session?.user?.id])

  const signUp = async ({ username, password, name, age, sex }) => {
    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: {
        data: {
          username: username.trim().toLowerCase(),
          name: name.trim(),
          age: Number(age),
          sex,
        },
      },
    })

    console.log('signUp result', { data, error })

    if (error) {
      console.error('Signup error:', error)
      if (error.message.toLowerCase().includes('already')) {
        throw new Error('Username already taken')
      }
      throw new Error(error.message)
    }

    // No identities = user already exists (Supabase hides this)
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('Username already taken')
    }

    // No session = email confirmation still enabled
    if (!data.session) {
      throw new Error(
        'Signup saved but no session. Turn off "Confirm email" in Supabase.'
      )
    }
  }

  const signIn = async ({ username, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    })
    if (error) {
      console.error('Login error:', error)
      throw new Error('Invalid username or password')
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)