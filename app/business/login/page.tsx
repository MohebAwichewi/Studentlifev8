'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BusinessLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 👇 Call the REAL Business Login API
      const res = await fetch('/api/auth/business/login', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (res.ok) {
        // ✅ ADDED: Save email to browser storage so we know who is logged in
        localStorage.setItem('businessEmail', formData.email)
        
        // Success: Redirect to Dashboard
        router.push('/business/dashboard')
      } else {
        setError(data.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative">
      
      {/* ❌ CLOSE BUTTON */}
      <Link 
        href="/" 
        className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-md border border-gray-200"
      >
        <i className="fa-solid fa-xmark text-lg"></i>
      </Link>

      {/* Left Side: Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] text-white relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <Link href="/" className="relative z-10 text-2xl font-bold font-['Space_Grotesk']">
          Student<span className="text-orange-500">.LIFE</span>
        </Link>
        
        <div className="relative z-10 mb-20">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Welcome back, <br/> Partner.</h1>
          <p className="text-xl text-gray-400 max-w-md">Manage your deals and track your student customers in real-time.</p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-md w-full">
           <div className="mb-8">
             <h2 className="text-2xl font-bold text-gray-900">Partner Login</h2>
             <p className="text-gray-500">Access your business dashboard.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Email</label>
                <input 
                  required
                  type="email" 
                  placeholder="manager@business.com"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login to Dashboard'}
              </button>
           </form>

           <p className="mt-8 text-center text-sm text-gray-400">
             New to Student.LIFE? <Link href="/business/signup" className="text-orange-500 font-bold hover:underline">Apply here</Link>
           </p>
        </div>
      </div>
    </div>
  )
}