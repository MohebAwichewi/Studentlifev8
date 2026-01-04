'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  
  // ✅ Location State
  const [userLocation, setUserLocation] = useState<{ city: string, country: string } | null>(null)

  // ✅ Modals
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // --- 1. ROBUST LOCATION DETECTION ---
  useEffect(() => {
    async function detectLocation() {
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (!res.ok) throw new Error("Network response was not ok")
        
        const data = await res.json()
        
        if (data.city) {
          setUserLocation({ city: data.city, country: data.country_name })
        } else {
          throw new Error("No city data")
        }
      } catch (error) {
        // Fallback to London for UK market
        setUserLocation({ city: 'London', country: 'United Kingdom' })
      }
    }
    detectLocation()
  }, [])

  // --- 2. FETCH REAL DEALS ---
  useEffect(() => {
    async function loadDeals() {
      try {
        // Updated to use the correct API endpoint if you have one, 
        // or '/api/public/deals' if you created it in previous steps.
        const res = await fetch('/api/public/deals') 
        const data = await res.json()
        if (data.deals) setDeals(data.deals)
      } catch (e) {
        console.error("Error loading deals")
      } finally {
        setLoading(false)
      }
    }
    loadDeals()
  }, [])

  // --- FILTERS ---
  const categories = ['Fashion', 'Food', 'Tech', 'Beauty', 'Travel', 'Health']
  const quickFilters = ['All', 'Pizza', 'Burgers', 'Coffee', 'Gym', 'Sneakers', 'Laptops']

  // --- 3. FILTER LOGIC ---
  const filteredDeals = deals.filter(d => {
    const matchesCategory = activeCategory === 'All' 
      ? true 
      : d.title.toLowerCase().includes(activeCategory.toLowerCase()) || 
        d.business?.businessName.toLowerCase().includes(activeCategory.toLowerCase())

    // If we have location data, filter by city (exact or partial match)
    if (userLocation && d.business?.city) {
        // Optional: strict filtering
        // return matchesCategory && d.business.city.toLowerCase().includes(userLocation.city.toLowerCase())
        return matchesCategory // For MVP, show all relevant deals to populate the grid
    }

    return matchesCategory
  })

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-purple-100 relative">
      
      {/* --- HEADER --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <button className="md:hidden text-2xl"><i className="fa-solid fa-bars"></i></button>
             <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition">
               <span className="text-3xl font-black tracking-tighter text-slate-900">Student</span>
               <span className="bg-[#FF3B30] text-white px-2 py-0.5 rounded-md text-xl font-black tracking-wide">.LIFE</span>
             </Link>
          </div>

          <div className="hidden md:block flex-1 max-w-lg mx-8 relative">
             <input type="text" placeholder="Search for brands, discounts or items..." className="w-full bg-slate-100 border-none rounded-full py-3 px-6 pl-12 text-sm font-bold focus:ring-2 focus:ring-purple-600 transition-all" />
             <i className="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-400"></i>
          </div>

          <div className="flex items-center gap-4 text-sm font-bold">
             <button onClick={() => setShowLoginModal(true)} className="hidden md:block hover:text-purple-600 transition">Log in</button>
             <Link href="/business" className="hidden md:block text-slate-400 hover:text-slate-600">For Business</Link>
             <button onClick={() => setShowJoinModal(true)} className="bg-purple-600 text-white px-6 py-2.5 rounded-full hover:bg-purple-700 transition shadow-lg shadow-purple-200">Join Now</button>
          </div>
        </div>
        <div className="hidden md:flex justify-center border-t border-slate-100">
           <div className="flex gap-10 py-4 text-sm font-bold text-slate-600">
              {categories.map(cat => (
                <button key={cat} className="hover:text-black transition-colors uppercase tracking-wide text-xs">{cat}</button>
              ))}
           </div>
        </div>
      </nav>

      {/* --- HERO BANNER --- */}
      <section className="bg-black text-white py-16 px-4 relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4c1d95_1px,transparent_1px)] [background-size:16px_16px]"></div>
         
         <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Location Badge */}
            {userLocation && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 <span className="text-xs font-bold uppercase tracking-wider text-green-300">
                   Deals detected in {userLocation.city}
                 </span>
              </div>
            )}

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
               We live for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Student Discounts.</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium mb-10 max-w-2xl mx-auto">
               Join the largest student network in {userLocation?.country || 'the UK'}. Verify your ID instantly and unlock exclusive deals in-store and online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setShowJoinModal(true)} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
                Get Started for Free
              </button>
              <Link href="/business" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition">
                I'm a Partner
              </Link>
            </div>
         </div>
      </section>

      {/* --- PILL FILTERS --- */}
      <div className="sticky top-[80px] z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 shadow-sm">
         <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar flex gap-3">
            {quickFilters.map(filter => (
               <button
                 key={filter}
                 onClick={() => setActiveCategory(filter)}
                 className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                   activeCategory === filter 
                   ? 'bg-purple-600 text-white shadow-md transform scale-105' 
                   : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                 }`}
               >
                 {filter}
               </button>
            ))}
         </div>
      </div>

      {/* --- DEAL GRID --- */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10">
           <div>
             <h3 className="text-3xl font-black tracking-tight text-slate-900">
               {userLocation ? `Trending in ${userLocation.city}` : 'Trending Now'}
             </h3>
             <p className="text-slate-500 mt-1 font-medium">Top offers students are loving this week.</p>
           </div>
           <Link href="/student/home" className="hidden sm:block text-sm font-bold text-purple-600 hover:underline">See all offers &rarr;</Link>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[1,2,3,4].map(i => <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse"/>)}
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {filteredDeals.length > 0 ? filteredDeals.map((deal) => (
                
                // ✅ UPDATED: Wrapped deal card in Link to Business Page
                // Using a fallback ID '1' if deal.businessId isn't loaded yet, or using the real one.
                <Link 
                  href={`/business/${deal.businessId || deal.business?.id || 1}`} 
                  key={deal.id} 
                  className="group cursor-pointer block"
                >
                   <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 shadow-sm mb-4">
                      {deal.image ? (
                        <img src={deal.image} alt={deal.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><i className="fa-solid fa-image text-4xl"></i></div>
                      )}
                      <div className="absolute bottom-4 left-4 w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center p-1 z-10 transition-transform group-hover:-translate-y-1">
                         <span className="font-black text-xs text-center leading-none">{deal.business?.businessName?.slice(0, 3) || 'S7'}</span>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur text-purple-700 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">{deal.discountValue || 'PROMO'}</div>
                   </div>
                   <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">{deal.business?.businessName || 'Partner'}</h4>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2 leading-relaxed">{deal.description || deal.title}</p>
                   </div>
                </Link>

              )) : (
                <div className="col-span-full py-10 text-center text-slate-400">
                  <p>No specific deals found in {userLocation?.city || 'this area'}. <br/> Showing global deals instead...</p>
                </div>
              )}
           </div>
        )}
      </main>

      {/* --- FOOTER & MODALS --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
           <div><h4 className="font-black text-slate-900 mb-4">About</h4><ul className="space-y-2 text-sm text-slate-500 font-medium"><li><a href="#">Our Story</a></li><li><a href="#">Careers</a></li></ul></div>
           <div><h4 className="font-black text-slate-900 mb-4">Support</h4><ul className="space-y-2 text-sm text-slate-500 font-medium"><li><a href="#">Help Center</a></li><li><a href="/business">Partner with us</a></li></ul></div>
           <div><h4 className="font-black text-slate-900 mb-4">Follow Us</h4><div className="flex gap-4 text-xl text-slate-400"><i className="fa-brands fa-instagram"></i><i className="fa-brands fa-tiktok"></i></div></div>
        </div>
      </footer>

      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowJoinModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"><i className="fa-solid fa-xmark text-lg"></i></button>
              <div className="text-center mb-10"><h2 className="text-3xl font-black text-slate-900 mb-3">Join Student.LIFE</h2><p className="text-slate-500 font-medium text-lg">Choose how you want to get started.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Link href="/student/signup" className="group bg-slate-50 border-2 border-slate-100 rounded-3xl p-8 hover:border-purple-600 hover:bg-purple-50 transition-all text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-3xl">🎓</div><h3 className="text-xl font-black text-slate-900 mb-2">I'm a Student</h3><div className="mt-6 inline-block bg-white text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors">Join as Student &rarr;</div>
                 </Link>
                 <Link href="/business/signup" className="group bg-slate-50 border-2 border-slate-100 rounded-3xl p-8 hover:border-black hover:bg-slate-100 transition-all text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-3xl">💼</div><h3 className="text-xl font-black text-slate-900 mb-2">I'm a Business</h3><div className="mt-6 inline-block bg-white text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-sm group-hover:bg-black group-hover:text-white transition-colors">Join as Partner &rarr;</div>
                 </Link>
              </div>
           </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"><i className="fa-solid fa-xmark text-lg"></i></button>
              <div className="text-center mb-10"><h2 className="text-3xl font-black text-slate-900 mb-3">Welcome Back</h2><p className="text-slate-500 font-medium text-lg">Who are you logging in as?</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Link href="/student/login" className="group bg-slate-50 border-2 border-slate-100 rounded-3xl p-8 hover:border-purple-600 hover:bg-purple-50 transition-all text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-3xl">🎓</div><h3 className="text-xl font-black text-slate-900 mb-2">Student Login</h3><p className="text-sm text-slate-500 mb-4">Access your ID and discounts.</p><div className="inline-block bg-white text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors">Log in &rarr;</div>
                 </Link>
                 <Link href="/business/login" className="group bg-slate-50 border-2 border-slate-100 rounded-3xl p-8 hover:border-black hover:bg-slate-100 transition-all text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-3xl">📊</div><h3 className="text-xl font-black text-slate-900 mb-2">Partner Login</h3><p className="text-sm text-slate-500 mb-4">Manage your store and deals.</p><div className="inline-block bg-white text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-sm group-hover:bg-black group-hover:text-white transition-colors">Log in &rarr;</div>
                 </Link>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}