'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StudentLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // ⚠️ THE FIX: Ensure this points to LOGIN, not register
      const res = await fetch('/api/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (res.ok) {
        // Success: Save user data/token if needed
        // localStorage.setItem('studentUser', JSON.stringify(data.user)) 
        
        // Redirect to Student Dashboard
        router.push('/student/dashboard') 
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex w-1/2 bg-[#4F46E5] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold mb-6">v2.0 LIVE</div>
          <h1 className="text-4xl font-black mb-4">Student.LIFE</h1>
          <p className="text-indigo-200 text-lg">Unlock exclusive student perks.</p>
        </div>
        <div className="relative z-10">
          <p className="font-medium text-indigo-200">Join thousands of Tunisian students saving money every day.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm font-bold rounded-xl flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full p-4 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition" 
                placeholder="student@university.tn" 
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center ml-1 mb-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Password</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Forgot password?</a>
              </div>
              <input 
                type="password" 
                required
                className="w-full p-4 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition" 
                placeholder="••••••••" 
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#4F46E5] text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                   <i className="fa-solid fa-circle-notch fa-spin"></i> Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-500">
            Don't have an account? <Link href="/register" className="font-bold text-indigo-600 hover:underline">Register for free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}