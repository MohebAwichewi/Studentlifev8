'use client'

import React from 'react'
import Image from 'next/image'

interface DealCardProps {
    deal: any
    saved: boolean
    onToggleSave: (e: React.MouseEvent, dealId: number) => void
    onClick: (deal: any) => void
}

export default function DealCard({ deal, saved, onToggleSave, onClick }: DealCardProps) {
    return (
        <div onClick={() => onClick(deal)} className="group block h-full cursor-pointer">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative h-full flex flex-col">

                {/* Image Container */}
                <div className="aspect-[4/3] bg-slate-50 relative p-8 flex items-center justify-center overflow-hidden">
                    {deal.image ? (
                        <img src={deal.image} alt={deal.title} className="w-full h-full object-contain absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <span className="text-5xl font-black text-slate-200 z-10">{deal.business?.businessName?.charAt(0) || "W"}</span>
                    )}

                    {/* Dark Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-0"></div>

                    {/* Floating Logo */}
                    <div className="absolute bottom-3 left-3 w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center z-10 p-1">
                        {deal.business?.logo ? (
                            <img src={deal.business.logo} alt="brand" className="w-full h-full object-contain" />
                        ) : (
                            <span className="font-bold text-xs text-black">{deal.business?.businessName?.charAt(0) || "W"}</span>
                        )}
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={(e) => onToggleSave(e, deal.id)}
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition shadow-sm group/btn"
                    >
                        {saved ? (
                            <i className="fa-solid fa-heart text-[#FF3B30] text-sm"></i>
                        ) : (
                            <i className="fa-regular fa-heart text-slate-400 group-hover/btn:text-[#FF3B30] text-sm transition-colors"></i>
                        )}
                    </button>

                    {/* Discount Badge */}
                    {deal.discount && (
                        <div className="absolute top-3 left-3 z-20 bg-[#FF3B30] text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                            {deal.discount}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 pt-5 flex flex-col flex-1">
                    <h4 className="font-black text-slate-900 text-lg leading-tight mb-1 line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-black">
                        {deal.title}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                        {deal.business?.businessName || "Partner"}
                    </p>

                    <div className="mt-auto pt-2 flex items-center justify-between">
                        <p className="text-xs text-slate-400 line-clamp-1">
                            {deal.category}
                        </p>
                        {deal.distance !== undefined && (
                            <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                <i className="fa-solid fa-location-dot"></i> {deal.distance.toFixed(1)} km
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
