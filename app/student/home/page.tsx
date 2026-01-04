'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import QRCode from "react-qr-code"

// 1. DYNAMIC IMPORT: Loads Google Maps only on the client side
const GoogleDealMap = dynamic(() => import('../../components/GoogleDealMap'), { 
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
  
  // TABS: 'ALL', 'NEARBY', 'MAP', 'SAVED'
  const [viewMode, setViewMode] = useState<'ALL' | 'NEARBY' | 'MAP' | 'SAVED'>('ALL')
  const [activeCategory, setActiveCategory] = useState('All')
  
  const [deals, setDeals] = useState<any[]>([])
  const [savedDealIds, setSavedDealIds] = useState<number[]>([]) // <--- NEW: Track Saved IDs
  const [nearbyDeals, setNearbyDeals] = useState<any[]>([])
  const [mapPins, setMapPins] = useState<any[]>([]) 

  const [locationStatus, setLocationStatus] = useState('') 
  const [isLocating, setIsLocating] = useState(false)
  
  // Modal State for ID Card
  const [showIdModal, setShowIdModal] = useState(false)
  const [showIdBack, setShowIdBack] = useState(false)

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    async function loadData() {
      const email = localStorage.getItem('studentEmail')
      if (!email) { router.push('/student/login'); return }

      try {
        const res = await fetch('/api/auth/student/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        if (res.ok) {
          const data = await res.json()
          setStudent(data.student)
          setDeals(data.deals || [])
          setSavedDealIds(data.savedDealIds || []) // <--- Load Saved State
        } else {
          router.push('/student/login')
        }
      } catch (e) {
        console.error("Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  // --- 2. SAVE TOGGLE LOGIC (Real API Call) ---
  const toggleSave = async (e: React.MouseEvent, dealId: number) => {
    e.preventDefault() // Stop link click
    e.stopPropagation()

    // Optimistic UI Update (Instant change)
    const isCurrentlySaved = savedDealIds.includes(dealId)
    if (isCurrentlySaved) {
        setSavedDealIds(prev => prev.filter(id => id !== dealId))
    } else {
        setSavedDealIds(prev => [...prev, dealId])
    }

    // Call Real API
    try {
        await fetch('/api/auth/student/save-deal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: student.email, dealId })
        })
    } catch (err) {
        console.error("Save failed")
    }
  }

  // --- 3. FILTERING LOGIC ---
  const getTargetList = () => {
    if (viewMode === 'NEARBY') return nearbyDeals
    if (viewMode === 'SAVED') return deals.filter(d => savedDealIds.includes(d.id)) // <--- Filter Saved
    return deals
  }

  const filteredDeals = getTargetList().filter(d => activeCategory === 'All' || d.category === activeCategory)
  const categories = ['All', 'Food', 'Tech', 'Fashion', 'Health', 'Travel']

  // ... (Map & Location Logic kept same as before) ...
  const handleLoadMap = async () => { 
    setViewMode('MAP')
    if (mapPins.length > 0) return 
    try {
      const res = await fetch('/api/auth/student/map-deals')
      const data = await res.json()
      if (data.success) setMapPins(data.pins)
    } catch (e) { console.error(e) }
  }

  const handleFindNearby = async () => { 
    setViewMode('NEARBY')
    setIsLocating(true)
    setNearbyDeals([])
    if (navigator.geolocation) {
      setLocationStatus("Requesting GPS...")
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
    } catch(e) { /* error */ } finally { setIsLocating(false) }
  }

  const handleSignOut = () => { localStorage.clear(); router.push('/') }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#5856D6]"></i></div>

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- 1. WEB HEADER --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 h-20 flex items-center px-6 lg:px-12 justify-between">
         <div className="flex items-center gap-1">
            <span className="text-2xl font-black tracking-tighter text-slate-900">Student</span>
            <span className="bg-[#FF3B30] text-white px-2 py-0.5 rounded text-sm font-black tracking-wide">.LIFE</span>
         </div>

         {/* Desktop Search Bar (Visual Only for now) */}
         <div className="hidden md:flex flex-1 max-w-xl mx-10 relative">
            <input type="text" placeholder="Search brands, categories..." className="w-full bg-slate-100 border-none rounded-full py-3 px-12 text-sm font-bold focus:ring-2 focus:ring-[#5856D6] outline-none" />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-400"></i>
         </div>

         <div className="flex items-center gap-6">
            {/* ID CARD BUTTON */}
            <button 
              onClick={() => setShowIdModal(true)}
              className="hidden md:flex items-center gap-2 font-bold text-slate-600 hover:text-[#5856D6] transition"
            >
              <i className="fa-regular fa-id-card text-lg"></i>
              <span>My ID</span>
            </button>
            
            <button onClick={handleSignOut} className="text-sm font-bold text-slate-400 hover:text-red-500">Sign Out</button>
            
            {/* User Avatar */}
            <div className="w-10 h-10 bg-[#5856D6] rounded-full flex items-center justify-center text-white font-black text-lg">
                {student?.fullName?.charAt(0) || 'S'}
            </div>
         </div>
      </nav>

      {/* --- 2. HERO BANNER (Student Beans Style) --- */}
      <div className="bg-gradient-to-r from-[#5856D6] to-[#8E8CFF] text-white py-12 px-6 lg:px-12 relative overflow-hidden">
         <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-2">Welcome back, {student?.fullName?.split(' ')[0]}!</h1>
            <p className="text-lg text-white/80 font-medium max-w-2xl">Discover exclusive student discounts at your favorite brands today.</p>
         </div>
         {/* Background Decoration */}
         <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-20"></div>
      </div>

      {/* --- 3. CONTROLS BAR --- */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 px-6 lg:px-12 shadow-sm">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* View Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
               <button onClick={() => setViewMode('ALL')} className={`px-5 py-2 rounded-md text-sm font-bold transition ${viewMode === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Trending</button>
               <button onClick={() => setViewMode('SAVED')} className={`px-5 py-2 rounded-md text-sm font-bold transition flex items-center gap-2 ${viewMode === 'SAVED' ? 'bg-white text-[#FF3B30] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                 <i className="fa-solid fa-heart text-xs"></i> Saved
               </button>
               <button onClick={handleFindNearby} className={`px-5 py-2 rounded-md text-sm font-bold transition flex items-center gap-2 ${viewMode === 'NEARBY' ? 'bg-white text-[#5856D6] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                 <i className="fa-solid fa-location-arrow text-xs"></i> Nearby
               </button>
               <button onClick={handleLoadMap} className={`px-5 py-2 rounded-md text-sm font-bold transition flex items-center gap-2 ${viewMode === 'MAP' ? 'bg-white text-[#5856D6] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                 <i className="fa-solid fa-map text-xs"></i> Map
               </button>
            </div>

            {/* Category Pills */}
            {viewMode !== 'MAP' && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                 {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)} 
                      className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition ${
                        activeCategory === cat 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                 ))}
              </div>
            )}
         </div>
      </div>

      {/* --- 4. MAIN CONTENT GRID --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 min-h-[60vh]">
         
         {/* MAP VIEW */}
         {viewMode === 'MAP' && (
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
               <GoogleDealMap pins={mapPins} />
            </div>
         )}

         {/* NEARBY LOADING */}
         {viewMode === 'NEARBY' && isLocating && (
             <div className="text-center py-20">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#5856D6] mb-4"></i>
                <p className="font-bold text-slate-500">{locationStatus}</p>
             </div>
         )}

         {/* DEAL GRID (Student Beans Style) */}
         {viewMode !== 'MAP' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {filteredDeals.map((deal) => (
                  <Link href={`/student/deal/${deal.id}`} key={deal.id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-[#5856D6]/30 transition-all duration-300 relative">
                     
                     {/* SAVE BUTTON (Heart) */}
                     <button 
                        onClick={(e) => toggleSave(e, deal.id)}
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition"
                     >
                        {savedDealIds.includes(deal.id) ? (
                            <i className="fa-solid fa-heart text-[#FF3B30] text-lg"></i>
                        ) : (
                            <i className="fa-regular fa-heart text-slate-400 text-lg"></i>
                        )}
                     </button>

                     {/* Image Area */}
                     <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                        {deal.image ? (
                           <img src={deal.image} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                              {deal.category?.includes('Food') ? '🍔' : '🛍️'}
                           </div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-lg text-xs font-black text-[#5856D6] shadow-sm">
                           {deal.discountValue || '20% OFF'}
                        </div>
                     </div>

                     {/* Text Area */}
                     <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
                              {deal.business?.businessName?.charAt(0)}
                           </div>
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{deal.business?.businessName || 'Partner'}</span>
                        </div>
                        
                        <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-[#5856D6] transition-colors line-clamp-2">
                           {deal.title}
                        </h3>
                        
                        {deal.distance && (
                           <div className="mt-auto pt-3 border-t border-slate-50">
                              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                 <i className="fa-solid fa-location-dot"></i> {deal.distance} away
                              </span>
                           </div>
                        )}
                     </div>
                  </Link>
               ))}
            </div>
         )}

         {/* Empty State */}
         {viewMode !== 'MAP' && !isLocating && filteredDeals.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
               <div className="text-6xl mb-4">😔</div>
               <h3 className="text-xl font-black text-slate-900">No deals found here.</h3>
               <p className="text-slate-500">Try changing category or location.</p>
            </div>
         )}
      </main>

      {/* --- 5. ID CARD MODAL (Hidden by default) --- */}
      {showIdModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="relative w-full max-w-md">
              <button 
                onClick={() => setShowIdModal(false)}
                className="absolute -top-12 right-0 text-white font-bold hover:text-slate-300 transition flex items-center gap-2"
              >
                Close <i className="fa-solid fa-xmark text-xl"></i>
              </button>
              
              <div className="perspective-1000 w-full aspect-[1.586/1] cursor-pointer group" onClick={() => setShowIdBack(!showIdBack)}>
                 <div className={`w-full h-full transition-transform duration-700 transform-style-3d relative ${showIdBack ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 bg-black rounded-3xl p-8 text-white backface-hidden shadow-2xl flex flex-col justify-between border border-white/10">
                       <div className="absolute top-0 right-0 w-40 h-40 bg-[#5856D6] blur-[80px] opacity-60"></div>
                       <div className="flex justify-between relative z-10">
                          <span className="text-xl font-black tracking-tighter">Student.LIFE</span>
                          <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-white/20">LIVE ID</span>
                       </div>
                       <div className="text-center relative z-10">
                          <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black border-4 border-black shadow-lg">
                             {student?.fullName?.charAt(0)}
                          </div>
                          <h2 className="text-2xl font-black">{student?.fullName}</h2>
                          <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">{student?.university}</p>
                       </div>
                       <div className="flex justify-between items-end relative z-10">
                          <div className="text-xs font-bold text-slate-500">VERIFIED UNTIL 2026</div>
                          <i className="fa-solid fa-arrow-rotate-right text-slate-600 animate-pulse"></i>
                       </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 bg-white rounded-3xl p-8 backface-hidden rotate-y-180 flex flex-col items-center justify-center shadow-2xl">
                        {student?.id && (
                          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                              <QRCode value={JSON.stringify({ id: student.id, valid: true })} size={140} />
                          </div>
                        )}
                        <p className="text-sm font-bold text-slate-900 mt-4 bg-slate-100 px-4 py-1 rounded-full">{student?.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">ID: {student?.id?.slice(0, 8)}</p>
                    </div>
                 </div>
              </div>
              <p className="text-center text-white/50 text-sm font-bold mt-6 animate-pulse">Tap card to flip</p>
           </div>
        </div>
      )}

    </div>
  )
}