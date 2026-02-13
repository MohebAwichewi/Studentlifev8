'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import QRCode from "react-qr-code"

export default function MyWalletPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<'active' | 'history'>(
        searchParams.get('tab') === 'history' ? 'history' : 'active'
    )

    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const email = localStorage.getItem('userEmail')
        if (!email) {
            router.push('/user/login')
            return
        }

        async function fetchData() {
            try {
                // Fetch tickets
                const res = await fetch('/api/auth/user/my-tickets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                })
                const data = await res.json()
                if (data.tickets) {
                    setTickets(data.tickets)
                }
            } catch (e) {
                console.error("Failed to load wallet", e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [router])

    const activeTickets = tickets.filter(t => !t.isUsed)
    const usedTickets = tickets.filter(t => t.isUsed)

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center px-4">
                <div className="max-w-xl mx-auto w-full flex items-center justify-between">
                    <Link href="/user/dashboard" className="text-slate-500 hover:text-black transition">
                        <i className="fa-solid fa-arrow-left text-xl"></i>
                    </Link>
                    <h1 className="font-black text-lg tracking-tight">My Wallet</h1>
                    <div className="w-8"></div>
                </div>
            </nav>

            <main className="max-w-xl mx-auto px-4 py-6">

                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-8 border border-slate-100">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-[#D90020] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Active Tickets
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        History
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20">
                        <i className="fa-solid fa-circle-notch fa-spin text-black text-2xl"></i>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {(activeTab === 'active' ? activeTickets : usedTickets).length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="text-5xl mb-4 opacity-50">🎟️</div>
                                <h3 className="font-bold text-slate-900">No {activeTab} tickets</h3>
                                <p className="text-slate-500 text-sm mt-1">Go to the dashboard to find deals!</p>
                                <Link href="/user/dashboard" className="inline-block mt-4 px-6 py-2 bg-[#D90020] text-white rounded-full font-bold text-sm shadow-lg shadow-red-200">
                                    Find Deals
                                </Link>
                            </div>
                        ) : (
                            (activeTab === 'active' ? activeTickets : usedTickets).map(ticket => (
                                <div key={ticket.id} className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative">
                                    {/* Ticket Header */}
                                    <div className={`p-6 ${ticket.isUsed ? 'bg-slate-100 grayscale' : 'bg-gradient-to-br from-[#D90020] to-[#B0001A]'} text-white relative overflow-hidden`}>
                                        <div className="relative z-10 flex gap-4">
                                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm shrink-0">
                                                {ticket.deal.business?.logo ? (
                                                    <img src={ticket.deal.business.logo} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-black font-black text-xl">{ticket.deal.business?.businessName?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl leading-tight mb-1">{ticket.deal.title}</h3>
                                                <p className="font-medium opacity-90 text-sm">{ticket.deal.business?.businessName}</p>
                                            </div>
                                        </div>

                                        {/* Decorative Circles */}
                                        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#F8FAFC] rounded-full"></div>
                                        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#F8FAFC] rounded-full"></div>
                                    </div>

                                    {/* Ticket Body (QR) */}
                                    <div className="p-8 flex flex-col items-center justify-center bg-white relative">
                                        <div className="border border-dashed border-slate-200 w-full absolute top-0"></div>

                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
                                            <QRCode value={ticket.code} size={150} />
                                        </div>

                                        <div className="text-center">
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">TICKET CODE</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-wider font-mono">{ticket.code}</p>
                                        </div>

                                        {ticket.isUsed && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
                                                <div className="bg-black text-white px-6 py-2 rounded-full font-black -rotate-6 shadow-xl border-2 border-white">
                                                    REDEEMED
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                                        <p className="text-xs text-slate-500 font-medium">
                                            Show this to the cashier to redeem
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </main>
        </div>
    )
}
