'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import DealCard from '@/components/DealCard'
import ClaimDealModal from '@/components/ClaimDealModal'
import { claimDeal } from '@/app/actions'

// Dynamic Map
const GoogleDealMap = dynamic(() => import('@/components/GoogleDealMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center font-bold text-slate-400">Loading Map...</div>
})

// Ticket Badge
function ActiveTicketBadge({ email }: { email: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    fetch('/api/auth/user/my-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).then(res => res.json()).then(data => setCount(data.totalActive || 0)).catch(e => { })
  }, [email])
  if (count === 0) return null
  return <span className="absolute -top-1 -right-1 bg-[#D90020] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{count > 9 ? '9+' : count}</span>
}

export default function UserDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // View State
  const [viewMode, setViewMode] = useState<'ALL' | 'NEARBY' | 'MAP' | 'SAVED'>('ALL')
  const [activeCategory, setActiveCategory] = useState('All')

  // Data State
  const [deals, setDeals] = useState<any[]>([])
  const [savedDealIds, setSavedDealIds] = useState<number[]>([])
  const [redeemedDealIds, setRedeemedDealIds] = useState<number[]>([])
  const [nearbyDeals, setNearbyDeals] = useState<any[]>([])
  const [mapPins, setMapPins] = useState<any[]>([])

  // Location
  const [locationStatus, setLocationStatus] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [selectedCity, setSelectedCity] = useState('All Cities')

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Claim Modal
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [showClaimModal, setShowClaimModal] = useState(false)

  // Categories
  const [categories, setCategories] = useState<string[]>(['All', 'Food', 'Coffee', 'Fitness', 'Entertainment', 'Services'])

  useEffect(() => {
    async function loadData() {
      const email = localStorage.getItem('userEmail')
      if (!email) { router.push('/user/login'); return }

      try {
        // Fetch User
        const profileRes = await fetch('/api/auth/user/dashboard', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
        })
        if (!profileRes.ok) throw new Error('Auth failed')
        const profileData = await profileRes.json()
        setUser(profileData.user)
        setSavedDealIds(profileData.savedDealIds || [])
        setRedeemedDealIds(profileData.redeemedDealIds || [])
        if (profileData.user?.hometown) setSelectedCity(profileData.user.hometown)

        // Fetch Deals
        const dealsRes = await fetch('/api/public/deals', { cache: 'no-store' })
        const dealsData = await dealsRes.json()
        if (dealsData.success) {
          setDeals(dealsData.deals)
        }
      } catch (e) {
        router.push('/user/login')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  // Calculate Distance Helper
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    setIsLocating(true)
    setLocationStatus('Locating...')
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords
      setUserLocation({ lat: latitude, lng: longitude })

      // Client-side distance calculation for all deals
      const dealsWithDistance = deals.map(d => ({
        ...d,
        distance: calculateDistance(latitude, longitude, d.business?.latitude || 0, d.business?.longitude || 0)
      })).sort((a, b) => a.distance - b.distance)

      setNearbyDeals(dealsWithDistance)
      setLocationStatus(`Found nearby deals`)
      setViewMode('NEARBY')
      setIsLocating(false)
    }, err => {
      setLocationStatus('Failed to locate')
      setIsLocating(false)
    })
  }

  const toggleSave = async (e: React.MouseEvent, dealId: number) => {
    e.stopPropagation()
    const isSaved = savedDealIds.includes(dealId)
    setSavedDealIds(prev => isSaved ? prev.filter(id => id !== dealId) : [...prev, dealId])
    // In background, sync with DB
  }

  // Filtering
  const getFilteredDeals = () => {
    let result = viewMode === 'NEARBY' ? nearbyDeals : deals
    if (viewMode === 'SAVED') result = result.filter(d => savedDealIds.includes(d.id))

    if (activeCategory !== 'All') result = result.filter(d => d.category === activeCategory)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(d => d.title.toLowerCase().includes(q) || d.business?.businessName?.toLowerCase().includes(q))
    }

    if (selectedCity !== 'All Cities') {
      result = result.filter(d => d.business?.city === selectedCity)
    }

    return result
  }

  const filteredDeals = getFilteredDeals()

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-[#D90020] border-t-transparent rounded-full"></div></div>

  return (
    <div className="min-h-screen bg-white pb-20 font-sans text-slate-900">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/user/dashboard" className="flex items-center group">
            <Image src="/images/win-logo.svg" alt="WIN" width={40} height={40} className="h-8 w-auto" />
          </Link>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-lg relative">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search deals, brands..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 rounded-full pl-10 pr-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#D90020]/20"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Wallet */}
            <Link href="/user/wallet" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-50 transition relative">
              <div className="relative">
                <i className="fa-solid fa-wallet text-xl text-slate-700"></i>
                <ActiveTicketBadge email={user?.email} />
              </div>
              <span className="text-sm font-bold hidden sm:block">My Wallet</span>
            </Link>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      {/* FILTERS & TABS */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Tabs (Pills) */}
          <div className="flex bg-slate-100 p-1 rounded-full">
            {['ALL', 'SAVED', 'NEARBY', 'MAP'].map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode as any)
                  if (mode === 'NEARBY' && nearbyDeals.length === 0) handleAutoDetectLocation()
                }}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === mode ? 'bg-white text-[#D90020] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {mode === 'ALL' ? 'All Deals' : mode.charAt(0) + mode.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Custom Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            <button onClick={handleAutoDetectLocation} className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold hover:bg-slate-50">
              <i className="fa-solid fa-location-crosshairs text-[#D90020]"></i> Auto
            </button>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="shrink-0 bg-transparent text-xs font-bold outline-none border border-slate-200 rounded-full px-3 py-1.5 cursor-pointer hover:bg-slate-50"
            >
              <option>All Cities</option>
              <option>Tunis</option>
              <option>Sousse</option>
              <option>Sfax</option>
            </select>
            <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${activeCategory === cat ? 'bg-black text-white border-black' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'MAP' ? (
          <div className="h-[70vh] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
            <GoogleDealMap pins={deals.map(d => ({
              id: d.id,
              lat: d.business?.latitude || 0,
              lng: d.business?.longitude || 0,
              title: d.title,
              businessName: d.business?.businessName
            }))} userLocation={userLocation} />
          </div>
        ) : (
          <>
            {/* Grid */}
            {filteredDeals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDeals.map(deal => (
                  <div key={deal.id} className="h-full">
                    <DealCard
                      deal={deal}
                      saved={savedDealIds.includes(deal.id)}
                      onToggleSave={toggleSave}
                      onClick={() => { setSelectedDeal(deal); setShowClaimModal(true); }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <i className="fa-solid fa-ticket text-6xl text-slate-200 mb-6"></i>
                <h3 className="text-xl font-bold text-slate-900">No deals found</h3>
                <p className="text-slate-500">Try adjusting your filters or location.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Claim Modal */}
      <ClaimDealModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        deal={selectedDeal}
        userEmail={user?.email}
      />

    </div>
  )
}
