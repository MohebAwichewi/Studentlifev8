'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StudentAuth() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Email Input, 2: OTP Input
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // STU-01: Strict Domain Validation
  const isValidStudentEmail = (email: string) => {
    // Regex enforces .ac.uk (UK), .edu (US), or .tn (Tunisia)
    return /^[^\s@]+@[^\s@]+\.(ac\.uk|edu|tn)$/i.test(email)
  }

  // ✅ UPDATED: REAL "SEND OTP" LOGIC
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!isValidStudentEmail(email)) {
      setError('Access Restricted: You must use a valid university email (.ac.uk, .edu, .tn)')
      return
    }

    setLoading(true)
    
    try {
      // 👇 Call the Real API
      const res = await fetch('/api/auth/student/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        setStep(2) // Move to next step only if email sent successfully
        // Note: We don't alert the code anymore, it's in the email!
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send verification code.')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ UPDATED: REAL "VERIFY OTP" LOGIC
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        router.push('/student/dashboard')
      } else {
        // Read specific error from server (e.g., "Code Expired")
        const data = await res.json()
        setError(data.error || 'Invalid Verification Code')
      }
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      
      {/* ❌ CLOSE BUTTON */}
      <Link 
        href="/" 
        className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm border border-gray-200"
      >
        <i className="fa-solid fa-xmark text-lg"></i>
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-100">
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span className="bg-[#ff4747] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block transform -rotate-2">
            Student.LIFE
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 1 ? 'Student Access' : 'Verify Email'}
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            {step === 1 ? 'Join the exclusive student network' : `Enter the code sent to ${email}`}
          </p>
        </div>

        {/* STEP 1: EMAIL INPUT */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="text-left mb-6">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">University Email Address</label>
              <div className="relative">
                <i className="fa-solid fa-graduation-cap absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="email" 
                  placeholder="name@university.ac.uk" 
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6246ea] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 flex items-center gap-2 text-left">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-[#6246ea] hover:bg-[#4b32c3] text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? 'Verifying...' : 'Get Magic Link'} <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6 flex justify-center">
              <input 
                type="text" 
                placeholder="000000" 
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-48 p-3 text-center text-2xl tracking-[0.5em] font-bold text-[#6246ea] bg-indigo-50 border-2 border-[#6246ea] rounded-xl focus:outline-none"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-[#1e293b] hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all mb-4 disabled:opacity-70"
            >
              {loading ? 'Checking...' : 'Verify & Login'}
            </button>

            <button 
              type="button"
              onClick={() => setStep(1)}
              className="text-gray-500 text-sm hover:underline hover:text-gray-700"
            >
              Change email address
            </button>
          </form>
        )}

      </div>
    </div>
  ) 
}