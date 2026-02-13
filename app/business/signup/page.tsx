'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

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
    longitude: 0,
    googleMapsUrl: '' // Added field
  })

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)

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

  // --- 1. GOOGLE MAPS INIT ---
  useEffect(() => {
    if (!isManualEntry && searchInputRef.current && step === 1) {
      const el = searchInputRef.current as any;
      el.fields = ['displayName', 'formattedAddress', 'location', 'id', 'addressComponents'];

      const onPlaceSelect = async (event: any) => {
        const place = event.detail.getPlace();
        if (place) {
          const name = place.displayName || place.name || '';
          const address = place.formattedAddress || place.formatted_address || '';
          const placeId = place.id || place.place_id || '';
          let lat = 0, lng = 0;

          if (place.location) {
            lat = place.location.lat();
            lng = place.location.lng();
          }

          setFormData(prev => ({ ...prev, businessName: name, address: address, placeId: placeId, latitude: lat, longitude: lng }));
          setTimeout(() => setStep(2), 500);
        }
      };

      el.addEventListener('gmp-places-select', onPlaceSelect);
      return () => { el.removeEventListener('gmp-places-select', onPlaceSelect); };
    }
  }, [step, isManualEntry]);

  // --- ACTIONS ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setFormData({ ...formData, phone: value })
  }

  const toggleManualMode = () => { setIsManualEntry(true); setFormData(prev => ({ ...prev, placeId: 'manual' })); }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let fullAddress = formData.address
    if (formData.city && !fullAddress.toLowerCase().includes(formData.city.toLowerCase())) fullAddress += `, ${formData.city}`
    if (formData.postcode && !fullAddress.toLowerCase().includes(formData.postcode.toLowerCase())) fullAddress += `, ${formData.postcode}`

    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setFormData(prev => ({ ...prev, address: results[0].formatted_address, latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng() }))
        } else {
          setFormData(prev => ({ ...prev, address: fullAddress }))
        }
        setStep(2)
      })
    } else {
      setFormData(prev => ({ ...prev, address: fullAddress }))
      setStep(2)
    }
  }

  const handleDetailsSubmit = (e: React.FormEvent) => { e.preventDefault(); setStep(3); }

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/business/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, name: formData.businessName }) })
      if (res.ok) { setOtpSent(true); setStep(4); } else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch (err) { alert("Network error"); } finally { setLoading(false); }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const code = otp.join('')
    try {
      const res = await fetch('/api/auth/business/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, code }) })
      if (res.ok) { setStep(5); } else { alert("Invalid code"); }
    } catch (err) { alert("Error"); } finally { setLoading(false); }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/business/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      const data = await res.json()
      if (res.ok) { router.push('/business/login?success=account_created'); } else { alert(data.error); }
    } catch (err) { alert("Failed"); } finally { setLoading(false); }
  }

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])
    if (element.nextSibling && element.value) (element.nextSibling as HTMLInputElement).focus()
  }

  // --- STYLES ---
  const inputStyle = "w-full bg-white border border-gray-200 rounded-xl px-5 py-4 font-bold text-[#111111] focus:outline-none focus:border-[#D90020] focus:ring-1 focus:ring-[#D90020] transition placeholder-gray-400"
  const labelStyle = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
  const btnPrimary = "w-full bg-[#D90020] hover:bg-[#b0001a] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center font-sans text-slate-900 selection:bg-[#D90020] selection:text-white pb-20 pt-10 px-4">

      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&loading=async`}
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />

      {/* HEADER LOGO */}
      <Link href="/" className="mb-8">
        <Image src="/images/win-logo.svg" alt="WIN Logo" width={60} height={60} className="" />
      </Link>

      {/* PROGRESS BAR */}
      <div className="w-full max-w-xl mb-12">
        <div className="flex items-center justify-between relative">
          <div className={`absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full`}></div>
          <div className={`absolute top-1/2 left-0 h-1 bg-[#D90020] -z-10 rounded-full transition-all duration-500`} style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${step >= s ? 'bg-[#D90020] border-[#D90020] text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
              {step > s ? <i className="fa-solid fa-check"></i> : s}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-400 mt-2 px-1">
          <span>Find</span>
          <span>Details</span>
          <span>Email</span>
          <span>Verify</span>
          <span>Done</span>
        </div>
      </div>

      {/* CARD CONTAINER */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-8 md:p-12 relative border border-gray-100"
      >

        {/* STEP 1: FIND STORE */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-black text-[#111111] mb-2">Find your business</h1>
            <p className="text-gray-500 mb-8">Search for your store to auto-fill your address.</p>

            {!isManualEntry ? (
              <div className="space-y-6">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-4 text-gray-400 z-10"></i>
                  {/* @ts-ignore */}
                  <gmp-place-autocomplete ref={searchInputRef} placeholder="Search business name..." types={['establishment', 'geocode']}>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 font-bold focus:outline-none focus:border-[#D90020] focus:ring-1 focus:ring-[#D90020] transition placeholder-gray-400 outline-none text-[#111111]" />
                  </gmp-place-autocomplete>
                </div>
                <button onClick={toggleManualMode} className="text-sm font-bold text-[#D90020] hover:underline block mx-auto transition">
                  I can't find my store on the map
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-5">
                <InputGroup label="Business Name" placeholder="e.g. Joe's Cafe" value={formData.businessName} onChange={(v: any) => setFormData({ ...formData, businessName: v })} required />
                <InputGroup label="Street Address" placeholder="e.g. 123 High Street" value={formData.address} onChange={(v: any) => setFormData({ ...formData, address: v })} required />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="City" placeholder="London" value={formData.city} onChange={(v: any) => setFormData({ ...formData, city: v })} required />
                  <InputGroup label="Postcode" placeholder="SW1" value={formData.postcode} onChange={(v: any) => setFormData({ ...formData, postcode: v })} required />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsManualEntry(false)} className="px-6 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Back</button>
                  <button type="submit" className={btnPrimary}>Continue</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
          <form onSubmit={handleDetailsSubmit} className="space-y-6">
            <h1 className="text-3xl font-black text-[#111111] mb-2">Review details</h1>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100 text-[#D90020]">📍</div>
              <div className="flex-1">
                <div className="font-black text-lg text-[#111111]">{formData.businessName || "New Business"}</div>
                <div className="text-gray-500 text-sm">{formData.address || "Address pending"}</div>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-[#D90020] hover:underline">Edit</button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Your Name</label>
                <input required type="text" className={inputStyle} value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
              </div>
              <div>
                <label className={labelStyle}>Phone</label>
                <input required type="tel" className={inputStyle} value={formData.phone} onChange={handlePhoneChange} placeholder="e.g. 50123456" maxLength={15} />
              </div>
            </div>

            {/* NEW FIELDS */}
            <div>
              <label className={labelStyle}>Category</label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`${inputStyle} appearance-none cursor-pointer`}
                >
                  <option value="Food & Drink">🍽️ Food & Drink</option>
                  <option value="Retail">🛍️ Retail & Shopping</option>
                  <option value="Services">💇‍♀️ Services (Salon, Gym, etc)</option>
                  <option value="Entertainment">🎉 Entertainment</option>
                  <option value="Technology">💻 Technology</option>
                  <option value="Other">✨ Other</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Google Maps Link <span className="text-gray-300 font-normal normal-case">(Optional but recommended)</span></label>
              <input
                type="text"
                className={inputStyle}
                placeholder="https://maps.app.goo.gl/..."
                value={formData.googleMapsUrl || ''}
                onChange={e => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-2">Paste the "Share" link from Google Maps here.</p>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#D90020] focus:ring-[#D90020]"
              />
              <label htmlFor="terms" className="text-sm text-gray-500 font-bold leading-tight">
                I agree to the <Link href="/terms" className="text-[#D90020] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#D90020] hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit" className={btnPrimary}>Continue</button>
            <button type="button" onClick={() => setStep(1)} className="w-full py-2 font-bold text-gray-400 text-sm hover:text-black">Back</button>
          </form>
        )}

        {/* STEP 3: EMAIL */}
        {step === 3 && (
          <form onSubmit={sendOtp} className="space-y-6">
            <h1 className="text-3xl font-black text-[#111111] mb-2">Work Email</h1>
            <p className="text-gray-500 mb-6">We'll send a verification code to this address.</p>
            <input required type="email" className={inputStyle} placeholder="name@business.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <button type="submit" disabled={loading} className={btnPrimary}>{loading ? "Sending..." : "Send Verification Code"}</button>
            <button type="button" onClick={() => setStep(2)} className="w-full py-2 font-bold text-gray-400 text-sm hover:text-black">Back</button>
          </form>
        )}

        {/* STEP 4: VERIFY */}
        {step === 4 && (
          <div className="text-center">
            <h1 className="text-3xl font-black text-[#111111] mb-2">Verify Email</h1>
            <p className="text-gray-500 mb-8">Enter code sent to <b>{formData.email}</b></p>

            <form onSubmit={handleVerifyOtp}>
              <div className="flex justify-center gap-3 mb-8">
                {otp.map((d, i) => (
                  <input key={i} type="text" maxLength={1} className="w-12 h-14 border-2 border-gray-200 rounded-xl text-center text-2xl font-black focus:border-[#D90020] focus:ring-[#D90020] outline-none transition" value={d} onChange={e => handleOtpChange(e.target, i)} />
                ))}
              </div>
              <button type="submit" disabled={loading} className={btnPrimary}>{loading ? "Verifying..." : "Verify Code"}</button>
              <button type="button" onClick={() => setStep(3)} className="w-full mt-4 py-2 font-bold text-gray-400 text-sm hover:text-black">Change Email</button>
            </form>
          </div>
        )}

        {/* STEP 5: PASSWORD */}
        {step === 5 && (
          <form onSubmit={handleCreateAccount} className="space-y-6">
            <h1 className="text-3xl font-black text-[#111111] mb-2">Secure your account</h1>
            <p className="text-gray-500 mb-6">Create a strong password to access your dashboard.</p>
            <input required type="password" className={inputStyle} placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <button type="submit" disabled={loading} className={btnPrimary}>{loading ? "Creating Account..." : "Complete Signup"}</button>
          </form>
        )}

      </motion.div>

      <div className="mt-8 text-sm font-bold text-gray-400">
        Already have an account? <Link href="/business/login" className="text-[#D90020] hover:underline">Log in</Link>
      </div>

    </div>
  )
}

const InputGroup = ({ label, placeholder, value, onChange, required }: any) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
    <input required={required} type="text" placeholder={placeholder} className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 font-bold text-[#111111] focus:outline-none focus:border-[#D90020] focus:ring-1 focus:ring-[#D90020] transition placeholder-gray-400" value={value} onChange={e => onChange && onChange(e.target.value)} />
  </div>
)