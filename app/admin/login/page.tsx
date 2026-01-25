'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// ❌ REMOVED: import { signIn } from 'next-auth/react' 

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // ✅ FIX: Fetch your custom route instead of using NextAuth
      const res = await fetch('/api/auth/admin/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (res.ok) {
        // Success! The cookie is set automatically by the backend.
        // Redirect to dashboard
        router.push('/admin/dashboard') 
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Admin Branding (Dark Theme) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="bg-red-600 text-white w-fit px-3 py-1 rounded-full text-xs font-bold mb-6">ADMIN ACCESS</div>
          <h1 className="text-4xl font-black mb-4">Student.LIFE</h1>
          <p className="text-slate-400 text-lg">Management Console</p>
        </div>
        <div className="relative z-10">
          <p className="font-medium text-slate-500">Restricted Access. Authorized Personnel Only.</p>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-800 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Login</h2>
          <p className="text-slate-500 mb-8">Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2 border border-red-100">
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Admin Email</label>
              <input 
                type="email" 
                required
                className="w-full p-4 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 transition" 
                placeholder="admin@s7.agency" 
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center ml-1 mb-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Password</label>
              </div>
              <input 
                type="password" 
                required
                className="w-full p-4 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 transition" 
                placeholder="••••••••" 
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                   <i className="fa-solid fa-circle-notch fa-spin"></i> Verifying...
                </>
              ) : 'Access Dashboard'}
            </button>
          </form>

          <p className="text-center mt-8 text-xs text-slate-400">
             <Link href="/" className="hover:text-slate-600 transition">&larr; Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}