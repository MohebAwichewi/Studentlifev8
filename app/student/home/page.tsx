'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'

// Dynamic Import for Map
const GoogleDealMap = dynamic(() => import('@/components/GoogleDealMap'), {
   ssr: false,
   loading: () => (
      <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400">
         Loading Map...
      </div>
   )
})

export default function StudentHome() {
   const router = useRouter()
   const [loading, setLoading] = useState(true)
   const [student, setStudent] = useState<any>(null)
   const [deals, setDeals] = useState<any[]>([])

   // --- STATE: Discovery ---
   const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null)
   const [selectedDealId, setSelectedDealId] = useState<number | null>(null)
   const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)

   // --- FILTERS ---
   const [activeCategory, setActiveCategory] = useState('All')
   const [categories, setCategories] = useState<string[]>(['All'])

   // --- LOAD DATA ---
   useEffect(() => {
      async function loadData() {
         const email = localStorage.getItem('studentEmail')
         if (!email) { router.push('/student/login'); return }

         try {
            // 1. Fetch User
            const profileRes = await fetch('/api/auth/student/dashboard', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email })
            })
            if (profileRes.ok) {
               const data = await profileRes.json()
               setStudent(data.student)
            } else {
               router.push('/student/login'); return;
            }

            // 2. Fetch All Deals (Unlimited)
            const dealsRes = await fetch('/api/public/deals?take=200', { cache: 'no-store' })
            const dealsData = await dealsRes.json()
            if (dealsData.success) {
               setDeals(dealsData.deals)
            }

            // 3. User Location
            if (navigator.geolocation) {
               navigator.geolocation.getCurrentPosition(
                  (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  (err) => console.warn("Location access denied")
               )
            }

            // 4. Categories
            fetch('/api/auth/admin/categories')
               .then(res => res.json())
               .then(data => {
                  if (Array.isArray(data)) setCategories(['All', ...data.map((c: any) => c.name)])
               })

         } catch (e) {
            console.error("Failed to load discovery", e)
         } finally {
            setLoading(false)
         }
      }
      loadData()
   }, [router])

   // --- FILTER LOGIC ---
   const visibleDeals = useMemo(() => {
      // 1. Category Filter
      let filtered = activeCategory === 'All'
         ? deals
         : deals.filter(d => d.business?.category === activeCategory || d.category === activeCategory);

      // 2. Map Bounds Filter (Search as I move)
      if (mapBounds) {
         filtered = filtered.filter(d => {
            if (!d.business?.latitude || !d.business?.longitude) return false;
            return mapBounds.contains({ lat: d.business.latitude, lng: d.business.longitude });
         })
      }
      return filtered;
   }, [deals, activeCategory, mapBounds])

   const handleDealSelect = (id: number) => {
      setSelectedDealId(id);
      // Scroll to deal in list
      const el = document.getElementById(`deal-card-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
   }

   const handleSignOut = () => { localStorage.clear(); router.push('/') }

   if (loading) return <div className="h-screen w-screen bg-white flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-slate-900"></i></div>

   return (
      <div className="h-screen flex flex-col bg-white overflow-hidden font-sans text-slate-900">

         {/* ==================== 1. NAVBAR (Compact) ==================== */}
         <nav className="h-[60px] flex-none border-b border-slate-200 bg-white z-50 flex items-center justify-between px-4 lg:px-6">
            <Link href="/student/home" className="flex items-center gap-1 group">
               <span className="text-xl font-black tracking-tighter text-slate-900">Student</span>
               <span className="bg-[#FF3B30] text-white px-1 py-0.5 rounded text-sm font-black transform -rotate-2 group-hover:rotate-0 transition-transform">.LIFE</span>
            </Link>

            {/* Category Pills (Desktop) */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar mx-4">
               {categories.slice(0, 6).map(cat => (
                  <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${activeCategory === cat
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                  >
                     {cat}
                  </button>
               ))}
            </div>

            <div className="flex items-center gap-3">
               <div className="hidden md:flex flex-col items-end leading-tight">
                  <span className="text-xs font-bold text-slate-900">{student?.fullName}</span>
                  <span className="text-[10px] text-slate-500">{student?.university}</span>
               </div>
               <button onClick={handleSignOut} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                  <i className="fa-solid fa-arrow-right-from-bracket text-xs text-slate-600"></i>
               </button>
            </div>
         </nav>

         {/* ==================== 2. SPLIT SCREEN CONTENT ==================== */}
         <div className="flex-1 flex overflow-hidden relative">

            {/* --- LEFT PANEL: LIST (35%) --- */}
            <div className="w-full md:w-[400px] lg:w-[450px] flex-none bg-slate-50 border-r border-slate-200 flex flex-col h-full z-10 shadow-xl overflow-hidden">

               {/* Header / Stats */}
               <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center">
                  <h2 className="font-black text-lg text-slate-900">
                     {visibleDeals.length} Wins Found
                  </h2>
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                     <i className="fa-solid fa-location-arrow"></i> Near You
                  </div>
               </div>

               {/* Scrollable List */}
               <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300">
                  {visibleDeals.length === 0 ? (
                     <div className="text-center py-20 text-slate-400">
                        <i className="fa-solid fa-map-location-dot text-4xl mb-3"></i>
                        <p className="font-bold">No wins in this area.</p>
                        <p className="text-xs">Zoom out or move the map.</p>
                     </div>
                  ) : (
                     visibleDeals.map(deal => (
                        <Link
                           key={deal.id}
                           href={`/student/deal/${deal.id}`}
                           id={`deal-card-${deal.id}`}
                           className={`block bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden group ${selectedDealId === deal.id
                              ? 'ring-2 ring-[#FF3B30] border-transparent shadow-md'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                              }`}
                           onMouseEnter={() => setSelectedDealId(deal.id)} // Hover interaction
                        >
                           <div className="flex h-[110px]">
                              {/* Image */}
                              <div className="w-[110px] h-full relative bg-slate-100 flex-none">
                                 {deal.image ? (
                                    <Image src={deal.image} alt={deal.title} fill className="object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-2xl">
                                       {deal.title.charAt(0)}
                                    </div>
                                 )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 p-3 flex flex-col justify-between">
                                 <div>
                                    <h3 className="font-bold text-slate-900 leading-tight line-clamp-2">{deal.title}</h3>
                                    <p className="text-xs text-slate-500 font-bold mt-1 line-clamp-1">{deal.business?.businessName}</p>
                                 </div>
                                 <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                       {deal.category}
                                    </span>
                                    {deal.distance && (
                                       <span className="text-[10px] font-bold text-green-600">
                                          {Math.round(deal.distance)} km
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </Link>
                     ))
                  )}
               </div>
            </div>

            {/* RIGHT PANEL: MAP (Rest) */}
            <div className="flex-1 relative h-full w-full">
               <div className="h-full w-full bg-white">
                  <GoogleDealMap
                     pins={deals.map(d => ({
                        id: d.id,
                        lat: d.business?.latitude,
                        lng: d.business?.longitude,
                        title: d.title,
                        businessName: d.business?.businessName
                     })).filter(p => p.lat && p.lng)}
                     userLocation={userLocation}
                  />
               </div>

               {/* Floating Map Toggle/Filter if needed (Optional) */}
            </div>

         </div>
      </div>
   )
}
