'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface DealRowProps {
    title: string
    subtitle?: string
    viewAllLink: string
    deals: any[]
    loading?: boolean
}

export default function DealRow({ title, subtitle, viewAllLink, deals, loading }: DealRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef
            const scrollAmount = direction === 'left' ? -300 : 300
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    return (
        <section className="py-12 border-b border-gray-100 last:border-0 relative">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* Header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#111] mb-2 tracking-tight">{title}</h2>
                        {subtitle && <p className="text-gray-500 font-medium">{subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href={viewAllLink} className="hidden md:flex items-center gap-2 font-bold text-[#E60023] hover:gap-3 transition-all text-sm uppercase tracking-wide">
                            View All <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                        <div className="flex gap-2">
                            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory scrollbar-hide -mx-6 px-6"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="min-w-[280px] h-[360px] bg-gray-100 rounded-[32px] animate-pulse snap-center"></div>
                        ))
                    ) : (
                        deals.map((deal, index) => (
                            <Link key={deal.id} href={`/user/deal/${deal.id}`} className="block min-w-[280px] snap-center group">
                                <article className="bg-white p-3 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">

                                    {/* Image */}
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
                                            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                                                <i className="fa-solid fa-gift"></i>
                                            </div>
                                        )}

                                        {/* Logo */}
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
                                        <h3 className="text-lg font-bold text-[#111] leading-tight line-clamp-2 mb-2 group-hover:text-[#E60023] transition-colors">
                                            {deal.title}
                                        </h3>
                                        <div className="mt-auto flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                                            <span>{deal.business?.businessName}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span>{deal.category}</span>
                                        </div>
                                    </div>

                                </article>
                            </Link>
                        ))
                    )}
                </div>

            </div>
        </section>
    )
}
