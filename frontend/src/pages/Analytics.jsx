import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import api from '../api/axios'

export default function Analytics() {
  const { shortCode } = useParams()
  const { theme, toggle } = useTheme()
  const shortUrl = 'http://localhost:8080/api/r/' + shortCode

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', shortCode],
    queryFn: () => api.get('/analytics/' + shortCode).then((r) => r.data),
  })

  const { data: qr } = useQuery({
    queryKey: ['qr', shortCode],
    queryFn: () => api.get('/qr/' + shortCode).then((r) => r.data),
  })

  const [qrBlobUrl, setQrBlobUrl] = useState(null)
  const qrBlobRef = useRef(null)

  useEffect(() => {
    if (!qr?.url) return
    const proxyUrl = qr.url.replace(/^https?:\/\/[^/]+/, '')
    fetch(proxyUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        qrBlobRef.current = url
        setQrBlobUrl(url)
      })
    return () => { if (qrBlobRef.current) URL.revokeObjectURL(qrBlobRef.current) }
  }, [qr?.url])

  const chartData = data?.clicksByDate
    ? Object.entries(data.clicksByDate).map(([date, count]) => ({ date, clicks: count }))
    : []

  const gridColor = theme === 'dark' ? '#374151' : '#f0f0f0'
  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-purple-600 dark:text-purple-400 text-xl font-bold">Kutt-it</Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{shortCode}</span>
        </div>
        <button
          onClick={toggle}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg transition-colors"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {isLoading && <p className="text-gray-400">Loading analytics...</p>}

        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            Could not load analytics. You may not own this link.
          </div>
        )}

        {data && (
          <>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <p className="text-gray-400 text-sm mb-1">Total Clicks</p>
              <p className="text-5xl font-bold text-gray-800 dark:text-white">{data.totalClicks}</p>
              <p className="text-purple-600 dark:text-purple-400 text-sm mt-3 font-mono">{shortUrl}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-gray-700 dark:text-gray-300 font-semibold mb-4">Clicks over time</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: axisColor }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                        border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#7c3aed' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm">No clicks recorded yet.</p>
              )}
            </div>
          </>
        )}

        {qr?.url && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm text-center">
            <h2 className="text-gray-700 dark:text-gray-300 font-semibold mb-4">QR Code</h2>
            <img
              src={qrBlobUrl || qr.url}
              alt="QR Code"
              className="mx-auto w-48 h-48 rounded-xl"
            />
            <button
              onClick={() => {
                if (!qrBlobUrl) return
                const a = document.createElement('a')
                a.href = qrBlobUrl
                a.download = shortCode + '-qr.png'
                a.click()
              }}
              disabled={!qrBlobUrl}
              className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Download QR
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
