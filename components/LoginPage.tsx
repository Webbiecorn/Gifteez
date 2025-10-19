import type { FormEvent } from 'react'
import React, { useState, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Button from './Button'
import { SpinnerIcon } from './IconComponents'
import type { NavigateTo, ShowToast } from '../types'

interface LoginPageProps {
  navigateTo: NavigateTo
  showToast: ShowToast
}

const LoginPage: React.FC<LoginPageProps> = ({ navigateTo, showToast }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const auth = useContext(AuthContext)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setInfo('')

    try {
      const user = await auth?.login(email, password)
      if (user) {
        showToast(`Welkom terug, ${user.name}!`)
        navigateTo('account')
      } else {
        setError('Ongeldige e-mail of wachtwoord.')
      }
    } catch (err: any) {
      const code = err?.code || err?.message || ''
      if (typeof code === 'string' && code.includes('auth/invalid-credential')) {
        setError('Ongeldige e-mail of wachtwoord.')
      } else if (typeof code === 'string' && code.includes('auth/too-many-requests')) {
        setError('Te veel pogingen. Probeer later opnieuw.')
      } else {
        setError('Er is een fout opgetreden. Probeer het opnieuw.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError('')
    setInfo('')
    if (!email) {
      setError('Vul je e-mailadres in om je wachtwoord te resetten.')
      return
    }
    const ok = await auth?.resetPassword(email)
    if (ok) {
      setInfo('We hebben je een e-mail gestuurd om je wachtwoord te resetten.')
    } else {
      setError('Kon wachtwoord reset niet starten. Controleer je e-mail en probeer opnieuw.')
    }
  }

  const inputClass = `w-full p-3 border rounded-md focus:outline-none focus:ring-2 transition-colors bg-white border-gray-300 focus:ring-primary`

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="font-display text-3xl font-bold text-primary text-center">Inloggen</h1>
        <p className="text-center text-gray-600 mt-2">Log in op je Gifteez.nl account.</p>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
          {info && <p className="text-green-700 bg-green-100 p-3 rounded-md text-center">{info}</p>}
          <div>
            <label htmlFor="email" className="block font-bold text-gray-700 mb-1">
              E-mailadres
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-bold text-gray-700 mb-1">
              Wachtwoord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-primary hover:underline"
              >
                Wachtwoord vergeten?
              </button>
            </div>
          </div>
          <div>
            <Button
              type="submit"
              variant="accent"
              disabled={loading}
              className="w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Inloggen...
                </>
              ) : (
                'Log In'
              )}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Nog geen account?{' '}
            <button
              onClick={() => navigateTo('signup')}
              className="font-bold text-primary hover:underline"
            >
              Registreer hier
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
