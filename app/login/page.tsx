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
      // ✅ Connect to Student Auth API
      const res = await fetch('/api/auth/student/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('studentEmail', data.email || formData.email)
        setTimeout(() => {
             // ✅ Redirect to Student Home
             router.push('/student/home') 
        }, 500)
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err: any) {
      setError("Unable to connect. Please check your internet.")
    } finally {
      setLoading(false) 
    }
  }

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900">
      
      {/* --- LEFT PANEL: PURPLE BRANDING (Student) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#5856D6] relative flex-col justify-between p-16 text-white overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#5856D6] to-[#4240A8]"></div>
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF3B30] rounded-full blur-[120px] opacity-40"></div>
         
         <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 group">
                <span className="text-2xl font-black tracking-tight">Student.LIFE</span>
            </Link>
         </div>

         <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-black mb-6 leading-tight">Unlock exclusive student perks.</h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
               Join thousands of Tunisian students saving money every day on food, tech, and fashion. Verified instantly.
            </p>
         </div>
      </div>

      {/* --- RIGHT PANEL: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#F4F7FE] lg:bg-white">
         <div className="w-full max-w-md bg-white lg:bg-transparent p-8 lg:p-0 rounded-3xl lg:rounded-none shadow-xl lg:shadow-none">
            
            <div className="mb-10">
               <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome back</h2>
               <p className="text-slate-500">Student Access Portal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
               {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3">
                     <i className="fa-solid fa-circle-exclamation"></i>
                     {error}
                  </div>
               )}

               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                  <input 
                     required 
                     type="email" 
                     placeholder="name@university.tn" 
                     className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-900 focus:outline-none focus:border-[#5856D6] transition" 
                     value={formData.email} 
                     onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
               </div>

               <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  </div>
                  <div className="relative">
                     <input 
                        required 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-900 focus:outline-none focus:border-[#5856D6] transition" 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                     </button>
                  </div>
               </div>

               <button type="submit" disabled={loading} className="w-full bg-[#5856D6] text-white font-bold py-4 rounded-xl hover:bg-[#4845B8] transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-4">
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Sign In"}
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