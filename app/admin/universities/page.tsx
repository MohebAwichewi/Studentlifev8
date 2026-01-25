'use client'

import React, { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

export default function UniversitiesPage() {
  const router = useRouter()
  
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', city: 'Tunis', lat: '', lng: '' })
  const [loading, setLoading] = useState(false)
  
  // ✅ REAL DATABASE DATA STATE
  const [universities, setUniversities] = useState<any[]>([])

  const searchInputRef = useRef<HTMLInputElement>(null)

  // --- 1. FETCH REAL DATA ON LOAD ---
  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      // ✅ Fetching from your REAL backend route
      const res = await fetch('/api/auth/admin/universeties/list', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setUniversities(data) // Save real DB data to state
      }
    } catch (error) {
      console.error("Failed to load list from database")
    }
  }

  // --- 2. GOOGLE MAPS SETUP (✅ UPDATED WITH FIX) ---
  const initAutocomplete = () => {
    if (!window.google || !searchInputRef.current) return
    
    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      types: ['university', 'school'],
      fields: ['name', 'geometry', 'formatted_address']
    })

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        
        // ✅ FIX: Added check for 'place.geometry' and 'place.geometry.location'
        if (place.name && place.geometry && place.geometry.location) {
          setForm(prev => ({
            ...prev,
            name: place.name || '',
            // Now TypeScript knows geometry exists because of the 'if' above
            lat: place.geometry!.location!.lat().toString(),
            lng: place.geometry!.location!.lng().toString()
          }))
        }
    })
  }

  // --- 3. CREATE UNIVERSITY ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // ✅ Sending to your REAL backend route
      const res = await fetch('/api/auth/admin/universeties/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (res.ok) {
        setIsOpen(false)
        setForm({ name: '', city: 'Tunis', lat: '', lng: '' })
        
        // Show Success Popup
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2500)
        
        // ✅ REFRESH LIST INSTANTLY (Show new data immediately)
        fetchUniversities()
        
      } else {
        const errorData = await res.json()
        alert(`Failed: ${errorData.error}`) 
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 min-h-screen bg-[#F8F9FC]">
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`} 
        strategy="lazyOnload"
        onLoad={() => console.log('Maps Loaded')}
      />

      {/* CUSTOM SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 transform scale-100 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 text-3xl mb-2">
                 <i className="fa-solid fa-check"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Success!</h3>
              <p className="text-slate-500 font-medium">University added to database.</p>
           </div>
        </div>
      )}

      {/* HEADER & NAV */}
      <button onClick={() => router.push('/admin/dashboard')} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition">
        <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-10">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Universities</h1>
           {/* Real count from database */}
           <p className="text-slate-500 mt-1">{universities.length} institutions in database</p>
        </div>
        <button onClick={() => { setIsOpen(true); setTimeout(initAutocomplete, 500); }} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition">
          + Add University
        </button>
      </div>

      {/* ✅ REAL DATA LIST TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {universities.length === 0 ? (
           <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl">🏛️</div>
              <p className="text-slate-400 font-medium">Database is empty. Add a university above.</p>
           </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Region</th>
                <th className="px-8 py-5">Coordinates</th>
                <th className="px-8 py-5 text-right">Added Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {universities.map((uni) => (
                <tr key={uni.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-900">{uni.name}</td>
                  <td className="px-8 py-5 text-sm text-slate-500">{uni.region || 'Tunis'}</td>
                  <td className="px-8 py-5 text-xs font-mono text-slate-400">
                      {/* Safe check in case lat/lng are missing */}
                      {uni.latitude ? uni.latitude.toFixed(4) : 'N/A'}, {uni.longitude ? uni.longitude.toFixed(4) : 'N/A'}
                  </td>
                  <td className="px-8 py-5 text-right text-sm text-slate-400">
                      {uni.createdAt ? new Date(uni.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL FORM */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 font-bold transition">✕</button>
            <h3 className="text-xl font-bold mb-6">Add University</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Search Google Maps</label>
                <input ref={searchInputRef} type="text" placeholder="Type name..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 outline-none" onFocus={initAutocomplete} />
              </div>
              
              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">University Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 bg-slate-100 rounded-xl font-bold text-slate-900" readOnly />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Latitude</label><input value={form.lat} readOnly className="w-full p-3 bg-slate-100 rounded-xl text-slate-500 font-mono text-sm" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Longitude</label><input value={form.lng} readOnly className="w-full p-3 bg-slate-100 rounded-xl text-slate-500 font-mono text-sm" /></div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 border rounded-xl font-bold hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:shadow-lg transition">{loading ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}