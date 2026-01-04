'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)

export default function BusinessSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    password: ''
  })
  
  const [clientSecret, setClientSecret] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', '']) 

  // --- 1. GOOGLE MAPS INIT ---
  useEffect(() => {
    if (!isManualEntry && scriptLoaded && searchInputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['establishment'],
        fields: ['name', 'formatted_address', 'place_id'],
        componentRestrictions: { country: 'uk' } 
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
    }
  }, [scriptLoaded, step, isManualEntry])

  // --- ACTIONS ---

  const toggleManualMode = () => {
    setIsManualEntry(true)
    setFormData(prev => ({ ...prev, placeId: 'manual' }))
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.address.includes(formData.city)) {
        setFormData(prev => ({ ...prev, address: `${prev.address}, ${prev.city}, ${prev.postcode}` }))
    }
    setStep(2)
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  // ✅ REAL: Send Email API (Replaced Mockup)
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/business/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setStep(4) // Move to OTP input
      } else {
        alert(data.error || "Failed to send email")
      }
    } catch (err) {
      alert("Network error sending email")
    } finally {
      setLoading(false)
    }
  }

  // ✅ REAL: Verify OTP API (Replaced Mockup)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const code = otp.join('')
    
    try {
      const res = await fetch('/api/auth/business/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code })
      })

      if (res.ok) {
        setStep(5) // Move to Create Password
      } else {
        alert("Invalid or expired code. Please try again.")
        setOtp(['', '', '', '', '', '']) 
      }
    } catch (err) {
      alert("Verification error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/business/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        setClientSecret(data.clientSecret)
        setStep(6)
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

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-slate-900">
      
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />

      {/* LEFT PANEL */}
      <div className="md:w-1/3 bg-[#0D3C34] p-12 text-white flex flex-col justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#1FA386] blur-[100px] opacity-20 pointer-events-none"></div>
         
         <div className="relative z-10">
           <Link href="/" className="inline-flex items-center gap-1 mb-12 hover:opacity-80 transition">
             <span className="text-2xl font-black tracking-tighter">Student</span>
             <span className="bg-[#FF3B30] text-white px-2 py-0.5 rounded text-sm font-black tracking-wide">.LIFE</span>
           </Link>
           <h1 className="text-4xl font-black leading-tight mb-6">Partner with the next generation.</h1>
           <p className="text-[#8FB3AC] text-lg">Join the network that connects businesses with students across the UK.</p>
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
      <div className="md:w-2/3 p-8 md:p-16 flex flex-col justify-center max-w-2xl mx-auto w-full">
         
         {/* STEP 1: FIND STORE OR MANUAL ENTRY */}
         {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
             <h2 className="text-3xl font-black mb-2 text-[#0D3C34]">Sign up your business</h2>
             <p className="text-slate-500 mb-8 font-medium">Let's get you set up. Where are you located?</p>
             
             {!isManualEntry ? (
                 <div className="space-y-6">
                     <div className="relative">
                       <i className="fa-solid fa-magnifying-glass absolute left-4 top-4 text-slate-400 z-10"></i>
                       <input ref={searchInputRef} type="text" placeholder="Search business name or address..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 font-bold focus:outline-none focus:border-[#0D3C34] transition" />
                     </div>
                     <button onClick={toggleManualMode} className="text-sm font-bold text-[#0D3C34] hover:underline block mx-auto">
                        I can't find my store on the map
                     </button>
                 </div>
             ) : (
                 <form onSubmit={handleManualSubmit} className="space-y-5">
                    <InputGroup label="Business Name" placeholder="e.g. Joe's Cafe" value={formData.businessName} onChange={v => setFormData({...formData, businessName: v})} required />
                    <InputGroup label="Street Address" placeholder="e.g. 123 High Street" value={formData.address} onChange={v => setFormData({...formData, address: v})} required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="City" placeholder="London" value={formData.city} onChange={v => setFormData({...formData, city: v})} required />
                        <InputGroup label="Postcode" placeholder="SW1A 1AA" value={formData.postcode} onChange={v => setFormData({...formData, postcode: v})} required />
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsManualEntry(false)} className="px-6 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">Back</button>
                        <button type="submit" className="flex-1 bg-[#0D3C34] text-white font-bold py-4 rounded-xl hover:bg-[#092923] transition">Continue</button>
                    </div>
                 </form>
             )}
           </div>
         )}

         {/* STEP 2: REVIEW DETAILS */}
         {step === 2 && (
            <form onSubmit={handleDetailsSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
              <h2 className="text-3xl font-black mb-2 text-[#0D3C34]">Review details</h2>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100">📍</div>
                <div className="flex-1">
                   <div className="font-black text-lg text-slate-900">{formData.businessName || "New Business"}</div>
                   <div className="text-slate-500 text-sm">{formData.address || "Address pending"}</div>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-[#0D3C34] hover:underline">Edit</button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div><label className="label">Your Name</label><input required type="text" className="input-field" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} /></div>
                <div><label className="label">Phone</label><input required type="tel" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              </div>
              <button type="submit" className="btn-primary w-full">Continue</button>
            </form>
         )}

         {/* STEP 3: WORK EMAIL */}
         {step === 3 && (
            <form onSubmit={handleSendVerification} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
              <h2 className="text-3xl font-black mb-2 text-[#0D3C34]">Work Email</h2>
              <input required type="email" className="input-field" placeholder="name@business.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Sending..." : "Send Verification"}</button>
            </form>
         )}
         
         {/* STEP 4: VERIFY OTP */}
         {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center">
              <h2 className="text-3xl font-black mb-2 text-[#0D3C34]">Verify Email</h2>
              <p className="text-slate-500 mb-6">Enter code sent to {formData.email}</p>
              <form onSubmit={handleVerifyOtp}>
                 <div className="flex justify-center gap-2 mb-8">
                    {otp.map((d, i) => <input key={i} type="text" maxLength={1} className="w-12 h-14 border-2 border-slate-200 rounded-xl text-center text-2xl font-black" value={d} onChange={e => handleOtpChange(e.target, i)} />)}
                 </div>
                 <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Verifying..." : "Verify"}</button>
              </form>
            </div>
         )}
         
         {/* STEP 5: PASSWORD */}
         {step === 5 && (
            <form onSubmit={handleCreateAccount} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
              <h2 className="text-3xl font-black mb-2 text-[#0D3C34]">Create Password</h2>
              <input required type="password" className="input-field" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Creating Account..." : "Continue to Payment"}</button>
            </form>
         )}

         {/* STEP 6: STRIPE */}
         {step === 6 && clientSecret && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <h2 className="text-3xl font-black mb-2 text-[#0D3C34]">Start 3-Month Free Trial</h2>
               <div className="bg-[#F4F7FE] p-4 rounded-xl mb-6 border border-blue-100 flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center"><i className="fa-solid fa-shield-halved"></i></div>
                  <div className="text-sm text-blue-800"><span className="font-bold">£0.00 due today.</span> First payment of £29 starts in 90 days.</div>
               </div>
               <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm />
               </Elements>
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
     <input required={required} type="text" placeholder={placeholder} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:border-[#0D3C34] transition" value={value} onChange={e => onChange && onChange(e.target.value)} />
  </div>
)

const PaymentForm = () => {
  const stripe = useStripe(); const elements = useElements();
  const [msg, setMsg] = useState(''); const [proc, setProc] = useState(false);
  const handleSubmit = async (e:any) => { e.preventDefault(); if(!stripe||!elements)return; setProc(true);
    const {error} = await stripe.confirmSetup({ elements, confirmParams: { return_url: `${window.location.origin}/business` } });
    if(error) { setMsg(error.message||'Failed'); setProc(false); }
  }
  return <form onSubmit={handleSubmit} className="space-y-6"><PaymentElement /><button disabled={!stripe||proc} className="btn-primary w-full">{proc?"Verifying...":"Start Trial"}</button>{msg&&<div className="text-red-500 text-sm">{msg}</div>}</form>
}

const StepIndicator = ({ step, current, label }: any) => {
  const isCompleted = current > step; const isActive = current === step;
  return <div className={`flex items-center gap-4 ${current < step ? 'opacity-30' : 'opacity-100'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${isCompleted?'bg-[#1FA386] border-[#1FA386] text-white':isActive?'bg-white text-[#0D3C34] border-white':'border-white text-white'}`}>{isCompleted?<i className="fa-solid fa-check"></i>:step}</div><span className="font-bold">{label}</span></div>
}

// Styles
const btnPrimary = "bg-[#0D3C34] text-white font-bold py-4 rounded-xl hover:bg-[#082822] transition shadow-lg w-full"