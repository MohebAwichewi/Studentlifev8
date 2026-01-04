'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StudentSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'verification'>('form')
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    dob: '',
    university: 'University of Oxford',
    hometown: 'London'
  })
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']) 

  // --- ACTION 1: REAL SIGNUP (DATABASE) ---
  const handleGetMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call the REAL Signup API
      const res = await fetch('/api/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setStep('verification') // Move to OTP step on success
      } else {
        alert(data.error || "Signup failed. Please try again.")
      }
    } catch (error) {
      alert("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  // --- ACTION 2: REAL VERIFICATION (DATABASE) ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const code = otp.join('')
    
    try {
      // Call the REAL Verify API
      const res = await fetch('/api/auth/student/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code })
      })

      const data = await res.json()

      if (res.ok) {
        // Success! Save session and redirect
        localStorage.setItem('studentName', data.studentName)
        localStorage.setItem('isStudentLoggedIn', 'true')
        alert("Account Verified Successfully!")
        router.push('/student/home') 
      } else {
        alert(data.error || "Invalid Code.")
      }
    } catch (error) {
      alert("Verification failed.")
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP Input
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])
    if (element.nextSibling && element.value) {
      (element.nextSibling as HTMLInputElement).focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] px-4 py-12">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-100 relative overflow-hidden transition-all duration-500">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-[80px] -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          
          <div className="text-center mb-8">
             <Link href="/" className="inline-flex items-center gap-1 mb-4 group hover:opacity-80 transition">
               <span className="text-3xl font-black tracking-tighter text-slate-900">Student</span>
               <span className="bg-[#FF3B30] text-white px-2 py-0.5 rounded-md text-xl font-black tracking-wide">.LIFE</span>
             </Link>
             
             {step === 'form' ? (
               <>
                 <h2 className="text-2xl font-black text-slate-900 mb-1">Join the Network</h2>
                 <p className="text-slate-500 text-sm font-medium">Create your verified student ID.</p>
               </>
             ) : (
               <>
                 <h2 className="text-2xl font-black text-slate-900 mb-1">Check Your Email</h2>
                 <p className="text-slate-500 text-sm font-medium">We sent a verification code to <b>{formData.email}</b></p>
                 <p className="text-xs text-slate-400 mt-2">(Check your server console for the code in MVP mode)</p>
               </>
             )}
          </div>

          {step === 'form' && (
            <form onSubmit={handleGetMagicLink} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                     <input required type="text" placeholder="e.g. Sarah Jenkins" className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Date of Birth</label>
                     <input required type="date" className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">University</label>
                     <select className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition appearance-none" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})}>
                        <option>University of Oxford</option>
                        <option>University of Cambridge</option>
                        <option>Imperial College London</option>
                        <option>UCL</option>
                        <option>University of Manchester</option>
                        <option>King's College London</option>
                        <option>University of Edinburgh</option>
                        <option>Other</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Home Town</label>
                     <select className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition appearance-none" value={formData.hometown} onChange={e => setFormData({...formData, hometown: e.target.value})}>
                        <option>London</option>
                        <option>Manchester</option>
                        <option>Birmingham</option>
                        <option>Leeds</option>
                        <option>Glasgow</option>
                        <option>Liverpool</option>
                        <option>Edinburgh</option>
                        <option>Other</option>
                     </select>
                  </div>
               </div>

               <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">University Email</label>
                   <input required type="email" placeholder="name@university.ac.uk" className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Create Password</label>
                   <input required type="password" placeholder="••••••••" className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
               </div>

               <button type="submit" disabled={loading} className="w-full bg-[#5856D6] hover:bg-[#4a48b8] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-4">
                 {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Get Verification Code →"}
               </button>
            </form>
          )}

          {step === 'verification' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <div className="bg-[#F8F9FC] border border-slate-200 rounded-2xl p-6 mb-8 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl">✨</div>
                  <p className="text-slate-500 text-sm">Enter the 6-digit code sent to your email.</p>
               </div>

               <form onSubmit={handleVerifyOtp}>
                  <div className="flex justify-center gap-2 mb-8">
                     {otp.map((data, index) => (
                        <input key={index} type="text" maxLength={1} className="w-12 h-14 border-2 border-slate-200 rounded-xl text-center text-2xl font-black text-slate-900 focus:border-[#5856D6] focus:ring-0 outline-none transition bg-white" value={data} onChange={e => handleOtpChange(e.target, index)} onFocus={e => e.target.select()} />
                     ))}
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#5856D6] hover:bg-[#4a48b8] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Verify & Enter App"}
                  </button>
               </form>

               <div className="mt-6 text-center">
                  <button onClick={() => setStep('form')} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">&larr; Back to details</button>
               </div>
            </div>
          )}

          {step === 'form' && (
            <div className="text-center mt-6 pt-6 border-t border-slate-50">
               <p className="text-sm text-slate-400 font-medium">Already verified? <Link href="/student/login" className="text-[#5856D6] font-bold hover:underline">Log in</Link></p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}