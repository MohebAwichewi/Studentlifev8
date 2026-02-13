'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import QRCode from 'react-qr-code'

interface DealDetail {
    id: number
    title: string
    description: string
    discountValue: string
    image: string
    expiry: string | null
    category: string
    isMultiUse: boolean
    maxClaimsPerUser: number
    totalInventory: number | null
    business: {
        businessName: string
        logo: string | null
        address: string
        latitude: number
        longitude: number
    }
}

export default function ClaimDealPage() {
    const router = useRouter()
    const params = useParams()
    const dealId = params.id as string

    const [loading, setLoading] = useState(true)
    const [deal, setDeal] = useState<DealDetail | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [claiming, setClaiming] = useState(false)
    const [success, setSuccess] = useState(false)
    const [generatedCode, setGeneratedCode] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const loadDeal = async () => {
            try {
                // Fetch deal details
                const res = await fetch('/api/public/deals')
                const data = await res.json()

                if (data.success) {
                    const foundDeal = data.deals.find((d: any) => d.id === parseInt(dealId))
                    if (foundDeal) {
                        setDeal(foundDeal)
                    } else {
                        setError('Deal not found')
                    }
                }
            } catch (err) {
                console.error('Failed to load deal:', err)
                setError('Failed to load deal')
            } finally {
                setLoading(false)
            }
        }

        loadDeal()
    }, [dealId])

    const handleClaim = async () => {
        const email = localStorage.getItem('userEmail')
        if (!email) {
            router.push('/user/login')
            return
        }

        if (!acceptedTerms) {
            setError('Please accept the terms and conditions')
            return
        }

        setClaiming(true)
        setError('')

        try {
            const res = await fetch('/api/auth/user/claim-deal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    dealId: parseInt(dealId)
                })
            })

            const data = await res.json()

            if (data.success) {
                setGeneratedCode(data.code)
                setSuccess(true)
            } else {
                setError(data.error || 'Failed to claim deal')
            }
        } catch (err) {
            console.error('Claim error:', err)
            setError('Failed to claim deal. Please try again.')
        } finally {
            setClaiming(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading deal...</p>
                </div>
            </div>
        )
    }

    if (error && !deal) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-exclamation-triangle text-2xl text-red-500"></i>
                    </div>
                    <p className="text-slate-900 font-bold mb-2">{error}</p>
                    <Link href="/user/home" className="text-[#FF3B30] font-bold">
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    if (!deal) return null

    // Success Modal
    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* Success Animation */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <i className="fa-solid fa-check text-4xl"></i>
                        </div>
                        <h2 className="text-3xl font-black mb-2">Ticket Generated!</h2>
                        <p className="text-white/60">Your deal is ready to redeem</p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white rounded-3xl p-8 mb-6">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 mb-1">{deal.discountValue}</h3>
                            <p className="text-slate-600 text-sm">{deal.business.businessName}</p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border-4 border-slate-900 mb-4 flex items-center justify-center">
                            <QRCode
                                value={generatedCode}
                                size={200}
                                level="H"
                            />
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Ticket Code</p>
                            <p className="text-lg font-mono font-black text-slate-900 bg-slate-50 py-2 rounded-lg">
                                {generatedCode}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            href={`/user/ticket/${generatedCode}`}
                            className="block w-full bg-[#FF3B30] hover:bg-[#d63026] text-white text-center py-4 rounded-xl font-bold transition"
                        >
                            <i className="fa-solid fa-ticket mr-2"></i>
                            View Full Ticket
                        </Link>
                        <Link
                            href="/user/wallet"
                            className="block w-full bg-white/10 hover:bg-white/20 text-white text-center py-4 rounded-xl font-bold transition"
                        >
                            <i className="fa-solid fa-wallet mr-2"></i>
                            Go to Wallet
                        </Link>
                        <Link
                            href="/user/home"
                            className="block w-full text-white/60 hover:text-white text-center py-4 font-bold transition"
                        >
                            Browse More Deals
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Claim Flow
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-[800px] mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href={`/user/deal/${dealId}`} className="text-slate-600 hover:text-black transition">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Back
                    </Link>
                    <h1 className="text-lg font-black text-slate-900">Claim Deal</h1>
                    <div className="w-20"></div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-[800px] mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Deal Summary */}
                    <div>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-6">
                            <div className="relative h-64">
                                <Image
                                    src={deal.image || '/placeholder-deal.jpg'}
                                    alt={deal.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute top-4 left-4 bg-[#FF3B30] text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                                    {deal.discountValue}
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h2 className="text-white font-black text-2xl drop-shadow-md mb-1">
                                        {deal.title}
                                    </h2>
                                    <p className="text-white/90 text-sm">{deal.business.businessName}</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-slate-600 mb-4">{deal.description}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <i className="fa-solid fa-tag text-slate-400"></i>
                                        <span className="text-slate-600">{deal.category}</span>
                                    </div>
                                    {deal.expiry && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <i className="fa-solid fa-clock text-slate-400"></i>
                                            <span className="text-slate-600">
                                                Valid until {new Date(deal.expiry).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm">
                                        <i className="fa-solid fa-location-dot text-slate-400"></i>
                                        <span className="text-slate-600">{deal.business.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-48">
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${deal.business.latitude},${deal.business.longitude}`}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>

                    {/* Right: Claim Form */}
                    <div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
                            <h3 className="text-xl font-black text-slate-900 mb-6">Confirm Your Claim</h3>

                            {/* Quantity Selector (if multi-use) */}
                            {deal.isMultiUse && deal.maxClaimsPerUser > 1 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Quantity
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center font-bold"
                                            disabled={quantity <= 1}
                                        >
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="text-2xl font-black w-12 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(deal.maxClaimsPerUser, quantity + 1))}
                                            className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center font-bold"
                                            disabled={quantity >= deal.maxClaimsPerUser}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Max {deal.maxClaimsPerUser} per user
                                    </p>
                                </div>
                            )}

                            {/* Inventory Warning */}
                            {deal.totalInventory && deal.totalInventory < 10 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <i className="fa-solid fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                                        <div>
                                            <p className="text-sm font-bold text-amber-900">Limited Availability</p>
                                            <p className="text-xs text-amber-700">Only {deal.totalInventory} tickets left!</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Terms */}
                            <div className="bg-slate-50 rounded-xl p-4 mb-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Terms & Conditions</h4>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    <li>• Valid for one-time use at {deal.business.businessName}</li>
                                    <li>• Must present QR code at checkout</li>
                                    <li>• Cannot be combined with other offers</li>
                                    {deal.expiry && <li>• Expires on {new Date(deal.expiry).toLocaleDateString()}</li>}
                                </ul>
                            </div>

                            {/* Accept Terms */}
                            <label className="flex items-start gap-3 mb-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-slate-300 text-[#FF3B30] focus:ring-[#FF3B30]"
                                />
                                <span className="text-sm text-slate-600">
                                    I accept the terms and conditions and understand this deal is non-refundable
                                </span>
                            </label>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Claim Button */}
                            <button
                                onClick={handleClaim}
                                disabled={!acceptedTerms || claiming}
                                className="w-full bg-[#FF3B30] hover:bg-[#d63026] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition text-lg"
                            >
                                {claiming ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                        Generating Ticket...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-ticket mr-2"></i>
                                        Claim Deal
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-slate-400 text-center mt-4">
                                Free • No payment required
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
