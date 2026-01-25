'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)

export default function BusinessSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Expanded step type definition to include Stripe step (6)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)

  // --- GOOGLE MAPS STATE ---
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isManualEntry, setIsManualEntry] = useState(false)

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    city: '',
    postcode: '',
    placeId: '',
    category: 'Food & Drink',
    contactName: '',
    phone: '',
    role: 'Owner',
    email: '',
    otp: '',
    password: ''
  })

  const [clientSecret, setClientSecret] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)

  // --- 1. GOOGLE MAPS INIT ---
  useEffect(() => {
    // Wait for the script and checks if the 'places' library is available
    if (!isManualEntry && scriptLoaded && searchInputRef.current && window.google && window.google.maps && window.google.maps.places) {

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['establishment'],
          fields: ['name', 'formatted_address', 'place_id'],
          componentRestrictions: { country: 'gb' }
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.name && place.formatted_address) {
            setFormData(prev => ({
              ...prev,
              businessName: place.name || '',
              address: place.formatted_address || '',
              placeId: place.place_id || ''
            }))
            setTimeout(() => setStep(2), 500)
          }
        })
      } catch (err) {
        console.error("Maps Autocomplete Error:", err);
      }
    }
  }, [scriptLoaded, step, isManualEntry])

  // --- ACTIONS ---

  // ✅ NEW: Handle Phone Change (Numbers Only)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Regex: Replace anything that is NOT 0-9 with an empty string
    const numericValue = value.replace(/[^0-9]/g, '')
    setFormData({ ...formData, phone: numericValue })
  }

  const toggleManualMode = () => {
    setIsManualEntry(true)
    setFormData(prev => ({ ...prev, placeId: 'manual' }))
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Append city/postcode to address if not present
    if (formData.city && !formData.address.includes(formData.city)) {
      setFormData(prev => ({ ...prev, address: `${prev.address}, ${prev.city} ${prev.postcode}` }))
    }
    setStep(2)
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  // ✅ REAL: Send OTP API
  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/business/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.businessName })
      })

      if (res.ok) {
        setOtpSent(true)
        setStep(4) // Move to OTP verify step
      } else {
        const d = await res.json()
        alert(d.error || "Failed to send code")
      }
    } catch (err) {
      alert("Network error sending email")
    } finally {
      setLoading(false)
    }
  }

  // ✅ REAL: Verify OTP API
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const code = otp.join('')

    try {
      const res = await fetch('/api/auth/business/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code })
      })

      if (res.ok) {
        setStep(5) // Move to Password step
      } else {
        alert("Invalid code")
      }
    } catch (err) {
      alert("Verification error")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Create Account + Init Stripe
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Register User in DB
      const res = await fetch('/api/auth/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        // 2. If registration success, get Stripe Secret (simulated here or fetched from API)
        setStep(6)
        // If you have a Stripe API, call it here to get clientSecret
        // setClientSecret(data.clientSecret) 
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert("Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])
    if (element.nextSibling && element.value) (element.nextSibling as HTMLInputElement).focus()
  }

  // --- STYLES ---
  const inputStyle = "w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:border-black transition"
  const labelStyle = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1"
  // Updated primary button style to black
  const btnPrimary = "w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2"

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-slate-900 selection:bg-black selection:text-white">

      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />

      {/* LEFT PANEL - UPDATED STYLE */}
      <div className="md:w-1/3 bg-black p-12 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle gradient effect to match home */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 blur-[100px] opacity-30 pointer-events-none"></div>

        <div className="relative z-10">
          {/* UPDATED LOGO */}
          <Link href="/" className="inline-flex items-center gap-1 mb-12 group hover:opacity-90 transition">
            <span className="text-3xl font-black tracking-tighter text-white">Student</span>
            <span className="bg-[#FF3B30] text-white px-2 py-0.5 rounded-md text-xl font-black tracking-wide transform -rotate-2 group-hover:rotate-0 transition-transform">.LIFE</span>
          </Link>

          <h1 className="text-4xl font-black leading-tight mb-6 tracking-tight">Partner with the next generation.</h1>
          <p className="text-slate-400 text-lg font-medium">Join the network that connects businesses with students.</p>
        </div>

        <div className="relative z-10 space-y-6 mt-12 hidden md:block">
          <StepIndicator step={1} current={step} label="Find Store" />
          <StepIndicator step={2} current={step} label="Review & Contact" />
          <StepIndicator step={3} current={step} label="Login Details" />
          <StepIndicator step={5} current={step} label="Create Password" />
          <StepIndicator step={6} current={step} label="Start Free Trial" />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="md:w-2/3 p-8 md:p-16 flex flex-col justify-center max-w-2xl mx-auto w-full relative">

        {/* ✅ CLOSE BUTTON (Top Right) */}
        <Link
          href="/"
          className="absolute top-8 right-8 text-slate-400 hover:text-black transition duration-200 p-2 hover:bg-slate-100 rounded-full"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </Link>

        {/* STEP 1: FIND STORE OR MANUAL ENTRY */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-black mb-2 text-slate-900">Sign up your business</h2>
            <p className="text-slate-500 mb-8 font-medium">Let's get you set up. Where are you located?</p>

            {!isManualEntry ? (
              <div className="space-y-6">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-4 text-slate-400 z-10"></i>
                  <input ref={searchInputRef} type="text" placeholder="Search business name or address..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 font-bold focus:outline-none focus:border-black transition" />
                </div>
                <button onClick={toggleManualMode} className="text-sm font-bold text-black hover:underline block mx-auto">
                  I can't find my store on the map
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-5">
                <InputGroup label="Business Name" placeholder="e.g. Joe's Cafe" value={formData.businessName} onChange={(v: any) => setFormData({ ...formData, businessName: v })} required />
                <InputGroup label="Street Address" placeholder="e.g. 123 High Street" value={formData.address} onChange={(v: any) => setFormData({ ...formData, address: v })} required />

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="City" placeholder="London" value={formData.city} onChange={(v: any) => setFormData({ ...formData, city: v })} required />
                  <InputGroup label="Postcode" placeholder="SW1A 1AA" value={formData.postcode} onChange={(v: any) => setFormData({ ...formData, postcode: v })} required />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsManualEntry(false)} className="px-6 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">Back</button>
                  <button type="submit" className={btnPrimary}>Continue</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: REVIEW DETAILS */}
        {step === 2 && (
          <form onSubmit={handleDetailsSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
            <h2 className="text-3xl font-black mb-2 text-slate-900">Review details</h2>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100">📍</div>
              <div className="flex-1">
                <div className="font-black text-lg text-slate-900">{formData.businessName || "New Business"}</div>
                <div className="text-slate-500 text-sm">{formData.address || "Address pending"}</div>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-black hover:underline">Edit</button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Your Name</label>
                <input required type="text" className={inputStyle} value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
              </div>
              <div>
                <label className={labelStyle}>Phone</label>
                {/* ✅ UPDATED PHONE INPUT */}
                <input
                  required
                  type="tel"
                  className={inputStyle}
                  value={formData.phone}
                  onChange={handlePhoneChange} // Calls numeric filter
                  placeholder="e.g. 50123456"
                  maxLength={15}
                />
              </div>
            </div>
            <button type="submit" className={btnPrimary}>Continue</button>
          </form>
        )}

        {/* STEP 3: WORK EMAIL */}
        {step === 3 && (
          <form onSubmit={sendOtp} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
            <h2 className="text-3xl font-black mb-2 text-slate-900">Work Email</h2>
            <input required type="email" className={inputStyle} placeholder="name@business.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <button type="submit" disabled={loading} className={btnPrimary}>{loading ? "Sending..." : "Send Verification"}</button>
          </form>
        )}

        {/* STEP 4: VERIFY OTP */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center">
            <h2 className="text-3xl font-black mb-2 text-slate-900">Verify Email</h2>
            <p className="text-slate-500 mb-2">Enter code sent to {formData.email}</p>
            <p className="text-xs font-bold text-slate-400 mb-8 bg-slate-50 py-2 px-4 rounded-lg inline-block border border-slate-200">
              <i className="fa-solid fa-circle-info mr-2"></i>
              Check your <b>Spam/Junk</b> folder if not received.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div className="flex justify-center gap-2 mb-8">
                {otp.map((d, i) => <input key={i} type="text" maxLength={1} className="w-12 h-14 border-2 border-slate-200 rounded-xl text-center text-2xl font-black focus:border-black outline-none" value={d} onChange={e => handleOtpChange(e.target, i)} />)}
              </div>
              <button type="submit" disabled={loading} className={btnPrimary}>{loading ? "Verifying..." : "Verify"}</button>
            </form>
          </div>
        )}

        {/* STEP 5: PASSWORD */}
        {step === 5 && (
          <form onSubmit={handleCreateAccount} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
            <h2 className="text-3xl font-black mb-2 text-slate-900">Create Password</h2>
            <input required type="password" className={inputStyle} placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <button type="submit" disabled={loading} className={btnPrimary}>{loading ? "Creating Account..." : "Continue to Payment"}</button>
          </form>
        )}

        {/* STEP 6: STRIPE (Only if clientSecret exists) */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-black mb-2 text-slate-900">Start 3-Month Free Trial</h2>

            {/* BILLING TOGGLE */}
            <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
              <button
                onClick={() => toggleBilling('month')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${billingInterval === 'month' ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Monthly (£10/mo)
              </button>
              <button
                onClick={() => toggleBilling('year')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${billingInterval === 'year' ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Yearly (£100/yr) <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full ml-1">SAVE £20</span>
              </button>
            </div>

            <div className="bg-[#F4F7FE] p-4 rounded-xl mb-6 border border-blue-100 flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0"><i className="fa-solid fa-shield-halved"></i></div>
              <div className="text-sm text-blue-800">
                <span className="font-bold block">£0.00 due today.</span>
                First payment of <b>{billingInterval === 'month' ? '£10.00' : '£100.00'}</b> starts in 90 days. Cancel anytime.
              </div>
            </div>

            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm />
              </Elements>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-slate-200"></i>
              </div>
            )}

          </div>
        )}

        {/* STEP 6 Fallback if no stripe secret (Manual Flow) */}
        {step === 6 && !clientSecret && (
          <div className="animate-in fade-in slide-in-from-right-8 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-2">You're all set!</h2>
            <p className="text-slate-500 mb-8">Account created successfully.</p>
            <Link href="/business/login" className={btnPrimary}>Login to Dashboard</Link>
          </div>
        )}

      </div>
    </div>
  )
}

// --- HELPERS ---
const InputGroup = ({ label, placeholder, value, onChange, required }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
    <input required={required} type="text" placeholder={placeholder} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:border-black transition" value={value} onChange={e => onChange && onChange(e.target.value)} />
  </div>
)

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [msg, setMsg] = useState('');
  const [proc, setProc] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProc(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/business/dashboard`
      }
    });

    if (error) {
      setMsg(error.message || 'Payment Failed');
      setProc(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button disabled={!stripe || proc} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-lg">{proc ? "Verifying..." : "Start Trial"}</button>
      {msg && <div className="text-red-500 text-sm font-bold text-center">{msg}</div>}
    </form>
  )
}

const StepIndicator = ({ step, current, label }: any) => {
  const isCompleted = current > step;
  const isActive = current === step;
  return (
    <div className={`flex items-center gap-4 ${current < step ? 'opacity-30' : 'opacity-100'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${isCompleted ? 'bg-white border-white text-black' : isActive ? 'bg-black text-white border-white' : 'border-white text-white'}`}>
        {isCompleted ? <i className="fa-solid fa-check"></i> : step}
      </div>
      <span className="font-bold text-white">{label}</span>
    </div>
  )
}