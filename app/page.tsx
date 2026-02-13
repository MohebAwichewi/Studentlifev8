'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'

export default function GuestHome() {
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([]) // Added state
  const [searchQuery, setSearchQuery] = useState('')
  const [heroConfig, setHeroConfig] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Parallel Fetch
        const [dealsRes, heroRes, catRes] = await Promise.all([
          fetch('/api/public/deals', { cache: 'no-store' }),
          fetch('/api/public/homepage', { cache: 'no-store' }),
          fetch('/api/public/categories') // Added fetch
        ])

        const dealsData = await dealsRes.json()
        if (dealsData.success && Array.isArray(dealsData.deals)) {
          setDeals(dealsData.deals)
        }

        const heroData = await heroRes.json()
        if (heroData.hero_main) {
          setHeroConfig(heroData.hero_main)
        }

        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData)
        }

      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter deals based on search
  const filteredDeals = deals.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.business?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Default Fallback Config
  const leftBlock = heroConfig?.leftBlock || {
    title: 'Spend less.<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-[#E60023] to-orange-500">Live more.</span>',
    subtitle: 'Unlock exclusive discounts at your favorite local spots. Food, fashion, tech, and gym memberships—all in one place.',
    buttonText: 'Start Saving Free',
    buttonLink: '/user/signup',
    badgeText: 'Student Life, Levelled Up',
    mediaType: 'color',
    mediaUrl: '#111'
  }

  const rightBlock = heroConfig?.rightBlock || {
    title: '50% OFF',
    subtitle: 'Burgers & Fries',
    buttonText: '',
    badgeText: 'Verified',
    mediaType: 'color',
    mediaUrl: '#E60023'
  }


  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-[#E60023] selection:text-white">

      {/* 1. MODERN NAVBAR */}
      <Navbar />

      {/* 2. HERO SECTION (BENTO GRID) */}
      <section className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

          {/* A. BIG TITLE TILE (Span 8) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-8 row-span-2 rounded-[40px] p-10 md:p-14 relative overflow-hidden flex flex-col justify-center text-white group"
            style={{
              backgroundColor: leftBlock.mediaType === 'color' ? leftBlock.mediaUrl : '#111',
              backgroundImage: leftBlock.mediaType === 'image' ? `url(${leftBlock.mediaUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {leftBlock.mediaType === 'video' && (
              <video src={leftBlock.mediaUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" />
            )}

            {/* Overlay if Media is used */}
            {leftBlock.mediaType !== 'color' && <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>}

            {/* Abstract BG (Only if color) */}
            {leftBlock.mediaType === 'color' && (
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E60023] to-purple-600 rounded-full blur-[120px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
            )}

            <div className="relative z-10">
              <span className="inline-block py-1 px-3 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6 text-gray-300 backdrop-blur-sm">
                {leftBlock.badgeText}
              </span>
              <h1
                className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight mb-8"
                dangerouslySetInnerHTML={{ __html: leftBlock.title }}
              >
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-lg mb-10 font-medium drop-shadow-md">
                {leftBlock.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={leftBlock.buttonLink || '/user/signup'} className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                  {leftBlock.buttonText}
                </Link>
                <Link href="/business" className="px-8 py-4 bg-[#222]/80 backdrop-blur-md text-white border border-white/10 rounded-full font-bold text-lg hover:bg-[#333] transition-colors">
                  For Business
                </Link>
              </div>
            </div>
          </motion.div>

          {/* B. VISUAL TILE (Span 4) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 row-span-2 rounded-[40px] relative overflow-hidden flex items-center justify-center p-8 text-white min-h-[400px]"
            style={{
              backgroundColor: rightBlock.mediaType === 'color' ? rightBlock.mediaUrl : '#E60023',
              backgroundImage: rightBlock.mediaType === 'image' ? `url(${rightBlock.mediaUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {rightBlock.mediaType === 'video' && (
              <video src={rightBlock.mediaUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" />
            )}

            {rightBlock.mediaType !== 'color' && <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>}

            {rightBlock.mediaType === 'color' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>}

            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 text-center"
            >
              {/* If Using Image/Video, hide default Burger Emoji unless it's color mode related or we want a default icon? 
                  Let's assume Right Block is mostly visual. 
                  If user sets title/subtitle, we show them. 
              */}
              {rightBlock.mediaType === 'color' && rightBlock.title.includes('50%') && (
                <div className="text-[120px] leading-none mb-4 drop-shadow-2xl">🍔</div>
              )}

              <div
                className="text-3xl font-black tracking-tight drop-shadow-lg"
                dangerouslySetInnerHTML={{ __html: rightBlock.title }}
              ></div>
              <div className="text-white/90 font-medium drop-shadow-md">{rightBlock.subtitle}</div>

              {/* Floating Tags - Keep Hardcoded for style or make dynamic later? 
                  User didn't explicitly ask for dynamic tags here, but "Badge" text is one of them.
              */}
              <div className="absolute -top-10 -right-10 bg-white text-[#E60023] px-4 py-2 rounded-xl font-bold rotate-12 shadow-lg text-sm">
                {rightBlock.badgeText}
              </div>
            </motion.div>
          </motion.div>

          {/* C. SEARCH BAR TILE (Span 12) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-12 bg-white rounded-[32px] p-3 shadow-xl shadow-gray-200/50 flex items-center border border-gray-100 relative group focus-within:ring-4 focus-within:ring-red-500/10 transition-shadow"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-focus-within:bg-[#E60023] group-focus-within:text-white transition-colors duration-300">
              <i className="fa-solid fa-magnifying-glass text-xl"></i>
            </div>
            <input
              type="text"
              placeholder="Search for 'Nike', 'Pizza', 'Gym'..."
              className="flex-1 h-full px-6 text-lg font-bold text-[#111] placeholder-gray-400 outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="hidden md:flex gap-2 pr-4">
              <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase">CMD + K</span>
            </div>
          </motion.div>

          {/* D. STATS TILE (Span 3) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3 bg-white rounded-[32px] p-6 border border-gray-100 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
              <i className="fa-solid fa-check text-xl"></i>
            </div>
            <div>
              <h3 className="text-4xl font-black text-[#111]">500+</h3>
              <p className="text-gray-500 font-medium">Deals Verified</p>
            </div>
          </motion.div>

          {/* E. CATEGORIES TILE (Span 9) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-9 bg-[#F3F4F6] rounded-[32px] p-8 flex items-center justify-between overflow-hidden relative"
          >
            <div className="relative z-10 max-w-md">
              <h3 className="text-2xl font-black text-[#111] mb-2">Explore Categories</h3>
              <p className="text-gray-500 mb-6">From fashion drops to cheat meals, we got you.</p>
              <div className="flex gap-2 flex-wrap">
                {['Food', 'Fashion', 'Tech', 'Fitness', 'Travel'].map(cat => (
                  <Link key={cat} href={`/category/${cat.toLowerCase()}`} className="px-4 py-2 bg-white rounded-full text-sm font-bold text-[#111] hover:bg-[#E60023] hover:text-white transition-colors shadow-sm">
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            {/* Decorative Icons */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-9xl opacity-5 rotate-12 pointer-events-none select-none">
              🔥
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2.5 WHY CHOOSE WIN SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-[#111] mb-6 tracking-tight">Why Choose WIN?</h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
              Unlocking the best local brands for food, fashion, and fun.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {/* Col 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center group"
            >
              <div className="w-40 h-40 mb-8 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-red-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out"></div>
                <span className="text-8xl drop-shadow-2xl filter group-hover:scale-110 transition-transform duration-500 cursor-default">🍔</span>
              </div>
              <h3 className="text-2xl font-black text-[#111] mb-4 group-hover:text-[#E60023] transition-colors">Eat Like a King</h3>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xs">Exclusive discounts at the best restaurants and fast food spots in your city.</p>
            </motion.div>

            {/* Col 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center group"
            >
              <div className="w-40 h-40 mb-8 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out"></div>
                <span className="text-8xl drop-shadow-2xl filter group-hover:scale-110 transition-transform duration-500 cursor-default">👟</span>
              </div>
              <h3 className="text-2xl font-black text-[#111] mb-4 group-hover:text-[#E60023] transition-colors">Shop the Trends</h3>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xs">Unbeatable deals on top fashion brands, electronics, and daily essentials.</p>
            </motion.div>

            {/* Col 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center group"
            >
              <div className="w-40 h-40 mb-8 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-purple-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out"></div>
                <span className="text-8xl drop-shadow-2xl filter group-hover:scale-110 transition-transform duration-500 cursor-default">🎟️</span>
              </div>
              <h3 className="text-2xl font-black text-[#111] mb-4 group-hover:text-[#E60023] transition-colors">Instant Savings</h3>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xs">No waiting. Just claim your ticket, scan your QR code, and save instantly.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. LIVE DEALS GRID */}
      <section className="px-6 max-w-[1400px] mx-auto pb-32">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-[#111] mb-2">Trending Now</h2>
            <p className="text-gray-500 text-lg">Fresh drops you don't want to miss.</p>
          </div>
          <Link href="/deals" className="hidden md:flex items-center gap-2 font-bold text-[#E60023] hover:gap-3 transition-all">
            View All Deals <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="h-[320px] bg-gray-200 rounded-[32px] animate-pulse"></div>
            ))
          ) : (filteredDeals.length > 0 ? filteredDeals : deals).slice(0, 8).map((deal, index) => (
            <Link key={deal.id} href={`/user/deal/${deal.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-[32px] p-3 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-[200px] rounded-[24px] overflow-hidden mb-4 bg-gray-100">
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black uppercase text-[#E60023] z-10 shadow-sm">
                    {deal.discount}
                  </div>

                  {/* Like Button */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-[#E60023] backdrop-blur-md flex items-center justify-center text-white z-10 transition-colors">
                    <i className="fa-solid fa-heart text-xs"></i>
                  </div>

                  {deal.image || deal.business?.coverImage ? (
                    <Image
                      src={deal.image || deal.business?.coverImage}
                      alt={deal.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 bg-gray-50">
                      <i className="fa-solid fa-gift"></i>
                    </div>
                  )}

                  {/* Logo Overlay */}
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white p-1 shadow-md">
                    {deal.business?.logo ? (
                      <Image src={deal.business.logo} alt="Logo" width={32} height={32} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center font-bold text-xs">{deal.business?.businessName?.[0]}</div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="px-2 pb-2 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#111] leading-tight line-clamp-2 mb-1 group-hover:text-[#E60023] transition-colors">{deal.title}</h3>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{deal.business?.businessName}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-xs font-medium text-gray-400">{deal.category}</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FOOTER CTA */}
      <section className="bg-black py-24 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E60023] rounded-full blur-[150px] opacity-10"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Ready to verify?</h2>
          <p className="text-xl text-gray-400 mb-10">Join thousands of students saving money every single day. One app, endless perks.</p>
          <Link href="/user/signup" className="inline-block px-10 py-5 bg-white text-black rounded-full text-xl font-bold hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all">
            Get Your ID
          </Link>
        </div>
      </section>

    </div>
  )
}