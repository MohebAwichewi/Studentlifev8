'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const GoogleDealMap = dynamic(() => import('../../components/GoogleDealMap'), { 
  ssr: false,
  loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl"></div>
})

export default function BusinessProfile() {
  const { id } = useParams()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<any>(null)

  // 1. DATA FETCHING (Existing)
  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await fetch(`/api/public/business/${id}`)
        const data = await res.json()
        
        if (data.success) {
          setBusiness(data.business)
        } else {
          router.push('/student/home') 
        }
      } catch (e) {
        console.error("Failed to load business")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchBusiness()
  }, [id, router])

  // 2. ✅ NEW: ANALYTICS TRACKING (Fires once on mount)
  useEffect(() => {
    if (!id) return;

    // We use 'navigator.sendBeacon' if available for better reliability on page exit,
    // otherwise fallback to standard fetch. For simplicity here, standard fetch:
    const trackView = async () => {
        try {
            await fetch('/api/analytics/track-view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: id })
            })
            console.log("👀 View counted")
        } catch (e) {
            // Fail silently so user experience isn't affected
        }
    }

    // Slight delay to ensure it's a real view, not an accidental instant bounce
    const timer = setTimeout(trackView, 1000)
    return () => clearTimeout(timer)
    
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#5856D6]"></i>
    </div>
  )

  if (!business) return null

  const mapPins = business.locations.map((loc: any) => ({
    id: loc.id,
    lat: loc.lat,
    lng: loc.lng,
    businessName: business.businessName,
    title: loc.name,
    category: business.category,
    businessId: business.id
  }))

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      
      {/* 1. HERO COVER */}
      <div className="relative h-60 md:h-80 bg-slate-900 w-full overflow-hidden">
        {business.coverImage ? (
            <img src={business.coverImage} alt="Cover" className="w-full h-full object-cover opacity-90" />
        ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center">
                <i className="fa-solid fa-store text-6xl text-slate-700"></i>
            </div>
        )}
        <button onClick={() => router.back()} className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition shadow-lg z-10">
            <i className="fa-solid fa-arrow-left"></i>
        </button>
      </div>

      {/* 2. HEADER */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
         <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="w-32 h-32 bg-white p-2 rounded-3xl shadow-lg -mt-16 md:-mt-20">
                <div className="w-full h-full bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100">
                    {business.logo ? (
                        <img src={business.logo} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl font-black text-slate-300">{business.businessName.charAt(0)}</span>
                    )}
                </div>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-black text-slate-900">{business.businessName}</h1>
                    <i className="fa-solid fa-certificate text-[#5856D6] text-xl" title="Verified Partner"></i>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                    <span className="uppercase tracking-wider">{business.category}</span>
                    <span>•</span>
                    <span>{business.city}</span>
                </div>
            </div>
         </div>
      </div>

      {/* 3. CONTENT */}
      <div className="max-w-5xl mx-auto px-6 mt-10 grid md:grid-cols-3 gap-10">
         <div className="md:col-span-2">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-tags text-[#5856D6]"></i> Active Offers ({business.deals.length})
            </h2>

            {business.deals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {business.deals.map((deal: any) => (
                        <Link href={`/student/deal/${deal.id}`} key={deal.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                            <div className="aspect-[4/3] bg-slate-100 relative">
                                {deal.image ? (
                                    <img src={deal.image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-[#5856D6] transition">{deal.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2">{deal.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 p-10 rounded-2xl text-center text-slate-400 font-bold border border-dashed border-slate-200">
                    No active deals right now.
                </div>
            )}
            
            <div className="mt-10">
                <h2 className="text-xl font-black text-slate-900 mb-4">About {business.businessName}</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{business.description || "No description provided."}</p>
            </div>
         </div>

         <div className="md:col-span-1">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
                 <h3 className="font-black text-slate-900 mb-4">Locations</h3>
                 {mapPins.length > 0 ? (
                     <div className="space-y-4">
                         <div className="rounded-xl overflow-hidden h-48 border border-slate-200">
                             <GoogleDealMap pins={mapPins} />
                         </div>
                         <ul className="space-y-3">
                             {business.locations.map((loc: any) => (
                                 <li key={loc.id} className="flex gap-3 text-sm text-slate-600">
                                     <i className="fa-solid fa-location-dot text-[#5856D6] mt-1"></i>
                                     <div>
                                         <div className="font-bold text-slate-900">{loc.name}</div>
                                         <div className="text-xs">{loc.address}</div>
                                     </div>
                                 </li>
                             ))}
                         </ul>
                     </div>
                 ) : (
                     <div className="text-sm text-slate-400 italic">Online Only</div>
                 )}
             </div>
         </div>
      </div>
    </div>
  )
}