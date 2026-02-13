'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import SwipeToRedeem from '@/components/SwipeToRedeem'
import { getDistanceFromLatLonInMeters } from '@/utils/location'

// Map Import
const GoogleDealMap = dynamic(() => import('../../../../components/GoogleDealMap'), {
    ssr: false, loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl"></div>
})

export default function DealDetailsPage() {
    const { id } = useParams()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [deal, setDeal] = useState<any>(null)

    // ✅ Location & Redemption State
    const [distance, setDistance] = useState<number | null>(null)
    const [isWithinRange, setIsWithinRange] = useState(false)
    const [locationError, setLocationError] = useState('')
    const [redeemState, setRedeemState] = useState<'IDLE' | 'SUCCESS' | 'COOLDOWN'>('IDLE')
    const [cooldownTime, setCooldownTime] = useState(0)
    const [redeemedCode, setRedeemedCode] = useState('') // ✅ Store Code

    // 1. Fetch Deal
    useEffect(() => {
        async function fetchDeal() {
            if (!id) return
            try {
                const res = await fetch(`/api/public/deals/${id}`)
                const data = await res.json()
                if (data.success) {
                    setDeal(data.deal)
                    // ✅ Increment View
                    fetch(`/api/auth/deals/${data.deal.id}/view`, { method: 'POST' })
                }
<<<<<<< HEAD:app/user/deal/[id]/page.tsx
                else router.push('/user/dashboard')
=======
                else router.push('/student/home')
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af:app/student/deal/[id]/page.tsx
            } catch (e) { console.error("Failed to load deal") }
            finally { setLoading(false) }
        }
        fetchDeal()
    }, [id, router])

    // 2. ✅ LIVE GPS TRACKING (15 Meter Logic)
    useEffect(() => {
        if (!deal || !deal.business || !deal.business.latitude) return

        const targetLat = deal.business.latitude
        const targetLng = deal.business.longitude

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const dist = getDistanceFromLatLonInMeters(
                    pos.coords.latitude,
                    pos.coords.longitude,
                    targetLat,
                    targetLng
                )
                setDistance(Math.floor(dist))

                // ✅ THE 100 METER RULE (Relaxed for better UX)
                if (dist <= 100) {
                    setIsWithinRange(true)
                    setLocationError('')
                } else {
                    setIsWithinRange(false)
                    setLocationError(`Too far. Move ${Math.floor(dist - 100)}m closer.`)
                }
            },
            (err) => {
                console.warn(err)
                setLocationError("Location access required to redeem.")
                setIsWithinRange(false)

                // ✅ Stop watching if user denied permission to prevent console spam
                if (err.code === 1) { // 1 = PERMISSION_DENIED
                    navigator.geolocation.clearWatch(watchId)
                }
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [deal])

    // 3. ✅ HANDLE CLAIM & CHECKOUT
    const handleRedeemSuccess = async () => {
        const email = localStorage.getItem('studentEmail')
        if (!email) return

        try {
            const res = await fetch('/api/auth/user/claim-deal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, dealId: deal.id })
            })
            const data = await res.json()

            if (res.ok) {
                // SUCCESS LOGIC
                setRedeemState('SUCCESS')
                setRedeemedCode(data.code) // ✅ Capture Code

                // Check for cooldown (Multi-use)
                if (deal.isMultiUse) {
                    setTimeout(() => {
                        setRedeemState('COOLDOWN')
                        setCooldownTime(5 * 60) // 5 minutes in seconds
                    }, 2000)
                }
            } else {
                alert(data.error || "Redemption Failed")
                // Reset swipe if failed
                window.location.reload()
            }
        } catch (e) {
            alert("Network Error")
        }
    }

    // Cooldown Timer
    useEffect(() => {
        if (redeemState === 'COOLDOWN' && cooldownTime > 0) {
            const timer = setInterval(() => setCooldownTime(t => t - 1), 1000)
            return () => clearInterval(timer)
        }
    }, [redeemState, cooldownTime])

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#5856D6]"></i></div>
    if (!deal) return null

    // Map Pins
    let mapPins = deal.business.locations ? deal.business.locations.map((loc: any) => ({
        id: loc.id, lat: loc.lat, lng: loc.lng, businessName: deal.business.businessName, title: deal.title, category: deal.category
    })) : []

    // ✅ FALLBACK: If no locations, use Business Main Coordinates
    if (mapPins.length === 0 && (deal.business.latitude && deal.business.latitude !== 0)) {
        mapPins = [{
            id: 999,
            lat: deal.business.latitude,
            lng: deal.business.longitude,
            businessName: deal.business.businessName,
            title: deal.title,
            category: deal.category
        }]
    }

    return (
        <div className="min-h-screen bg-white font-sans pb-20">

            {/* 1. HERO HEADER */}
            {/* 1. HERO HEADER (Business Cover) */}
            <div className="relative w-full h-64 md:h-80 bg-slate-100 overflow-hidden flex items-center justify-center">
                {deal.business.coverImage ? (
                    <div className="w-full h-full">
                        {/* Added overlay for better text contrast if we ever add text here later, for now just nice darkening */}
                        <div className="absolute inset-0 bg-black/10 z-10"></div>
                        <img src={deal.business.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-full h-full bg-[#007AFF] flex items-center justify-center text-6xl">
                        {deal.category === 'Food' ? '🍔' : '🛍️'}
                    </div>
                )}
                <Link href="/student/home" className="absolute top-6 left-6 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition shadow-lg z-20">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
            </div>

            {/* 2. DEAL CONTENT */}
            <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-10">
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 md:gap-12">

                    {/* Left Column: Info */}
                    <div className="flex-1">
                        <Link href={`/business/${deal.business.id}`} className="flex items-center gap-4 mb-4 hover:opacity-80 transition cursor-pointer">
                            <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-xl overflow-hidden">
                                {deal.business.logo ? <img src={deal.business.logo} className="w-full h-full object-cover" /> : <span>{deal.business.businessName.charAt(0)}</span>}
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

                        {/* ✅ MOVED DEAL IMAGE HERE */}
                        {deal.image && (
                            <div className="w-full h-64 md:h-80 mb-8 rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative group">
                                <img
                                    src={deal.image}
                                    alt={deal.title}
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                                />
                            </div>
                        )}

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-lg font-black text-slate-900 mb-2">Terms & Details</h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{deal.description}</p>
                            <p className="text-sm text-slate-400 mt-4 italic">Expires: {deal.expiry || "Ongoing"}</p>
                        </div>
                    </div>

                    {/* Right Column: SWIPE TO REDEEM */}
                    <div className="w-full md:w-80 flex flex-col gap-6">

                        {/* Redemption Box */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center shadow-inner">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-4">In-Store Redemption</p>

                            {redeemState === 'SUCCESS' ? (
                                <div className="animate-in zoom-in duration-300 py-4">
                                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
                                        <h3 className="text-center font-black text-slate-900 uppercase tracking-widest text-sm mb-4">Transaction Ticket</h3>

                                        {/* QR Code */}
                                        <div className="flex justify-center mb-4">
                                            <QRCodeSVG value={redeemedCode || "ERROR"} size={150} />
                                        </div>

                                        {/* Code Display */}
                                        <div className="bg-slate-50 py-2 px-4 rounded-lg border border-slate-200 text-center">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-1">Merchant Code</span>
                                            <span className="text-xl font-black text-slate-800 tracking-widest font-mono">{redeemedCode}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                                        <i className="fa-solid fa-circle-check"></i>
                                        <span className="font-bold">Ready for Checkout</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Show this ticket to the merchant.</p>
                                </div>
                            ) : redeemState === 'COOLDOWN' ? (
                                <div className="py-6">
                                    <div className="text-2xl font-black text-slate-300 mb-2"><i className="fa-solid fa-hourglass-half fa-spin"></i></div>
                                    <h3 className="font-bold text-slate-500">Cooldown Active</h3>
                                    <p className="text-xs text-slate-400 mt-2">Available again in</p>
                                    <div className="text-xl font-mono font-black text-slate-700 mt-1">
                                        {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>
                            ) : (
                                // ✅ ACTIVE STATE
                                <div>
                                    {/* Distance Indicator */}
                                    <div className={`mb-4 text-xs font-bold py-1 px-3 rounded-full inline-flex items-center gap-2 ${isWithinRange ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        <i className={`fa-solid ${isWithinRange ? 'fa-location-dot' : 'fa-triangle-exclamation'}`}></i>
                                        {distance !== null ? `${distance}m away` : 'Locating...'}
                                    </div>

<<<<<<< HEAD:app/user/deal/[id]/page.tsx
                                    {/* CLIAM BUTTON */}
                                    <button
                                        onClick={handleRedeemSuccess}
                                        disabled={!isWithinRange}
                                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-lg uppercase tracking-wide transition shadow-lg ${isWithinRange ? 'bg-[#FF3B30] text-white hover:bg-[#E6352B] shadow-red-900/20' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        <i className="fa-solid fa-ticket-alt"></i>
                                        {isWithinRange ? "Claim Deal" : locationError || "Move Closer"}
                                    </button>
=======
                                    {/* THE SWIPE BUTTON */}
                                    <SwipeToRedeem
                                        onComplete={handleRedeemSuccess}
                                        onStart={() => {
                                            // ✅ Track Click (Intent to Redeem)
                                            if (deal) fetch(`/api/auth/deals/${deal.id}/click`, { method: 'POST' })
                                        }}
                                        disabled={!isWithinRange}
                                        disabledText={locationError || "Move Closer (100m)"}
                                    />
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af:app/student/deal/[id]/page.tsx

                                    <p className="text-[10px] text-slate-400 mt-4 leading-tight">
                                        * Click to generate your transaction ticket. Pay at the counter.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <div className="rounded-xl overflow-hidden border border-slate-200 h-48 shadow-sm relative bg-slate-100">
                            {/* ✅ Embed Support */}
                            {deal.business.googleMapEmbed ? (
                                <div dangerouslySetInnerHTML={{ __html: deal.business.googleMapEmbed }} className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0" />
                            ) : (
                                <GoogleDealMap pins={mapPins} />
                            )}

                            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-[10px] font-bold shadow pointer-events-none">
                                Shop Location
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}