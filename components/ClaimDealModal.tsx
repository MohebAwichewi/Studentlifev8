'use client'

import React, { useState } from 'react'
import QRCode from "react-qr-code"

interface ClaimDealModalProps {
    isOpen: boolean
    onClose: () => void
    deal: any
    userEmail: string
}

export default function ClaimDealModal({ isOpen, onClose, deal, userEmail }: ClaimDealModalProps) {
    const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'TICKET'>('DETAILS')
    const [loading, setLoading] = useState(false)
    const [ticketCode, setTicketCode] = useState('')

    if (!isOpen || !deal) return null

    const handleClaim = async () => {
        setLoading(true)
        try {
            // ✅ Use Server Action
            const { createTicket } = await import('@/app/actions/ticket')
            // Note: We are passing email, so we need to ensure the server action handles it
            // OR we fix the prop to be userId. 
            // Let's assume we pass what we have, and I will update the server action to handle the lookup if needed
            // But wait, the previous code passed `userEmail` to `claimDeal`.
            // I will update the action to be robust. 

            // Actually, let's fix the prop name in the component to match reality or logic.
            // If the prompt says "userEmail", I will use it to find the user.
            const result = await createTicket(deal.id, userEmail) // Passing email, action will resolve

            if (result.success && result.ticket) {
                setTicketCode(result.ticket.code)
                setStep('TICKET')
            } else {
                alert(result.error || "Failed to claim deal")
            }
        } catch (error) {
            console.error("Claim error:", error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-3xl w-full max-w-4xl h-[600px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition">
                    <i className="fa-solid fa-xmark text-black"></i>
                </button>

                {/* LEFT COLUMN: IMAGE */}
                <div className="w-full md:w-1/2 h-48 md:h-full relative bg-gray-100">
                    {deal.image ? (
                        <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-6xl font-black text-gray-300">
                            {deal.business?.businessName?.charAt(0)}
                        </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-black text-black shadow-sm">
                        {deal.category}
                    </div>
                </div>

                {/* RIGHT COLUMN: CONTENT */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col relative">

                    {/* STEP 1: DETAILS */}
                    {step === 'DETAILS' && (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                    {deal.business?.logo ? <img src={deal.business.logo} className="w-full h-full object-cover" /> : <span className="font-bold">{deal.business?.businessName?.charAt(0)}</span>}
                                </div>
                                <span className="font-bold text-gray-500">{deal.business?.businessName}</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-[#111111] mb-2 leading-tight">{deal.title}</h2>
                            <p className="text-gray-500 font-medium mb-6 line-clamp-3">{deal.description}</p>

                            <div className="mt-auto">
                                <div className="flex items-center gap-4 mb-6 text-sm font-semibold text-gray-500">
                                    <div className="flex items-center gap-2"><i className="fa-solid fa-location-dot"></i> {deal.business?.address || "In-store"}</div>
                                    <div className="flex items-center gap-2"><i className="fa-solid fa-fire text-orange-500"></i> Popular</div>
                                </div>

                                <button
                                    onClick={() => setStep('PAYMENT')}
                                    className="w-full bg-[#E60023] text-white py-4 rounded-xl text-lg font-bold hover:bg-[#cc001f] transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 block"
                                >
                                    Get Deal
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 2: PAYMENT METHOD */}
                    {step === 'PAYMENT' && (
                        <div className="flex-1 flex flex-col">
                            <button onClick={() => setStep('DETAILS')} className="text-sm font-bold text-gray-400 hover:text-black mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-arrow-left"></i> Back
                            </button>

                            <h2 className="text-2xl font-black text-[#111111] mb-2">Select Payment</h2>
                            <p className="text-gray-500 mb-8">How would you like to redeem this?</p>

                            <div className="space-y-4">
                                <label className="flex items-center gap-4 p-4 border-2 border-[#E60023] bg-red-50 rounded-xl cursor-pointer">
                                    <div className="w-6 h-6 rounded-full border-[6px] border-[#E60023] bg-white"></div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[#111111]">Pay at Store</h4>
                                        <p className="text-xs text-gray-500">Show ticket to cashier</p>
                                    </div>
                                    <i className="fa-solid fa-store text-xl text-[#E60023]"></i>
                                </label>

                                <div className="p-4 border border-gray-100 rounded-xl opacity-50 cursor-not-allowed">
                                    <h4 className="font-bold text-gray-400">Online Payment</h4>
                                    <p className="text-xs text-gray-400">Not available for this deal</p>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button
                                    onClick={handleClaim}
                                    disabled={loading}
                                    className="w-full bg-[#111111] text-white py-4 rounded-xl text-lg font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <i className="fa-solid fa-circle-notch fa-spin"></i> Generating Ticket...
                                        </>
                                    ) : (
                                        "Confirm & Get Ticket"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: TICKET */}
                    {step === 'TICKET' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-6">
                                <i className="fa-solid fa-check"></i>
                            </div>

                            <h2 className="text-2xl font-black text-[#111111] mb-2">Ticket Ready!</h2>
                            <p className="text-gray-500 mb-8">Show this code at {deal.business?.businessName}</p>

                            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-6">
                                <QRCode value={JSON.stringify({ code: ticketCode, valid: true })} size={160} />
                            </div>

                            <div className="bg-gray-100 px-6 py-3 rounded-lg border border-gray-200 mb-8">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ticket Code</p>
                                <p className="text-xl font-mono font-black text-[#111111] tracking-wider">{ticketCode}</p>
                            </div>

                            <button
                                onClick={onClose}
                                className="text-gray-500 font-bold hover:text-black hover:underline"
                            >
                                Close & View in Wallet
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
