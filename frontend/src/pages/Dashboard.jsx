import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api/axios'

function NewLinkModal({ onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ url: '', customAlias: '', tags: '', expirationDate: '' })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const createLink = useMutation({
    mutationFn: (body) => api.post('/shorten', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
      onClose()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const body = { url: form.url }
    if (form.customAlias.trim()) body.customAlias = form.customAlias.trim()
    if (form.tags.trim()) body.tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    if (form.expirationDate) body.expirationDate = form.expirationDate + ':00'
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
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline text-left"
          >
            {showAdvanced ? '− Hide options' : '+ Alias, tags, expiry'}
          </button>

          {showAdvanced && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Custom alias</label>
                <input
                  type="text"
                  placeholder="my-alias (3-30 chars)"
                  value={form.customAlias}
                  onChange={(e) => setForm({ ...form, customAlias: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="work, social, news"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expiry date</label>
                <input
                  type="datetime-local"
                  value={form.expirationDate}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                  className={`w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${form.expirationDate ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
                />
              </div>
            </>
          )}
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

function EditLinkModal({ link, onClose }) {
  const queryClient = useQueryClient()

  const toDatetimeLocal = (dt) => {
    if (!dt) return ''
    const d = Array.isArray(dt)
      ? new Date(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0)
      : new Date(dt)
    return isNaN(d) ? '' : d.toISOString().slice(0, 16)
  }

  const [form, setForm] = useState({
    originalUrl: link.originalUrl || '',
    customAlias: link.customAlias || '',
    expirationDate: toDatetimeLocal(link.expirationDate),
  })

  const updateLink = useMutation({
    mutationFn: (body) => api.put('/links/' + link.shortCode, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
      onClose()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const body = { originalUrl: form.originalUrl }
    if (form.customAlias.trim()) body.customAlias = form.customAlias.trim()
    if (form.expirationDate) body.expirationDate = form.expirationDate + ':00'
    updateLink.mutate(body)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Edit Link</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Long URL *</label>
            <input
              type="url"
              value={form.originalUrl}
              onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Custom alias</label>
            <input
              type="text"
              placeholder="my-alias (3-30 chars)"
              value={form.customAlias}
              onChange={(e) => setForm({ ...form, customAlias: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expiry date</label>
            <input
              type="datetime-local"
              value={form.expirationDate}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
              className={`w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${form.expirationDate ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
            />
          </div>
          {updateLink.isError && (
            <p className="text-red-500 text-xs">{updateLink.error?.response?.data || 'Failed to update link'}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={updateLink.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {updateLink.isPending ? 'Saving...' : 'Save'}
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

function QrModal({ shortCode, onClose }) {
  const { data: qr, isLoading, isError } = useQuery({
    queryKey: ['qr', shortCode],
    queryFn: () => api.get('/qr/' + shortCode).then((r) => r.data),
  })

  const [blobUrl, setBlobUrl] = useState(null)
  const blobUrlRef = useRef(null)

  useEffect(() => {
    if (!qr?.url) return
    const proxyUrl = qr.url.replace(/^https?:\/\/[^/]+/, '')
    fetch(proxyUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        blobUrlRef.current = url
        setBlobUrl(url)
      })
    return () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current) }
  }, [qr?.url])

  const download = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = shortCode + '-qr.png'
    a.click()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl text-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">QR Code</h2>
        {isLoading && <p className="text-gray-400 text-sm py-8">Generating...</p>}
        {isError && <p className="text-red-500 text-sm py-8">Failed to generate QR code.</p>}
        {qr?.url && (
          <>
            <img
              src={blobUrl || qr.url}
              alt="QR Code"
              className="mx-auto w-48 h-48 rounded-xl mb-4"
            />
            <button
              onClick={download}
              disabled={!blobUrl}
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Download
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className="block w-full mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function LinkCard({ link }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const shortUrl = 'http://localhost:8080/api/r/' + link.shortCode

  const deleteLink = useMutation({
    mutationFn: () => api.delete('/links/' + link.shortCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })

  const copy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm">{shortUrl}</p>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full shrink-0">
              {link.clickCount ?? 0} clicks
            </span>
            {(() => {
              if (!link.expirationDate) return null
              const exp = Array.isArray(link.expirationDate)
                ? new Date(link.expirationDate[0], link.expirationDate[1] - 1, link.expirationDate[2], link.expirationDate[3] || 0, link.expirationDate[4] || 0)
                : new Date(link.expirationDate)
              const diffDays = Math.ceil((exp - Date.now()) / 86400000)
              if (diffDays < 0) return <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-2 py-0.5 rounded-full shrink-0">Expired</span>
              if (diffDays <= 7) return <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full shrink-0">Expires in {diffDays}d</span>
              return null
            })()}
          </div>
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
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            Visit
          </a>
          <button
            onClick={() => setShowEdit(true)}
            className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setShowQr(true)}
            className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            QR
          </button>
          <button
            onClick={() => navigate('/dashboard/' + link.shortCode)}
            className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Analytics
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleteLink.isPending}
            className="text-xs bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
      {showEdit && <EditLinkModal link={link} onClose={() => setShowEdit(false)} />}
      {showQr && <QrModal shortCode={link.shortCode} onClose={() => setShowQr(false)} />}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-base font-bold text-gray-800 dark:text-white mb-1">Delete link?</h2>
            <p className="text-gray-400 text-sm mb-5 break-all">{link.shortCode} → {link.originalUrl}</p>
            <div className="flex gap-2">
              <button
                onClick={() => { deleteLink.mutate(); setConfirmDelete(false) }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)

  const { data: links = [], isLoading, isError, error } = useQuery({
    queryKey: ['links'],
    queryFn: () => api.get('/user/links').then((r) => r.data),
  })

  useEffect(() => {
    if (isError && (error?.response?.status === 403 || error?.response?.status === 401)) {
      logout()
      navigate('/login', { replace: true })
    }
  }, [isError, error])

  const allTags = [...new Set(links.flatMap((l) => l.tags || []))]
  const visibleLinks = selectedTag ? links.filter((l) => l.tags?.includes(selectedTag)) : links

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Links</h1>
            <p className="text-gray-400 text-sm mt-0.5">{visibleLinks.length} link{visibleLinks.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + New Link
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${!selectedTag ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${selectedTag === tag ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        )}

        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            Failed to load links. Make sure you are logged in and the server is running.
          </div>
        )}

        {!isLoading && links.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">No links yet</p>
            <p className="text-gray-300 dark:text-gray-600 text-sm">Click &quot;+ New Link&quot; to create your first shortened URL</p>
          </div>
        )}

        <div className="space-y-3">
          {visibleLinks.map((link) => (
            <LinkCard key={link.shortCode} link={link} />
          ))}
        </div>
      </div>

      {showModal && <NewLinkModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
