'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'

// Import our Map Component (Client-side only)
const GoogleDealMap = dynamic(() => import('../../../components/GoogleDealMap'), { 
  ssr: false,
  loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl"></div>
})

export default function DealDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [deal, setDeal] = useState<any>(null)

  useEffect(() => {
    async function fetchDeal() {
      if (!id) return

      try {
        // ✅ Correct Path: Calls the API we just created
        const res = await fetch(`/api/auth/student/deals/${id}`)
        const data = await res.json()
        
        if (data.success) {
          setDeal(data.deal)
        } else {
          router.push('/student/home') // Redirect if not found
        }
      } catch (e) {
        console.error("Failed to load deal details")
      } finally {
        setLoading(false)
      }
    }
    fetchDeal()
  }, [id, router])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#5856D6]"></i>
    </div>
  )

  if (!deal) return null

  // Prepare Pins for the Map
  const mapPins = deal.business.locations.map((loc: any) => ({
    id: loc.id,
    lat: loc.lat,
    lng: loc.lng,
    businessName: deal.business.businessName,
    title: deal.title,
    category: deal.category
  }))

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      
      {/* 1. HERO HEADER (Big Image) */}
      <div className="relative w-full h-64 md:h-80 bg-slate-100 overflow-hidden">
        {deal.image ? (
            <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#5856D6] to-[#8E8CFF] flex items-center justify-center text-6xl">
                {deal.category === 'Food' ? '🍔' : '🛍️'}
            </div>
        )}
        
        {/* Back Button */}
        <Link href="/student/home" className="absolute top-6 left-6 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition shadow-lg">
            <i className="fa-solid fa-arrow-left"></i>
        </Link>
      </div>

      {/* 2. DEAL CONTENT */}
      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-10">
         <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 md:gap-12">
            
            {/* Left Column: Info & Description */}
            <div className="flex-1">
                {/* Logo & Business Name - NOW LINKED TO BUSINESS PROFILE */}
                <Link href={`/business/${deal.business.id}`} className="flex items-center gap-4 mb-4 hover:opacity-80 transition cursor-pointer">
                    <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-xl overflow-hidden">
                        {deal.business.logo ? (
                            <img src={deal.business.logo} className="w-full h-full object-cover" />
                        ) : (
                            <span>{deal.business.businessName.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">{deal.business.businessName}</h2>
                        <div className="flex items-center gap-2">
                           <span className="bg-[#5856D6] text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">{deal.category}</span>
                           <span className="text-green-600 text-[10px] font-bold flex items-center gap-1"><i className="fa-solid fa-check-circle"></i> Verified Offer</span>
                        </div>
                    </div>
                </Link>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">{deal.title}</h1>
                
                <div className="prose prose-slate max-w-none">
                    <h3 className="text-lg font-black text-slate-900 mb-2">Terms & Details</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{deal.description}</p>
                    <p className="text-sm text-slate-400 mt-4 italic">Expires: {deal.expiry || "Ongoing"}</p>
                </div>
            </div>

            {/* Right Column: Action & Map */}
            <div className="w-full md:w-80 flex flex-col gap-6">
                
                {/* Redemption Box */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">How to redeem</p>
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-sm text-slate-600 font-medium mb-4">Show your <strong>Student ID</strong> at the checkout counter.</p>
                    <Link href="/student/home" className="block w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition">
                        Open My ID Card
                    </Link>
                </div>

                {/* Locations Map */}
                <div>
                    <h3 className="text-sm font-black text-slate-900 mb-3">Valid Locations</h3>
                    {mapPins.length > 0 ? (
                        <div className="rounded-xl overflow-hidden border border-slate-200 h-48 shadow-sm">
                            <GoogleDealMap pins={mapPins} />
                        </div>
                    ) : (
                        <div className="bg-slate-50 h-32 rounded-xl flex items-center justify-center text-slate-400 text-sm italic border border-dashed border-slate-200">
                            Available Online or Nationwide
                        </div>
                    )}
                </div>

            </div>

         </div>
      </div>
    </div>
  )
}