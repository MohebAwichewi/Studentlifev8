'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'


// --- FETCHED DATA FROM API ---

export default function LandingPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // --- LOAD LIVE DEALS ---
  useEffect(() => {
    async function loadDeals() {
      try {
        const res = await fetch('/api/public/deals', { cache: 'no-store' })
        const data = await res.json()
        if (data.success) {
          setDeals(data.deals)
        } else {
          setDeals([])
        }
      } catch (e) {
        console.error(e)
        setDeals([])
      } finally {
        setLoading(false)
      }
    }
    loadDeals()
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-black selection:text-white pt-[70px]">

      {/* ==================== 1. NAVBAR (Sticky Top) ==================== */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200 h-[70px] transition-all shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 h-full flex items-center justify-between gap-4">

          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-slate-900 hover:bg-slate-100 rounded-full transition"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>

            {/* ✅ UPDATED LOGO STYLE */}
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-2xl font-black tracking-tighter text-slate-900">Student</span>
              <span className="bg-[#FF3B30] text-white px-1.5 py-0.5 rounded text-lg font-black tracking-wide transform -rotate-2 group-hover:rotate-0 transition-transform">.LIFE</span>
            </Link>
          </div>

          {/* Center: Search Bar (Hidden on Mobile) */}
          <div className="hidden md:block flex-1 max-w-xl relative">
            <input
              type="text"
              placeholder="Search brands..."
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 rounded-md py-2.5 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-500 transition-all"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-3 text-slate-400"></i>
          </div>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-900 p-2">
              <i className="fa-solid fa-magnifying-glass text-xl"></i>
            </button>
            <Link href="/student/login" className="hidden sm:block text-sm font-bold text-slate-900 px-4 py-2 hover:text-slate-600 transition">
              Log in
            </Link>
            <Link href="/student/signup" className="bg-black text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-slate-800 transition shadow-sm whitespace-nowrap">
              Join now
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================== 2. WELCOME BANNER (Static) ==================== */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/hero-bg.jpg" // Ensure this image is in your public folder
              alt="Welcome to Student Life"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/30"></div> {/* Dark overlay for text readability */}
          </div>

          {/* Welcome Text Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
            <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg mb-4 tracking-tight">
              Welcome to Student life
            </h1>
            <p className="text-xl md:text-2xl font-medium text-white/90 drop-shadow-md max-w-2xl">
              Unlock exclusive student offers, experiences, and more.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 3. DEAL GRID (Cards) ==================== */}
      <main className="max-w-[1440px] mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Current Offers</h2>

          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <div key={i} className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6">
            {deals.map((deal) => (
              <Link href={`/student/deal/${deal.id}`} key={deal.id} className="group block">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative h-full flex flex-col">

                  {/* Image Container - Full Bleed */}
                  <div className="aspect-[4/3] bg-slate-50 relative flex items-center justify-center overflow-hidden">
                    {deal.image ? (
                      <img src={deal.image} alt={deal.title} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-5xl font-black text-slate-200 z-10">{deal.brand?.charAt(0) || "S"}</span>
                    )}

                    {/* Overlay Gradient on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-0"></div>

                    {/* Floating Logo - Full bleed inside box */}
                    <div className="absolute bottom-3 left-3 w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center z-10 overflow-hidden">
                      {deal.business?.logo ? (
                        <img src={deal.business.logo} alt="brand" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-xs text-black">{deal.brand?.charAt(0) || "S"}</span>
                      )}
                    </div>

                    {/* Heart Icon */}
                    <div className="absolute top-3 right-3 z-20">
                      <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition shadow-sm group/btn">
                        <i className="fa-regular fa-heart text-slate-400 group-hover/btn:text-[#FF3B30] text-sm transition-colors"></i>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 pt-5 flex flex-col flex-1">
                    {deal.discountValue && (
                      <span className="inline-block bg-[#FF3B30] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-sm w-fit mb-2 tracking-wider">
                        {deal.discountValue} OFF
                      </span>
                    )}
                    <h4 className="font-black text-slate-900 text-lg leading-tight mb-1 line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-black">
                      {deal.title}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                      {deal.brand || deal.business?.businessName}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-auto pt-2">
                      Online & In-Store
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ==================== 4. HAMBURGER MENU (Sidebar) ==================== */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Menu Panel */}
      <div className={`fixed top-0 left-0 h-full w-[320px] bg-white z-[100] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="p-5 flex justify-between items-center border-b border-slate-100">
          <span className="text-xl font-black text-slate-900">Menu</span>
          <button onClick={() => setIsMenuOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition text-slate-900">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">

          {/* Mobile Auth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-8 md:hidden">
            <Link href="/student/login" className="py-3 text-center border-2 border-slate-100 rounded-lg font-bold text-slate-900 hover:border-slate-300 transition">Log in</Link>
            <Link href="/student/signup" className="py-3 text-center bg-black text-white rounded-lg font-bold hover:bg-slate-800 transition">Join now</Link>
          </div>

          {/* Main Links */}
          <div className="space-y-6">

            {/* ✅ Categories Removed Here */}

            {/* ✅ PARTNER SECTION */}
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">For Businesses</p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <Link href="/business" className="block mb-3">
                  <h4 className="font-black text-slate-900 mb-1">Partner with us</h4>
                  <p className="text-xs text-slate-500">Reach millions of students and grow your brand.</p>
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Link href="/business/login" className="text-center py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-400 transition">
                    Business Login
                  </Link>
                  <Link href="/business/signup" className="text-center py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition">
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <Link href="/admin/login" className="flex justify-between items-center p-3 -mx-3 rounded-lg hover:bg-slate-50 group transition">

              </Link>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100">
          {/* Legal Links */}
          <div className="flex justify-center gap-4 mb-3">
            <Link href="/about" className="text-xs text-slate-400 hover:text-slate-600 font-bold transition">
              About
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/privacy-policy" className="text-xs text-slate-400 hover:text-slate-600 font-bold transition">
              Privacy Policy
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-600 font-bold transition">
              Terms of Service
            </Link>
          </div>
          <p className="text-xs font-bold text-slate-300 text-center">© 2026 Student.LIFE UK</p>
        </div>
      </div>

    </div>
  )
}