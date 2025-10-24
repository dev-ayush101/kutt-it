import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api/axios'

export default function Landing() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShorten = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const { data } = await api.post('/shorten', { url })
      setResult(data)
    } catch (err) {
      setError(err.response?.data || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      <nav className="flex items-center justify-between px-8 py-4">
        <span className="text-gray-800 dark:text-white text-2xl font-bold tracking-tight">Kutt-it</span>
        <div className="flex gap-4 items-center">
          <button
            onClick={toggle}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors text-lg"
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Dashboard</Link>
              <button onClick={logout} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Log in</Link>
              <Link
                to="/register"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl font-extrabold text-gray-800 dark:text-white mb-4 leading-tight">
          Shorten your links,<br />share with the world
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-10">Fast, simple, and free URL shortener</p>

        <form onSubmit={handleShorten} className="w-full max-w-2xl flex gap-2">
          <input
            type="url"
            placeholder="Paste a long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-5 py-3 rounded-xl text-gray-800 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base shadow-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-60 transition-colors shadow-sm"
          >
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </form>

        {error && <p className="text-red-500 dark:text-red-400 mt-4 text-sm">{error}</p>}

        {result && (
          <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 flex items-center gap-4 w-full max-w-2xl shadow-sm">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 dark:text-purple-400 font-semibold flex-1 truncate text-left"
            >
              {result.shortUrl}
            </a>
            <button
              onClick={copy}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm shrink-0 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {!user && (
          <p className="text-gray-400 text-sm mt-8">
            <Link to="/register" className="underline font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700">Sign up free</Link>
            {' '}to manage your links and view analytics
          </p>
        )}
      </div>

      <footer className="text-center text-gray-400 text-xs py-4">
        © 2025 Kutt-it · URL Shortener
      </footer>
    </div>
  )
}
