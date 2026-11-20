import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { USERNAME_REGEX } from '../lib/auth'
import AuthCard from '../components/AuthCard'

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    age: '',
    sex: '',
    username: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    if (!form.name.trim()) return 'Name required'
    const age = Number(form.age)
    if (!Number.isInteger(age) || age < 10 || age > 100)
      return 'Age must be 10 to 100'
    if (!form.sex) return 'Select sex'
    if (!USERNAME_REGEX.test(form.username.trim().toLowerCase()))
      return 'Username: 3-20 chars, letters, numbers, underscore'
    if (form.password.length < 6) return 'Password needs 6+ characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const message = validate()
    if (message) {
      setError(message)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await signUp(form)
      setSuccess(true)
      setTimeout(() => navigate('/', { replace: true }), 1500)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Create account" subtitle="Start tracking workouts, meals, water.">
      {success && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          ✅ Account created. Taking you to dashboard...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input className={inputClass} value={form.name} onChange={update('name')} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Age</label>
            <input
              type="number"
              inputMode="numeric"
              className={inputClass}
              value={form.age}
              onChange={update('age')}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sex</label>
            <select className={inputClass} value={form.sex} onChange={update('sex')} required>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Username</label>
          <input
            className={inputClass}
            value={form.username}
            onChange={update('username')}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            className={inputClass}
            value={form.password}
            onChange={update('password')}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Confirm password</label>
          <input
            type="password"
            className={inputClass}
            value={form.confirm}
            onChange={update('confirm')}
            autoComplete="new-password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting || success}
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Sign up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Have account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  )
}