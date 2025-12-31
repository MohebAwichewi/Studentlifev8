'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react' // Assuming you are using NextAuth

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Attempt to sign in using the credentials provider
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/admin/dashboard'
      })

      if (result?.error) {
        // Show actual database error (e.g., "Incorrect password")
        setError(result.error)
        setLoading(false)
      } else {
        // Success: Redirect to the dashboard
        router.push('/admin/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] font-sans">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Student<span className="text-red-500">.LIFE</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">CEO Control Center</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              placeholder="admin@s7.agency"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              placeholder="••••••"
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-xl flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Secure Login"
            )}
          </button>

        </form>
      </div>
    </div>
  )
}