'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import SwipeToRedeem from "@/components/SwipeToRedeem" // ✅ Correct Import Name

// Dynamic import for Map to avoid SSR issues
const GoogleDealMap = dynamic(() => import('@/components/GoogleDealMap'), { 
  ssr: false,
  loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl"></div>
})

// --- TYPES ---
interface Deal {
  id: number
  title: string
  description: string
  discountValue: string 
  image?: string
  isMultiUse: boolean
}

interface Location {
  id: number
  name: string
  address: string
  lat: number
  lng: number
}

interface Business {
  id: string
  businessName: string
  category: string
  city: string
  description: string
  logo?: string
  coverImage?: string
  locations: Location[]
  deals: Deal[]
}

export default function BusinessProfile() {
  const { id } = useParams()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)

  // 1. DATA FETCHING
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
        console.error("Failed to load business", e)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchBusiness()
  }, [id, router])

  // 2. ANALYTICS TRACKING
  useEffect(() => {
    if (!id) return;
    const trackView = async () => {
        try {
            await fetch('/api/analytics/track-view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: id })
            })
        } catch (e) {
            // Fail silently
        }
    }
    const timer = setTimeout(trackView, 1000)
    return () => clearTimeout(timer)
  }, [id])

  // ✅ 3. HANDLE SWIPE (Redirects to Deal Page for GPS Check)
  const handleQuickRedeem = () => {
    if (business && business.deals.length > 0) {
        router.push(`/student/deal/${business.deals[0].id}`)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#5856D6]"></i>
    </div>
  )

  if (!business) return null

  // Prepare pins for the map
  const mapPins = business.locations.map((loc) => ({
    id: loc.id,
    lat: loc.lat,
    lng: loc.lng,
    businessName: business.businessName,
    title: loc.name,
    category: business.category,
    businessId: business.id
  }))

  const primaryOfferId = business.deals.length > 0 ? business.deals[0].id : null;

  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      
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
                    {business.deals.map((deal) => (
                        <Link href={`/student/deal/${deal.id}`} key={deal.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                            <div className="aspect-[4/3] bg-slate-100 relative">
                                {deal.image ? (
                                    <img src={deal.image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                                )}
                                <div className="absolute top-3 right-3 bg-[#FF3B30] text-white text-xs font-black px-2 py-1 rounded shadow-sm">
                                    {deal.discountValue}
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-[#5856D6] transition">{deal.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-2 flex-1">{deal.description}</p>
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
                             {business.locations.map((loc) => (
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

      {/* 4. SWIPE REDEEM (Fixed Bottom Bar for First Deal) */}
      {primaryOfferId && (
        <div className="fixed bottom-0 left-0 w-full p-6 bg-white border-t border-slate-200 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-md mx-auto">
                <p className="text-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Redeem {business.deals[0].discountValue} Offer
                </p>
                {/* ✅ CORRECTED USAGE: onComplete instead of offerId */}
                <SwipeToRedeem onComplete={handleQuickRedeem} />
            </div>
        </div>
      )}

    </div>
  )
}