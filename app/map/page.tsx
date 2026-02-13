'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import InteractiveMap from '@/components/InteractiveMap'
import useMapBounds from '@/hooks/useMapBounds'
import Link from 'next/link'
import Image from 'next/image'

export default function MapPage() {
    const [loading, setLoading] = useState(true)
    const [businesses, setBusinesses] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // 1. Fetch All Businesses (Filtering happens client-side for map interactiveness)
    const [selectedRadius, setSelectedRadius] = useState<number>(10) // Default 10km
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [categories, setCategories] = useState<any[]>([])

    // 1. Fetch All Businesses
    useEffect(() => {
        async function loadData() {
            try {
                const [bizRes, catRes] = await Promise.all([
                    fetch('/api/public/business/list'),
                    fetch('/api/public/categories')
                ])

                if (bizRes.ok) {
                    const data = await bizRes.json()
                    setBusinesses(data)
                }

                if (catRes.ok) {
                    const catData = await catRes.json()
                    setCategories(catData)
                }
            } catch (e) {
                console.error("Map Data Error", e)
            } finally {
                setLoading(false)
            }
        }
        loadData()

        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn("Location access denied:", err.message)
            )
        }
    }, [])

    // Helper: Haversine Distance
    function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180)
    }

    // 2. Filter by Category & Radius
    const filteredBusinesses = businesses.filter(b => {
        // Category Filter
        if (selectedCategory !== 'All' && b.category !== selectedCategory) return false

        // Radius Filter
        if (userLocation && b.latitude && b.longitude) {
            const dist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
            if (dist > selectedRadius) return false
        }
        return true
    })

    // 3. Map Hook for Viewport Filtering
    const { isLoaded, onLoad, onUnmount, onBoundsChanged, visibleItems, map } = useMapBounds(filteredBusinesses)

    // 4. Handle Marker Click -> Scroll to Card
    const onMarkerClick = (id: string) => {
        setSelectedId(id)
        const element = document.getElementById(`card-${id}`)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            <Navbar />

            <div className="flex-1 flex pt-24 relative">

                {/* LEFT SIDEBAR: LIST */}
                <div className="w-full md:w-[450px] bg-white border-r border-slate-200 flex flex-col z-10 shadow-xl md:shadow-none absolute md:relative h-full transition-transform transform md:translate-x-0 translate-x-0">

                    {/* Filters */}
                    <div className="p-6 border-b border-slate-100 bg-white z-20">
                        <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Discover Nearby</h1>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                            <button
                                onClick={() => setSelectedCategory('All')}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === 'All' ? 'bg-black text-white border-black' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-900'}`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat.name ? 'bg-black text-white border-black' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-900'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Radius Slider */}
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                <span>Max Distance</span>
                                <span>{selectedRadius} km</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={selectedRadius}
                                onChange={(e) => setSelectedRadius(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            {visibleItems.length} Places Found
                        </p>

                        {loading ? (
                            [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>)
                        ) : visibleItems.length > 0 ? (
                            visibleItems.map(b => (
                                <div
                                    id={`card-${b.id}`}
                                    key={b.id}
                                    className={`bg-white p-4 rounded-2xl border transition-all duration-300 cursor-pointer group hover:shadow-lg ${selectedId === b.id ? 'border-black ring-2 ring-black/5 shadow-xl' : 'border-slate-100 hover:border-slate-300'}`}
                                    onClick={() => {
                                        setSelectedId(b.id)
                                        if (map && b.latitude && b.longitude) {
                                            map.panTo({ lat: b.latitude, lng: b.longitude })
                                            map.setZoom(15)
                                        }
                                    }}
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-xl bg-slate-100 relative overflow-hidden flex-shrink-0">
                                            {/* Fallback to first letter if no logo */}
                                            {b.logo ? (
                                                <Image src={b.logo} alt={b.businessName} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-2xl">{b.businessName[0]}</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 group-hover:text-[#E60023] transition-colors">{b.businessName}</h3>
                                                {b.rating && (
                                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                                                        <i className="fa-solid fa-star"></i> {b.rating}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium mb-3">{b.category} • 1.2km</p>
                                            <div className="flex gap-2">
                                                <Link href={`/business/${b.id}`} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-[#E60023] transition-colors">
                                                    View Profile
                                                </Link>
                                                <button className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200">
                                                    <i className="fa-solid fa-location-arrow"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-slate-400">
                                <i className="fa-solid fa-map-location-dot text-4xl mb-4 text-slate-300"></i>
                                <p>Move the map to find places.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: MAP */}
                <div className="hidden md:block flex-1 relative bg-slate-200">
                    {isLoaded ? (
                        <InteractiveMap
                            items={filteredBusinesses}
                            selectedId={selectedId}
                            onMarkerClick={onMarkerClick}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            onBoundsChanged={onBoundsChanged}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">Loading Map...</div>
                    )}

                    {/* Map Controls Overlay (Zoom etc handled by simple map options, but could add custom here) */}
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                        <button
                            onClick={() => {
                                // Get user location logic
                                if (navigator.geolocation && map) {
                                    navigator.geolocation.getCurrentPosition(pos => {
                                        map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                                        map.setZoom(14)
                                    })
                                }
                            }}
                            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-black hover:bg-slate-50 transition font-bold"
                        >
                            <i className="fa-solid fa-crosshairs"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
