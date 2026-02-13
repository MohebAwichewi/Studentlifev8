'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DealsPage() {
    const searchParams = useSearchParams()
    const sortParam = searchParams.get('sort')
    const filterParam = searchParams.get('filter')
    const categoryParam = searchParams.get('category')

    const [loading, setLoading] = useState(true)
    const [deals, setDeals] = useState<any[]>([])
    const [title, setTitle] = useState('All Deals')

    useEffect(() => {
        async function loadDeals() {
            setLoading(true)
            try {
                const res = await fetch('/api/public/deals', { cache: 'no-store' })
                const data = await res.json()

                if (data.success && Array.isArray(data.deals)) {
                    let sortedDeals = [...data.deals]

                    // --- FILTERING LOGIC ---
                    if (filterParam === 'today') {
                        setTitle('New Today')
                        // Filter by last 24h
                        const today = new Date()
                        today.setHours(today.getHours() - 24)
                        sortedDeals = sortedDeals.filter(d => new Date(d.createdAt) > today)
                    } else if (sortParam === 'popular') {
                        setTitle('Most Popular')
                        // Mock popularity sort if backend doesn't support it yet
                        // In real app, API should handle sorting
                    } else if (sortParam === 'featured') {
                        setTitle('Featured Deals')
                        sortedDeals = sortedDeals.filter(d => d.isFeatured)
                    }

                    // --- SORTING LOGIC ---
                    if (sortParam === 'newest') {
                        sortedDeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    }

                    setDeals(sortedDeals)
                }
            } catch (e) {
                console.error("Failed to load deals", e)
            } finally {
                setLoading(false)
            }
        }

        loadDeals()
    }, [sortParam, filterParam, categoryParam])

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans">
            <Navbar />

            <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
                <div className="mb-10 text-center">
                    <span className="text-[#E60023] font-bold uppercase tracking-widest text-xs mb-2 block">Discover</span>
                    <h1 className="text-4xl md:text-6xl font-black text-[#111]">{title}</h1>
                    <p className="text-gray-500 mt-4 text-lg">Browsing {deals.length} deals</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {loading ? (
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="h-[360px] bg-gray-200 rounded-[32px] animate-pulse"></div>
                        ))
                    ) : deals.length > 0 ? (
                        deals.map((deal) => (
                            <Link key={deal.id} href={`/user/deal/${deal.id}`}>
                                <div className="group bg-white rounded-[32px] p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col">
                                    <div className="relative h-[220px] rounded-[24px] overflow-hidden mb-4 bg-gray-50">
                                        {/* Discount Badge */}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black uppercase text-[#E60023] z-10 shadow-sm">
                                            {deal.discount}
                                        </div>

                                        {deal.image || deal.business?.coverImage ? (
                                            <Image
                                                src={deal.image || deal.business?.coverImage}
                                                alt={deal.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300"><i className="fa-solid fa-gift"></i></div>
                                        )}

                                        <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white p-1 shadow-md">
                                            {deal.business?.logo ? (
                                                <Image src={deal.business.logo} alt="Logo" width={32} height={32} className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center font-bold text-xs">{deal.business?.businessName?.[0]}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-2 pb-2 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-[#111] leading-tight line-clamp-2 mb-2 group-hover:text-[#E60023] transition-colors">{deal.title}</h3>
                                        <div className="mt-auto flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                                            <span>{deal.business?.businessName}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span>{deal.category}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            <i className="fa-solid fa-ghost text-4xl mb-4"></i>
                            <p>No deals found.</p>
                        </div>
                    )}
                </div>

            </main>

            <Footer />
        </div>
    )
}
