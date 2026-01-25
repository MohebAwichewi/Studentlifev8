'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image' // ✅ Added Image import
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import QRCode from "react-qr-code"

// 1. DYNAMIC IMPORT: Map Component
const GoogleDealMap = dynamic(() => import('@/components/GoogleDealMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center font-bold text-slate-400">
       Loading Map...
    </div>
  )
})

export default function StudentHome() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  
  // TABS & VIEW STATE
  const [viewMode, setViewMode] = useState<'ALL' | 'NEARBY' | 'MAP' | 'SAVED'>('')
  const [activeCategory, setActiveCategory] = useState('All')
  
  const [deals, setDeals] = useState<any[]>([])
  const [savedDealIds, setSavedDealIds] = useState<number[]>([]) 
  const [nearbyDeals, setNearbyDeals] = useState<any[]>([])
  const [mapPins, setMapPins] = useState<any[]>([]) 

  const [locationStatus, setLocationStatus] = useState('') 
  const [isLocating, setIsLocating] = useState(false)
  
  // User Coords
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  
  // Modal State
  const [showIdModal, setShowIdModal] = useState(false)
  const [showIdBack, setShowIdBack] = useState(false)

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    async function loadData() {
      const email = localStorage.getItem('studentEmail')
      if (!email) { router.push('/student/login'); return }

      try {
        const dealsRes = await fetch('/api/public/deals', { cache: 'no-store' })
        const dealsData = await dealsRes.json()
        if (dealsData.success) {
            setDeals(dealsData.deals)
        }

        const profileRes = await fetch('/api/auth/student/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        if (profileRes.ok) {
          const data = await profileRes.json()
          setStudent(data.student)
          setSavedDealIds(data.savedDealIds || [])
        } else {
          router.push('/student/login')
        }
      } catch (e) {
        console.error("Failed to load dashboard", e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  // --- 2. SAVE TOGGLE ---
  const toggleSave = async (e: React.MouseEvent, dealId: number) => {
    e.preventDefault(); e.stopPropagation()
    const isCurrentlySaved = savedDealIds.includes(dealId)
    if (isCurrentlySaved) {
        setSavedDealIds(prev => prev.filter(id => id !== dealId))
    } else {
        setSavedDealIds(prev => [...prev, dealId])
    }

    try {
        await fetch('/api/auth/student/save-deal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: student.email, dealId })
        })
    } catch (err) { console.error("Save failed") }
  }

  // --- 3. FILTERING ---
  const getTargetList = () => {
    if (viewMode === 'NEARBY') return nearbyDeals
    if (viewMode === 'SAVED') return deals.filter(d => savedDealIds.includes(d.id))
    return deals
  }

  const filteredDeals = getTargetList().filter(d => activeCategory === 'All' || d.category === activeCategory)
  const categories = []

  // --- 4. MAP & LOCATION ---
  const handleLoadMap = () => { 
    setViewMode('MAP')
    if (deals.length > 0) {
        const pins = deals.map(d => ({
            id: d.id,
            lat: d.business?.latitude || 51.505, 
            lng: d.business?.longitude || -0.09,
            title: d.title,
            businessName: d.business?.businessName
        }))
        setMapPins(pins)
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.warn("Location access denied")
        )
    }
  }

  const handleFindNearby = async () => { 
    setViewMode('NEARBY')
    setIsLocating(true)
    setNearbyDeals([])
    if (navigator.geolocation) {
      setLocationStatus("Locating...")
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchNearbyDeals(pos.coords.latitude, pos.coords.longitude),
        () => setIsLocating(false) 
      )
    } else {
      setIsLocating(false)
    }
  }

  const fetchNearbyDeals = async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/auth/student/nearby-deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      })
      const data = await res.json()
      if (data.success) {
         setNearbyDeals(data.deals)
         setLocationStatus(`Found ${data.deals.length} deals nearby`)
      }
    } catch(e) { } finally { setIsLocating(false) }
  }

  const handleSignOut = () => { localStorage.clear(); router.push('/') }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-slate-900"></i></div>

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-black selection:text-white pb-20">
      
      {/* ==================== 1. NAVBAR ==================== */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 h-[70px] transition-all">
        <div className="max-w-[1440px] mx-auto px-4 h-full flex items-center justify-between gap-4">
          
          {/* ✅ Logo Updated: Black text + Red Box */}
          <Link href="/student/home" className="flex items-center gap-1 group">
             <span className="text-2xl font-black tracking-tighter text-slate-900">Student</span>
             <span className="bg-[#FF3B30] text-white px-1.5 py-0.5 rounded text-lg font-black tracking-wide transform -rotate-2 group-hover:rotate-0 transition-transform">.LIFE</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl relative">
             <input 
                type="text" 
                placeholder="Search for brands, categories..." 
                className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-slate-300 rounded-lg py-2.5 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-500 outline-none transition-all" 
             />
             <i className="fa-solid fa-magnifying-glass absolute left-4 top-3 text-slate-400"></i>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowIdModal(true)}
                className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-black transition bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"
             >
                <i className="fa-regular fa-id-card"></i>
                <span>My ID</span>
             </button>
             
             <button onClick={handleSignOut} className="text-sm font-bold text-slate-400 hover:text-red-500 transition">Sign Out</button>
             
             <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {student?.fullName?.charAt(0) || 'S'}
             </div>
          </div>
        </div>
      </nav>

      {/* ==================== 2. WELCOME HERO (Updated with Background Image) ==================== */}
      <div className="relative bg-black h-[300px] flex flex-col justify-center px-4 overflow-hidden border-b border-slate-100">
         
         {/* ✅ Added Hero Background Image */}
         <div className="absolute inset-0 z-0">
            <Image 
                src="/hero-bg.jpg" 
                alt="Welcome Background" 
                fill 
                className="object-cover opacity-60" 
                priority
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
         </div>

         <div className="max-w-[1440px] mx-auto w-full relative z-10">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-white drop-shadow-md">
                Welcome back, {student?.fullName?.split(' ')[0]}
            </h1>
            <p className="text-white/90 font-medium text-lg max-w-xl drop-shadow-md">
                Ready to save? Here are the top exclusives for you today.
            </p>
         </div>
      </div>

      {/* ==================== 3. STICKY FILTER BAR ==================== */}
      <div className="sticky top-[70px] z-40 bg-white border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
         <div className="max-w-[1440px] mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* View Modes */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start">
               <button onClick={() => setViewMode('')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${viewMode === '' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Current Offers</button>
               <button onClick={() => setViewMode('SAVED')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 ${viewMode === 'SAVED' ? 'bg-white text-[#FF3B30] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Saved</button>
               <button onClick={handleFindNearby} className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 ${viewMode === 'NEARBY' ? 'bg-white text-[#5856D6] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Nearby</button>
               <button onClick={handleLoadMap} className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 ${viewMode === 'MAP' ? 'bg-white text-[#5856D6] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Map</button>
            </div>

            {/* Categories */}
            {viewMode !== 'MAP' && (
              <div className="flex gap-6 overflow-x-auto no-scrollbar items-center">
                 {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)} 
                      className={`text-sm font-bold whitespace-nowrap transition-all ${
                        activeCategory === cat 
                        ? 'text-black border-b-2 border-black pb-0.5' 
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                 ))}
              </div>
            )}
         </div>
      </div>

      {/* ==================== 4. MAIN CONTENT ==================== */}
      <main className="max-w-[1440px] mx-auto px-4 py-10 min-h-[60vh]">
         
         {/* MAP VIEW */}
         {viewMode === 'MAP' && (
            <div className="h-[650px] w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
               <GoogleDealMap pins={mapPins} userLocation={userLocation} />
            </div>
         )}

         {/* NEARBY LOADING */}
         {viewMode === 'NEARBY' && isLocating && (
             <div className="text-center py-32">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-black mb-4"></i>
                <p className="font-bold text-slate-500">{locationStatus}</p>
             </div>
         )}

         {/* DEAL GRID */}
         {viewMode !== 'MAP' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
               {filteredDeals.map((deal) => (
                  <Link href={`/student/deal/${deal.id}`} key={deal.id} className="group block h-full">
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative h-full flex flex-col">
                          
                          {/* Image & Overlay */}
                          <div className="aspect-[4/3] bg-slate-50 relative p-8 flex items-center justify-center overflow-hidden">
                              {deal.image ? (
                                 <img src={deal.image} alt={deal.title} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">{deal.category?.includes('Food') ? '🍔' : '🛍️'}</div>
                              )}
                              
                              {/* Dark Overlay on Hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-0"></div>

                              {/* Floating Logo */}
                              <div className="absolute bottom-3 left-3 w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center z-10 p-1">
                                 {deal.business?.businessName ? (
                                     <span className="font-bold text-xs text-black">{deal.business.businessName.charAt(0)}</span>
                                 ) : <i className="fa-solid fa-shop"></i>}
                              </div>

                              {/* Save Button */}
                              <button 
                                onClick={(e) => toggleSave(e, deal.id)}
                                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition shadow-sm"
                              >
                                {savedDealIds.includes(deal.id) ? (
                                    <i className="fa-solid fa-heart text-[#FF3B30] text-sm"></i>
                                ) : (
                                    <i className="fa-regular fa-heart text-slate-400 hover:text-slate-900 text-sm"></i>
                                )}
                              </button>
                          </div>

                          {/* Content */}
                          <div className="p-4 pt-5 flex flex-col flex-1">
                              <h4 className="font-black text-slate-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-black">
                                  {deal.discountValue || "Student Offer"}
                              </h4>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                                  {deal.business?.businessName}
                              </p>
                              
                              <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50">
                                  <span className="text-[10px] font-bold text-slate-400">In-store & Online</span>
                                  {deal.distance && (
                                      <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                          <i className="fa-solid fa-location-dot"></i> {deal.distance}
                                      </span>
                                  )}
                              </div>
                          </div>
                      </div>
                  </Link>
               ))}
            </div>
         )}

         {/* Empty State */}
         {viewMode !== 'MAP' && !isLocating && filteredDeals.length === 0 && (
            <div className="text-center py-32 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <div className="text-6xl mb-4">😔</div>
               <h3 className="text-xl font-black text-slate-900">No deals found here.</h3>
               <p className="text-slate-500 mt-2">Try changing category or location.</p>
            </div>
         )}
      </main>

      {/* ==================== 5. ID CARD MODAL ==================== */}
      {showIdModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="relative w-full max-w-sm">
              <button 
                onClick={() => setShowIdModal(false)}
                className="absolute -top-12 right-0 text-white font-bold hover:text-slate-300 transition flex items-center gap-2"
              >
                Close <i className="fa-solid fa-xmark text-xl"></i>
              </button>
              
              <div className="perspective-1000 w-full aspect-[1.586/1] cursor-pointer group" onClick={() => setShowIdBack(!showIdBack)}>
                 <div className={`w-full h-full transition-transform duration-700 transform-style-3d relative ${showIdBack ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 bg-black rounded-2xl p-6 text-white backface-hidden shadow-2xl flex flex-col justify-between border border-white/10 overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[#5856D6] blur-[60px] opacity-60"></div>
                       <div className="flex justify-between relative z-10">
                          {/* ID CARD LOGO */}
                          <div className="flex items-center gap-1">
                             <span className="text-lg font-black tracking-tighter">Student</span>
                             <span className="bg-[#FF3B30] text-white px-1 rounded text-sm font-black transform -rotate-2">.LIFE</span>
                          </div>
                          <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold border border-white/20">LIVE ID</span>
                       </div>
                       <div className="text-center relative z-10">
                          <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-black border-4 border-black shadow-lg">
                             {student?.fullName?.charAt(0)}
                          </div>
                          <h2 className="text-xl font-black">{student?.fullName}</h2>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{student?.university}</p>
                       </div>
                       <div className="flex justify-between items-end relative z-10">
                          <div className="text-[10px] font-bold text-slate-500">VERIFIED UNTIL 2026</div>
                          <div className="flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                              <span className="text-[10px] font-bold text-green-500">Active</span>
                          </div>
                       </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 bg-white rounded-2xl p-6 backface-hidden rotate-y-180 flex flex-col items-center justify-center shadow-2xl border border-slate-200">
                        {student?.id && (
                          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                              <QRCode value={JSON.stringify({ id: student.id, valid: true })} size={120} />
                          </div>
                        )}
                        <p className="text-xs font-bold text-slate-900 mt-4 bg-slate-100 px-3 py-1 rounded-full">{student?.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">ID: {student?.id?.slice(0, 8)}</p>
                    </div>
                 </div>
              </div>
              <p className="text-center text-white/50 text-xs font-bold mt-6 animate-pulse uppercase tracking-widest">Tap card to flip</p>
           </div>
        </div>
      )}

    </div>
  )
}