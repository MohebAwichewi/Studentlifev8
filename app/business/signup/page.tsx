'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

export default function BusinessSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

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
    password: '',
    latitude: 0,
    longitude: 0
  })

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)

  // Declare custom element to avoid TS errors
  // (You can also move this to a types.d.ts file, but here is fine for now)
  // @ts-ignore
  declare global {
    namespace JSX {
      interface IntrinsicElements {
        'gmp-place-autocomplete': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          placeholder?: string;
        };
      }
    }
  }

  // --- 1. GOOGLE MAPS INIT (WEB COMPONENT) ---
  useEffect(() => {
    if (!isManualEntry && searchInputRef.current) {
      const el = searchInputRef.current as any;

      // ✅ FIX: Explicitly request fields to avoid "Property not available" error
      // The new Google Maps Places Library throws if you access a field you didn't ask for.
      el.fields = ['displayName', 'formattedAddress', 'location', 'id', 'addressComponents'];

      const onPlaceSelect = async (event: any) => {
        const place = event.detail.getPlace();

        if (place) {
          // Use new API fields (displayName, etc.) since we requested them
          const name = place.displayName || place.name || '';
          const address = place.formattedAddress || place.formatted_address || '';
          const placeId = place.id || place.place_id || '';

          let lat = 0;
          let lng = 0;

          if (place.location) {
            lat = place.location.lat();
            lng = place.location.lng();
          }

          setFormData(prev => ({
            ...prev,
            businessName: name,
            address: address,
            placeId: placeId,
            latitude: lat,
            longitude: lng
          }));
          setTimeout(() => setStep(2), 500);
        }
      };

      el.addEventListener('gmp-places-select', onPlaceSelect);
      return () => {
        el.removeEventListener('gmp-places-select', onPlaceSelect);
      };
    }
  }, [step, isManualEntry]);

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

    // 1. Construct Full Address
    let fullAddress = formData.address
    if (formData.city && !fullAddress.toLowerCase().includes(formData.city.toLowerCase())) {
      fullAddress += `, ${formData.city}`
    }
    if (formData.postcode && !fullAddress.toLowerCase().includes(formData.postcode.toLowerCase())) {
      fullAddress += `, ${formData.postcode}`
    }

    // 2. Geocode Address to get Lat/Lng
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const lat = results[0].geometry.location.lat()
          const lng = results[0].geometry.location.lng()
          const formattedAddress = results[0].formatted_address

          console.log("📍 Geocoding Success:", lat, lng)

          setFormData(prev => ({
            ...prev,
            address: formattedAddress, // Use the official formatted address
            latitude: lat,
            longitude: lng
          }))
        } else {
          console.error("Geocode failed: " + status)
          // Fallback: Just save the text address, coordinates will remain 0
          setFormData(prev => ({
            ...prev,
            address: fullAddress
          }))
        }
        // 3. Move to next step regardless of geocode success
        setStep(2)
      })
    } else {
      // Fallback if Google Maps API not loaded
      setFormData(prev => ({
        ...prev,
        address: fullAddress
      }))
      setStep(2)
    }
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

  // ✅ Create Account (No Stripe)
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
        // 2. Immediate Success - No Stripe
        // Login Logic can be here, or redirect to login
        router.push('/business/login?success=account_created')
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
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&loading=async`}
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
                  {/* @ts-ignore */}
                  <gmp-place-autocomplete ref={searchInputRef} placeholder="Search business name or address..." types={['establishment', 'geocode']}>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 font-bold focus:outline-none focus:border-black transition" />
                  </gmp-place-autocomplete>
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
            <button type="submit" disabled={loading} className={btnPrimary}>{loading ? "Creating Account..." : "Complete Signup"}</button>
          </form>
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