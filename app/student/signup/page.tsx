'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ✅ Helper Function for Age Validation
const validateAge = (dateString: string) => {
  if (!dateString) return false;

  const today = new Date();
  const birthDate = new Date(dateString);

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  // Adjust age if the birthday hasn't happened yet this year
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // ✅ CHECK: Must be between 15 and 25 (inclusive)
  return age >= 15 && age <= 25;
};

export default function StudentSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'verification'>('form')

  // ✅ Notification State
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' } | null>(null)

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    dob: '',
    university: 'University of Oxford',
    hometown: 'London'
  })

  // ID Card Upload State
  const [idCard, setIdCard] = useState<File | null>(null)
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null)

  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  // Helper to show notification
  const showToast = (message: string, type: 'error' | 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Handle ID Card Upload
  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIdCard(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdCardPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // --- ACTION 1: REAL SIGNUP (DATABASE) ---
  const handleGetMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotification(null)

    // ✅ 1. Validate Age Before API Call
    if (!formData.dob) {
      showToast("Please enter your date of birth.", 'error')
      setLoading(false)
      return;
    }

    const isValidAge = validateAge(formData.dob);

    if (!isValidAge) {
      showToast("Eligibility Requirement: You must be between 15 and 25 years old to join.", 'error')
      setLoading(false)
      return; // STOP EXECUTION
    }

    // Check if using non-university email without ID
    const isUniEmail = formData.email.endsWith('.tn') || formData.email.endsWith('.edu') || formData.email.endsWith('.ac.uk')
    if (!idCard && !isUniEmail) {
      showToast("Please upload your Student ID card if not using a university email.", 'error')
      setLoading(false)
      return;
    }

    try {
      // Use FormData for file upload
      const submitData = new FormData()
      submitData.append('fullName', formData.fullName)
      submitData.append('email', formData.email)
      submitData.append('password', formData.password)
      submitData.append('dob', formData.dob)
      submitData.append('university', formData.university)
      submitData.append('hometown', formData.hometown)

      if (idCard) {
        submitData.append('idImage', idCard)
      }

      const res = await fetch('/api/auth/student/signup', {
        method: 'POST',
        body: submitData // No Content-Type header - browser sets it automatically with boundary
      })

      const data = await res.json()

      if (res.ok) {
        showToast("Verification code sent!", 'success')
        setStep('verification')
      } else {
        showToast(data.error || "Signup failed. Please try again.", 'error')
      }
    } catch (error) {
      showToast("Network error. Please check your connection.", 'error')
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
      const res = await fetch('/api/auth/student/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code })
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('studentName', data.studentName)
        localStorage.setItem('isStudentLoggedIn', 'true')
        showToast("Account Verified Successfully!", 'success')
        setTimeout(() => router.push('/student/home'), 1500)
      } else {
        showToast(data.error || "Invalid Code.", 'error')
      }
    } catch (error) {
      showToast("Verification failed.", 'error')
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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] px-4 py-12 relative">

      {/* FLOATING NOTIFICATION */}
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-5 duration-300 border bg-white ${notification.type === 'error' ? 'border-red-100' : 'border-green-100'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <i className={`fa-solid ${notification.type === 'error' ? 'fa-triangle-exclamation' : 'fa-check'}`}></i>
          </div>
          <div>
            <h4 className={`font-black text-sm ${notification.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {notification.type === 'error' ? 'Error' : 'Success'}
            </h4>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="ml-4 text-slate-300 hover:text-slate-500 transition">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-100 relative overflow-hidden transition-all duration-500">

        {/* ❌ NEW: CLOSE BUTTON (Top Right) */}
        <Link
          href="/"
          className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          title="Return Home"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </Link>

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
                <p className="text-xs text-slate-400 mt-2">(check your spam folder if you didnt find the otp)</p>
              </>
            )}
          </div>

          {step === 'form' && (
            <form onSubmit={handleGetMagicLink} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                  <input required type="text" placeholder="e.g. Sarah Jenkins" className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Date of Birth</label>
                  {/* ✅ DOB INPUT (Connected to State) */}
                  <input
                    required
                    type="date"
                    className={`w-full bg-[#F8F9FC] border rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 transition ${notification?.type === 'error' && notification.message.includes('Eligibility') ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-[#FF3B30]'}`}
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">University</label>
                  <select className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition appearance-none" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })}>
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
                  <select className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition appearance-none" value={formData.hometown} onChange={e => setFormData({ ...formData, hometown: e.target.value })}>
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
                <input required type="email" placeholder="name@university.ac.uk" className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Create Password</label>
                <input required type="password" placeholder="••••••••" className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>

              {/* ID Card Upload */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Student ID Card</label>
                <div className="relative">
                  <input
                    type="file"
                    id="idCardInput"
                    accept="image/*"
                    onChange={handleIdCardChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="idCardInput"
                    className="w-full bg-[#F8F9FC] border-2 border-dashed border-slate-300 rounded-xl px-4 py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition group"
                  >
                    {idCardPreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-green-500">
                          <img src={idCardPreview} alt="ID Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center">
                          <p className="text-green-600 font-bold text-sm">✓ ID Card Selected</p>
                          <p className="text-xs text-slate-400 mt-1">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <i className="fa-solid fa-id-card text-3xl text-slate-300 group-hover:text-slate-400 transition"></i>
                        <p className="text-slate-500 font-bold text-sm">Upload Student ID</p>
                        <p className="text-xs text-slate-400">(Required if not using uni email)</p>
                      </div>
                    )}
                  </label>
                </div>
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