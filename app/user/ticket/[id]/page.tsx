'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import QRCode from 'react-qr-code'

interface TicketDetail {
    id: number
    code: string
    qrData: string
    createdAt: string
    isUsed: boolean
    deal: {
        id: number
        title: string
        description: string
        discount: string
        image: string
        expiry: string | null
        category: string
    }
    business: {
        name: string
        logo: string | null
        address: string
        latitude: number
        longitude: number
    }
}

export default function TicketPage() {
    const router = useRouter()
    const params = useParams()
    const ticketId = params.id as string

    const [loading, setLoading] = useState(true)
    const [ticket, setTicket] = useState<TicketDetail | null>(null)
    const [showSendModal, setShowSendModal] = useState(false)
    const [sendMethod, setSendMethod] = useState<'email' | 'sms'>('email')
    const [sendValue, setSendValue] = useState('')
    const [sending, setSending] = useState(false)

    useEffect(() => {
        const loadTicket = async () => {
            const email = localStorage.getItem('userEmail')
            if (!email) {
                router.push('/user/login')
                return
            }

            try {
                // Fetch all tickets and find the one we need
                const res = await fetch('/api/auth/user/my-tickets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                })

                if (res.ok) {
                    const data = await res.json()
                    const allTickets = [...data.activeTickets, ...data.usedTickets]
                    const foundTicket = allTickets.find(t => t.id === parseInt(ticketId))

                    if (foundTicket) {
                        setTicket(foundTicket)
                    } else {
                        router.push('/user/wallet')
                    }
                }
            } catch (error) {
                console.error('Failed to load ticket:', error)
            } finally {
                setLoading(false)
            }
        }

        loadTicket()
    }, [router, ticketId])

    const handleSendToPhone = async () => {
        if (!sendValue) return

        setSending(true)
        // TODO: Implement actual send functionality
        setTimeout(() => {
            setSending(false)
            setShowSendModal(false)
            alert(`Ticket sent to ${sendValue}!`)
        }, 1500)
    }

    const getTimeRemaining = (expiry: string | null) => {
        if (!expiry) return null
        const now = new Date()
        const expiryDate = new Date(expiry)
        const diff = expiryDate.getTime() - now.getTime()

        if (diff <= 0) return 'Expired'

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) return `${days}d ${hours}h remaining`
        if (hours > 0) return `${hours}h ${minutes}m remaining`
        return `${minutes}m remaining`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white font-medium">Loading ticket...</p>
                </div>
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white font-medium">Ticket not found</p>
                    <Link href="/user/wallet" className="text-[#FF3B30] mt-4 inline-block">
                        Back to Wallet
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-[600px] mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/user/wallet" className="text-white/60 hover:text-white transition">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Back
                    </Link>
                    <h1 className="font-black text-lg">Your Ticket</h1>
                    <button
                        onClick={() => setShowSendModal(true)}
                        className="text-white/60 hover:text-white transition"
                    >
                        <i className="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[600px] mx-auto px-4 py-8">
                {/* Status Badge */}
                <div className="text-center mb-8">
                    {ticket.isUsed ? (
                        <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-bold text-sm border border-green-500/30">
                            <i className="fa-solid fa-circle-check"></i>
                            Redeemed
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 bg-[#FF3B30]/20 text-[#FF3B30] px-4 py-2 rounded-full font-bold text-sm border border-[#FF3B30]/30 animate-pulse">
                            <i className="fa-solid fa-circle"></i>
                            Ready to Scan
                        </div>
                    )}
                </div>

                {/* QR Code Card */}
                <div className="bg-white rounded-3xl p-8 mb-6 shadow-2xl">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">{ticket.deal.discount}</h2>
                        <p className="text-slate-600 font-medium">{ticket.business.name}</p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-6 rounded-2xl border-4 border-slate-900 mb-6 flex items-center justify-center">
                        <QRCode
                            value={ticket.qrData}
                            size={256}
                            level="H"
                            className="w-full h-auto max-w-[256px]"
                        />
                    </div>

                    {/* Alphanumeric Code */}
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                            Ticket Code
                        </p>
                        <p className="text-2xl font-mono font-black text-slate-900 tracking-wider bg-slate-50 py-3 rounded-xl border-2 border-dashed border-slate-200">
                            {ticket.code}
                        </p>
                    </div>
                </div>

                {/* Deal Info */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image
                                src={ticket.deal.image || '/placeholder-deal.jpg'}
                                alt={ticket.deal.title}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-lg mb-1">{ticket.deal.title}</h3>
                            <p className="text-sm text-white/60">{ticket.deal.description}</p>
                        </div>
                    </div>

                    {/* Expiry */}
                    {ticket.deal.expiry && !ticket.isUsed && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                            <i className="fa-solid fa-clock text-amber-400 text-xl"></i>
                            <div>
                                <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">
                                    Expires
                                </p>
                                <p className="text-amber-400 font-black">
                                    {getTimeRemaining(ticket.deal.expiry)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Merchant Info */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                    <h4 className="font-black text-sm uppercase tracking-wider text-white/40 mb-4">
                        Merchant Location
                    </h4>
                    <div className="flex items-start gap-3 mb-4">
                        <i className="fa-solid fa-location-dot text-[#FF3B30] text-xl mt-1"></i>
                        <div>
                            <p className="font-bold mb-1">{ticket.business.name}</p>
                            <p className="text-sm text-white/60">{ticket.business.address}</p>
                        </div>
                    </div>
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${ticket.business.latitude},${ticket.business.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-white/10 hover:bg-white/20 text-white text-center py-3 rounded-xl font-bold transition"
                    >
                        <i className="fa-solid fa-map-location-dot mr-2"></i>
                        Open in Maps
                    </a>
                </div>

                {/* Instructions */}
                {!ticket.isUsed && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                        <h4 className="font-black text-sm uppercase tracking-wider text-blue-300 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-circle-info"></i>
                            How to Redeem
                        </h4>
                        <ol className="space-y-2 text-sm text-blue-100">
                            <li className="flex gap-3">
                                <span className="font-black">1.</span>
                                <span>Show this QR code to the merchant at checkout</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-black">2.</span>
                                <span>They will scan it to verify your ticket</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-black">3.</span>
                                <span>Enjoy your discount!</span>
                            </li>
                        </ol>
                    </div>
                )}

                {/* Send to Phone Button */}
                {!ticket.isUsed && (
                    <button
                        onClick={() => setShowSendModal(true)}
                        className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold transition border border-white/20"
                    >
                        <i className="fa-solid fa-mobile-screen mr-2"></i>
                        Send to Phone
                    </button>
                )}
            </div>

            {/* Send Modal */}
            {showSendModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black">Send Ticket</h3>
                            <button
                                onClick={() => setShowSendModal(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Method Selector */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSendMethod('email')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition ${sendMethod === 'email'
                                            ? 'bg-[#FF3B30] text-white'
                                            : 'bg-white/10 text-white/60'
                                        }`}
                                >
                                    <i className="fa-solid fa-envelope mr-2"></i>
                                    Email
                                </button>
                                <button
                                    onClick={() => setSendMethod('sms')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition ${sendMethod === 'sms'
                                            ? 'bg-[#FF3B30] text-white'
                                            : 'bg-white/10 text-white/60'
                                        }`}
                                >
                                    <i className="fa-solid fa-message mr-2"></i>
                                    SMS
                                </button>
                            </div>

                            {/* Input */}
                            <input
                                type={sendMethod === 'email' ? 'email' : 'tel'}
                                placeholder={sendMethod === 'email' ? 'your@email.com' : '+216 XX XXX XXX'}
                                value={sendValue}
                                onChange={(e) => setSendValue(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#FF3B30]"
                            />

                            {/* Send Button */}
                            <button
                                onClick={handleSendToPhone}
                                disabled={!sendValue || sending}
                                className="w-full bg-[#FF3B30] hover:bg-[#d63026] disabled:bg-white/10 disabled:text-white/40 text-white py-3 rounded-xl font-bold transition"
                            >
                                {sending ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-paper-plane mr-2"></i>
                                        Send Ticket
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
