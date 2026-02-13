'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function BusinessLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
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
        localStorage.setItem('isBusinessLoggedIn', 'true')
        localStorage.setItem('businessId', data.businessId)
        localStorage.setItem('businessName', data.businessName)
        localStorage.setItem('businessEmail', formData.email)
        localStorage.setItem('businessStatus', data.status) // Save status
        localStorage.setItem('businessEmail', formData.email) // ✅ Save Email

        if (data.status === 'PENDING') {
          router.push('/business/pending')
        } else {
          router.push('/business/dashboard')
        }
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
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-slate-900 selection:bg-[#D90020] selection:text-white">

      {/* LEFT PANEL: BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-[#D90020] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D90020] to-[#990016] opacity-90"></div>

        {/* Abstract Shapes */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-20"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-500 rounded-full mix-blend-overlay filter blur-[80px] opacity-30"
        />

        <div className="relative z-10 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image src="/images/win-logo.svg" alt="WIN Logo" width={100} height={100} className="mx-auto mb-8 w-24 h-auto ml-36 brightness-0 invert" />
            <h1 className="text-5xl font-black text-white mb-6 leading-tight">Partner with the future.</h1>
            <p className="text-white/80 text-xl font-medium leading-relaxed">
              Manage your deals, track analytics, and connect with thousands of local customers.
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center lg:text-left">
            <Link href="/" className="lg:hidden inline-block mb-8">
              <Image src="/images/win-logo.svg" alt="WIN Logo" width={60} height={60} className="mx-auto" />
            </Link>
            <h2 className="text-3xl md:text-4xl font-black text-[#111111]">Welcome back</h2>
            <p className="text-gray-500 mt-2 font-medium">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Email</label>
              <input
                type="email"
                required
                placeholder="manager@store.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 font-bold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#D90020] focus:ring-1 focus:ring-[#D90020] transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <Link href="/business/forgot-password" className="text-xs font-bold text-[#D90020] hover:text-[#b0001a] transition">Forgot password?</Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 font-bold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#D90020] focus:ring-1 focus:ring-[#D90020] transition-all"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-[#D90020] text-sm font-bold p-4 rounded-xl flex items-center gap-3 animate-pulse">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D90020] hover:bg-[#b0001a] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Sign in"}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-500 font-medium">
              Don't have an account? <Link href="/business/signup" className="text-[#D90020] font-bold hover:underline">Apply now</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
