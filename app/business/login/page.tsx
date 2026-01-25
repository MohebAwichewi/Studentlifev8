'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BusinessLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // 🛑 STOP PAGE REFRESH
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/business/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        // ✅ Login Success: Save session & Redirect
        localStorage.setItem('isBusinessLoggedIn', 'true')
        localStorage.setItem('businessId', data.businessId)
        localStorage.setItem('businessName', data.businessName)

        router.push('/business/dashboard') // 🚀 Go to Dashboard
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-900 selection:bg-black selection:text-white">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md text-center relative border border-slate-100">

        {/* ✅ CLOSE BUTTON (Redirects to Home) */}
        <Link
          href="/"
          className="absolute top-6 right-6 text-slate-300 hover:text-black transition duration-200 p-2 hover:bg-slate-50 rounded-full"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </Link>

        {/* ✅ LOGO: Matches Home & Student Login */}
        <div className="mb-10 flex justify-center">
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-3xl font-black tracking-tighter text-slate-900">Student</span>
            <span className="bg-[#FF3B30] text-white px-2 py-0.5 rounded-md text-xl font-black tracking-wide transform -rotate-2 group-hover:rotate-0 transition-transform">.LIFE</span>
          </Link>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Partner Portal</h1>
        <p className="text-slate-500 font-medium text-sm mb-8">Log in to manage your deals and analytics.</p>

        <form onSubmit={handleLogin} className="space-y-6 text-left">

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 ml-1">Business Email</label>
            <input
              type="email"
              required
              placeholder="manager@store.com"
              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3.5 font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-black transition-colors"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Password</label>
              <Link href="/business/forgot-password" className="text-xs font-bold text-slate-400 hover:text-black transition">Forgot?</Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3.5 font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-black transition-colors"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg text-center flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          {/* ✅ BUTTON: Updated to Black to match Home Page */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Access Dashboard"}
          </button>

        </form>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-sm text-slate-500 font-bold">
            Don't have a partner account? <Link href="/business/signup" className="text-black hover:underline decoration-2 underline-offset-4">Apply here</Link>
          </p>
        </div>

      </div>
    </div>
  )
}