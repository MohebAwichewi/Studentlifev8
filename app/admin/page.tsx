'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 👇 THIS CONNECTS TO YOUR NEON DATABASE API
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Login failed')
        setLoading(false)
      }
    } catch (err) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-['Inter']">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Student<span className="text-orange-500">.LIFE</span>
        </h1>
        <h2 className="text-xl font-bold mb-2">CEO Login</h2>
        <p className="text-gray-500 mb-6 text-sm">Secure Database Access</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" required 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-orange-500"
              placeholder="admin@s7.tn"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" required 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-orange-500"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}