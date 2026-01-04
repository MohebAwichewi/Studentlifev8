'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BusinessLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API Login
    setTimeout(() => {
      setLoading(false)
      // ✅ FIXED: Redirects to /business (the correct new dashboard)
      router.push('/business')
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] px-4">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100">
        
        <div className="text-center mb-10">
           <Link href="/" className="inline-flex items-center gap-1 mb-6 group">
             <span className="text-3xl font-black tracking-tighter text-slate-900">Student</span>
             <span className="bg-[#FF3B30] text-white px-2 py-0.5 rounded-md text-xl font-black tracking-wide">.LIFE</span>
           </Link>
           <h2 className="text-2xl font-black text-slate-900">Partner Portal</h2>
           <p className="text-slate-500 text-sm mt-2 font-medium">Log in to manage your deals and analytics.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
           <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Business Email</label>
              <input 
                required
                type="email" 
                placeholder="manager@store.com"
                className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent transition"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
              <input 
                required
                type="password" 
                placeholder="••••••••"
                className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent transition"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-[#FF3B30] text-white font-bold py-4 rounded-xl hover:bg-[#E6352B] transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 mt-4"
           >
             {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Access Dashboard"}
           </button>
        </form>

        <div className="text-center mt-8 pt-8 border-t border-slate-50">
           <p className="text-sm text-slate-400 font-medium">
             Don't have a partner account? <Link href="/business/signup" className="text-[#FF3B30] font-bold hover:underline">Apply here</Link>
           </p>
        </div>

      </div>
    </div>
  )
}