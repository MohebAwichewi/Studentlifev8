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
      <div className="min-h-screen bg-white flex font-sans text-slate-900 selection:bg-black selection:text-white">

         {/* --- LEFT PANEL: BLACK BRANDING (Student) --- */}
         <div className="hidden lg:flex lg:w-1/2 bg-black relative flex-col justify-between p-16 text-white overflow-hidden">
            {/* Subtle Abstract Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black to-slate-900"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-[150px] opacity-10"></div>

            <div className="relative z-10">
               {/* ✅ UPDATED LOGO TO MATCH HOME */}
               <Link href="/" className="inline-flex items-center gap-1 group">
                  <span className="text-3xl font-black tracking-tighter text-white">Student</span>
                  <span className="bg-[#FF3B30] text-white px-2 py-0.5 rounded-md text-xl font-black tracking-wide transform -rotate-2 group-hover:rotate-0 transition-transform">.LIFE</span>
               </Link>
            </div>

            <div className="relative z-10 max-w-lg">
               <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight">Unlock exclusive student perks.</h1>
               <p className="text-lg text-gray-400 leading-relaxed mb-8 font-medium">
                  Join thousands of students saving money every day on fashion, tech, and food. Verified instantly.
               </p>
            </div>
         </div>

         {/* --- RIGHT PANEL: LOGIN FORM --- */}
         <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative">

            {/* ✅ CLOSE BUTTON (Redirects to Home) */}
            <Link
               href="/"
               className="absolute top-8 right-8 text-slate-400 hover:text-black transition duration-200 p-2 hover:bg-slate-50 rounded-full"
            >
               <i className="fa-solid fa-xmark text-xl"></i>
            </Link>

            <div className="w-full max-w-md">

               <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Welcome back</h2>
                  <p className="text-slate-500 font-medium">Log in to your student account</p>
               </div>

               <form onSubmit={handleLogin} className="space-y-6">
                  {error && (
                     <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {error}
                     </div>
                  )}

                  <div>
                     <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                     <input
                        required
                        type="email"
                        placeholder="name@university.ac.uk"
                        className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-4 font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-black transition-colors"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                     />
                  </div>

                  <div>
                     <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Password</label>
                        <Link href="/student/forgot-password" className="text-xs font-bold text-slate-400 hover:text-black transition">Forgot?</Link>
                     </div>
                     <div className="relative">
                        <input
                           required
                           type={showPassword ? "text" : "password"}
                           placeholder="••••••••"
                           className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-4 font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-black transition-colors"
                           value={formData.password}
                           onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition">
                           <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                     </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2 mt-6">
                     {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Log In"}
                  </button>
               </form>

               <div className="text-center mt-8 pt-8 border-t border-slate-100">
                  <p className="text-sm text-slate-500 font-bold">
                     New to Student.LIFE? <Link href="/student/signup" className="text-black hover:underline decoration-2 underline-offset-4">Join now</Link>
                  </p>
               </div>

            </div>
         </div>
      </div>
   )
}