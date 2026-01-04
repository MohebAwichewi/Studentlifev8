'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StudentLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // ✅ FIX: Points to the correct path '/api/auth/login'
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      // Safety Check: Ensure response is actually JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server connection error (API path might be wrong)");
      }

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('studentEmail', data.email || formData.email)
        // Add a small delay so user sees the success state
        setTimeout(() => {
             router.push('/student/home') 
        }, 500)
      } else {
        // If the API returns "User not found", it will show here
        setError(data.error || "Login failed")
      }
    } catch (err: any) {
      setError(err.message || "Unable to connect. Please check your internet.")
    } finally {
      // ✅ FIX: Always stop loading
      setLoading(false) 
    }
  }

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900">
      
      {/* --- LEFT PANEL: BRANDING & VISUALS (Hidden on mobile) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#5856D6] relative flex-col justify-between p-16 text-white overflow-hidden">
         {/* Background Effects */}
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#5856D6] to-[#4240A8]"></div>
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF3B30] rounded-full blur-[120px] opacity-40"></div>
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

         <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#5856D6] font-black text-xl shadow-lg group-hover:scale-105 transition">S</div>
                <span className="text-2xl font-black tracking-tight">Student.LIFE</span>
            </Link>
         </div>

         <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-black mb-6 leading-tight">Unlock exclusive student perks.</h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
               Join thousands of Tunisian students saving money every day on food, tech, and fashion. Verified instantly.
            </p>
            <div className="flex items-center gap-4">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-[#5856D6] bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold">
                        <i className="fa-solid fa-user text-white/50"></i>
                     </div>
                  ))}
               </div>
               <div className="text-sm font-bold text-white/90">
                  <span className="text-white">12k+</span> students joined
               </div>
            </div>
         </div>
         
         <div className="relative z-10 text-xs font-medium text-white/40">
            &copy; 2026 S7 Agency. All rights reserved.
         </div>
      </div>

      {/* --- RIGHT PANEL: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#F4F7FE] lg:bg-white">
         
         <div className="w-full max-w-md bg-white lg:bg-transparent p-8 lg:p-0 rounded-3xl lg:rounded-none shadow-xl lg:shadow-none">
            
            {/* Mobile Logo (Visible only on mobile) */}
            <div className="lg:hidden mb-8 text-center">
               <Link href="/" className="inline-flex items-center gap-1">
                 <span className="text-2xl font-black tracking-tighter text-slate-900">Student</span>
                 <span className="bg-[#FF3B30] text-white px-2 py-0.5 rounded text-sm font-black tracking-wide">.LIFE</span>
               </Link>
            </div>

            <div className="mb-10">
               <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome back</h2>
               <p className="text-slate-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
               
               {/* Error Alert */}
               {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                     <i className="fa-solid fa-circle-exclamation"></i>
                     {error}
                  </div>
               )}

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                 <div className="relative group">
                    <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5856D6] transition"></i>
                    <input 
                      required 
                      type="email" 
                      placeholder="name@university.tn" 
                      className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl pl-11 pr-4 py-4 font-bold text-slate-900 focus:outline-none focus:border-[#5856D6] focus:ring-4 focus:ring-[#5856D6]/10 transition placeholder:font-medium placeholder:text-slate-300" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                 </div>
               </div>

               <div>
                 <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <Link href="/forgot-password" className="text-xs font-bold text-[#5856D6] hover:underline">Forgot password?</Link>
                 </div>
                 <div className="relative group">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5856D6] transition"></i>
                    <input 
                      required 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl pl-11 pr-12 py-4 font-bold text-slate-900 focus:outline-none focus:border-[#5856D6] focus:ring-4 focus:ring-[#5856D6]/10 transition placeholder:font-medium placeholder:text-slate-300" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                 </div>
               </div>

               <button 
                 type="submit" 
                 disabled={loading} 
                 className="w-full bg-[#5856D6] text-white font-bold py-4 rounded-xl hover:bg-[#4845B8] active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-4"
               >
                 {loading ? (
                   <>
                     <i className="fa-solid fa-circle-notch fa-spin"></i>
                     <span>Verifying...</span>
                   </>
                 ) : (
                   "Sign In"
                 )}
               </button>
            </form>

            <div className="text-center mt-8">
               <p className="text-sm text-slate-500 font-medium">
                  Don't have an account? <Link href="/student/signup" className="text-[#5856D6] font-bold hover:underline">Register for free</Link>
               </p>
            </div>

         </div>
      </div>
    </div>
  )
}