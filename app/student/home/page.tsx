'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StudentHomePage() {
  const router = useRouter()
  
  // --- STATE ---
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // --- 1. FETCH REAL DEALS FROM DATABASE ---
  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch('/api/offers') // Calls the API we created
        if (res.ok) {
          const data = await res.json()
          setDeals(data)
        }
      } catch (error) {
        console.error("Failed to load deals", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  // Filter deals based on search
  const filteredDeals = deals.filter(deal => 
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.business?.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-24 relative">
      
      {/* --- HEADER --- */}
      <header className="bg-white sticky top-0 z-10 px-6 pt-12 pb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Student<span className="text-red-500">.LIFE</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tunis Campus</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
            <i className="fa-solid fa-user"></i>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search burgers, tech, coffee..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>
      </header>

      {/* --- CATEGORIES (Static for now) --- */}
      <div className="px-6 mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Food', 'Tech', 'Events', 'Fashion'].map((cat, i) => (
          <button 
            key={i}
            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* --- REAL DEALS FEED --- */}
      <div className="px-6 mt-6 space-y-5">
        <h2 className="text-lg font-bold text-slate-900">Trending Near You</h2>
        
        {loading ? (
          // Loading Skeleton
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-[1.5rem] shadow-sm animate-pulse h-32"></div>
          ))
        ) : filteredDeals.length === 0 ? (
          // Empty State
          <div className="text-center py-10 opacity-50">
            <i className="fa-solid fa-ghost text-4xl mb-3"></i>
            <p className="font-bold">No deals found yet.</p>
          </div>
        ) : (
          // Real Data List
          filteredDeals.map((deal) => (
            <div key={deal.id} className="group bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex gap-4">
                {/* Brand Logo Placeholder */}
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                  🏪
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{deal.title}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        {deal.business?.businessName || "Partner"}
                      </p>
                    </div>
                    <span className="bg-red-50 text-red-500 text-xs font-black px-3 py-1 rounded-lg">
                      {deal.discount} OFF
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                      <i className="fa-regular fa-clock"></i>
                      <span>Expires {new Date(deal.validUntil).toLocaleDateString()}</span>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs group-hover:bg-indigo-600 transition-colors">
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- BOTTOM NAVIGATION --- */}
      <nav className="fixed bottom-6 left-6 right-6 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/30 py-4 px-8 flex justify-between items-center z-50">
        <NavIcon icon="house" active />
        <NavIcon icon="compass" />
        <NavIcon icon="wallet" />
        <NavIcon icon="id-card" />
      </nav>

    </div>
  )
}

function NavIcon({ icon, active }: { icon: string, active?: boolean }) {
  return (
    <button className={`text-xl transition-all ${active ? 'text-white scale-110' : 'text-slate-500 hover:text-white'}`}>
      <i className={`fa-solid fa-${icon}`}></i>
      {active && <div className="w-1 h-1 bg-red-500 rounded-full mx-auto mt-1"></div>}
    </button>
  )
}