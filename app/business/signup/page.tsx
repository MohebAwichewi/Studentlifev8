'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BusinessSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    category: 'Food', // Default
    description: ''
  })

  // ✅ UPDATED: REAL SUBMISSION LOGIC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 👇 Calling the REAL API now
      const res = await fetch('/api/auth/business/signup', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        alert(data.error || 'Something went wrong.')
      }
    } catch (err) {
      console.error(err)
      alert('Connection error')
    } finally {
      setLoading(false)
    }
  }

  // --- SUCCESS VIEW (After Submission) ---
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative">
        {/* ❌ CLOSE BUTTON FOR SUCCESS VIEW TOO */}
        <Link 
          href="/" 
          className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-md border border-gray-200"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </Link>

        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center animate-[fadeIn_0.5s]">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fa-solid fa-check"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h2>
          <p className="text-gray-500 mb-8">
            Thanks for signing up, <strong>{formData.name}</strong>. Your account is currently 
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded mx-1 font-bold text-xs uppercase tracking-wider">Pending Approval</span>
            from the administrator. You will receive an email once your account is active.
          </p>
          <Link href="/" className="block w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // --- FORM VIEW ---
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
          <h1 className="text-5xl font-bold mb-6 leading-tight">Grow your business <br/> on Campus.</h1>
          <p className="text-xl text-gray-400 max-w-md">Connect directly with thousands of verified students and build loyal customers for life.</p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-md w-full">
           <div className="mb-8">
             <h2 className="text-2xl font-bold text-gray-900">Partner Application</h2>
             <p className="text-gray-500">Enter your business details below.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Tasty Burger Co."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Food">🍔 Food & Drink</option>
                  <option value="Tech">💻 Tech & Electronics</option>
                  <option value="Fashion">👕 Fashion & Apparel</option>
                  <option value="Services">🔧 Services</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                </select>
              </div>

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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Create Password</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                <textarea 
                  rows={3}
                  placeholder="What do you offer to students?"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
           </form>

           <p className="mt-8 text-center text-sm text-gray-400">
             Already a partner? <Link href="/business/login" className="text-orange-500 font-bold hover:underline">Log in here</Link>
           </p>
        </div>
      </div>
    </div>
  )
}