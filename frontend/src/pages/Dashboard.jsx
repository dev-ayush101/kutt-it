import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api/axios'

function NewLinkModal({ onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ url: '', customAlias: '', tags: '' })

  const createLink = useMutation({
    mutationFn: (body) => api.post('/shorten', body),
    onSuccess: () => {
      queryClient.invalidateQueries(['links'])
      onClose()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const body = { url: form.url }
    if (form.customAlias.trim()) body.customAlias = form.customAlias.trim()
    if (form.tags.trim()) body.tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    createLink.mutate(body)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">New Link</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Long URL *</label>
            <input
              type="url"
              placeholder="https://example.com/very/long/url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Custom alias (optional)</label>
            <input
              type="text"
              placeholder="my-alias (3-30 chars)"
              value={form.customAlias}
              onChange={(e) => setForm({ ...form, customAlias: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tags (comma separated, optional)</label>
            <input
              type="text"
              placeholder="work, social, news"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {createLink.isError && (
            <p className="text-red-500 text-xs">{createLink.error?.response?.data || 'Failed to create link'}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={createLink.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {createLink.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LinkCard({ link }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const shortUrl = 'http://localhost:8080/api/r/' + link.shortCode

  const deleteLink = useMutation({
    mutationFn: () => api.delete('/links/' + link.shortCode),
    onSuccess: () => queryClient.invalidateQueries(['links']),
  })

  const copy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm">{shortUrl}</p>
        <p className="text-gray-400 text-xs truncate mt-0.5">{link.originalUrl}</p>
        {link.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {link.tags.map((t) => (
              <span key={t} className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={copy}
          className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => navigate('/dashboard/' + link.shortCode)}
          className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Analytics
        </button>
        <button
          onClick={() => deleteLink.mutate()}
          disabled={deleteLink.isPending}
          className="text-xs bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [showModal, setShowModal] = useState(false)

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['links'],
    queryFn: () => api.get('/user/links').then((r) => r.data),
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-purple-600 dark:text-purple-400 text-xl font-bold">Kutt-it</Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Hi, {user?.username}</span>
          <button
            onClick={toggle}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg transition-colors"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Links</h1>
            <p className="text-gray-400 text-sm mt-0.5">{links.length} link{links.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + New Link
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        )}

        {!isLoading && links.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">No links yet</p>
            <p className="text-gray-300 dark:text-gray-600 text-sm">Click &quot;+ New Link&quot; to create your first shortened URL</p>
          </div>
        )}

        <div className="space-y-3">
          {links.map((link) => (
            <LinkCard key={link.shortCode} link={link} />
          ))}
        </div>
      </div>

      {showModal && <NewLinkModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
