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
                const res = await fetch(`/api/auth/student/deals/${id}`)
                const data = await res.json()
                if (data.success) setDeal(data.deal)
                else router.push('/student/home')
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

                // ✅ THE 15 METER RULE
                if (dist <= 15) {
                    setIsWithinRange(true)
                    setLocationError('')
                } else {
                    setIsWithinRange(false)
                    setLocationError(`Too far. Move ${Math.floor(dist - 15)}m closer.`)
                }
            },
            (err) => {
                console.warn(err)
                setLocationError("Location access required to redeem.")
                setIsWithinRange(false)
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [deal])

    // 3. ✅ HANDLE REDEMPTION SWIPE
    const handleRedeemSuccess = async () => {
        const email = localStorage.getItem('studentEmail')
        if (!email) return

        try {
            const res = await fetch('/api/auth/student/redeem-swipe', {
                method: 'POST',
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
    const mapPins = deal.business.locations ? deal.business.locations.map((loc: any) => ({
        id: loc.id, lat: loc.lat, lng: loc.lng, businessName: deal.business.businessName, title: deal.title, category: deal.category
    })) : []

    return (
        <div className="min-h-screen bg-white font-sans pb-20">

            {/* 1. HERO HEADER */}
            <div className="relative w-full h-64 md:h-80 bg-slate-100 overflow-hidden">
                {deal.image ? (
                    <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#5856D6] to-[#8E8CFF] flex items-center justify-center text-6xl">
                        {deal.category === 'Food' ? '🍔' : '🛍️'}
                    </div>
                )}
                <Link href="/student/home" className="absolute top-6 left-6 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition shadow-lg">
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
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                                        <i className="fa-solid fa-check"></i>
                                    </div>
                                    <h3 className="font-black text-xl text-green-600">Redeemed!</h3>

                                    {/* ✅ DISPLAY CODE */}
                                    {redeemedCode && (
                                        <div className="bg-slate-100 py-2 px-4 rounded-lg my-3 border border-slate-200 inline-block">
                                            <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">Reference Code</span>
                                            <span className="text-2xl font-black text-slate-800 tracking-widest">{redeemedCode}</span>
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-500 mt-1">Show screen to staff</p>
                                    <div className="mt-4 text-xs font-mono text-slate-400">{new Date().toLocaleString()}</div>
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

                                    {/* THE SWIPE BUTTON */}
                                    <SwipeToRedeem
                                        onComplete={handleRedeemSuccess}
                                        disabled={!isWithinRange}
                                        disabledText={locationError || "Move Closer (15m)"}
                                    />

                                    <p className="text-[10px] text-slate-400 mt-4 leading-tight">
                                        * Swipe only when at the counter. Requires GPS.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <div className="rounded-xl overflow-hidden border border-slate-200 h-48 shadow-sm relative">
                            <GoogleDealMap pins={mapPins} />
                            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-[10px] font-bold shadow">
                                Shop Location
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}