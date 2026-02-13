'use client'

import React, { useState } from 'react'
import { validateTicket } from '@/app/actions'
import { Scanner } from '@yudiel/react-qr-scanner'

export default function TicketScannerModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [code, setCode] = useState('')
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [message, setMessage] = useState('')
    const [ticketData, setTicketData] = useState<any>(null)
    const [showCamera, setShowCamera] = useState(false)

    if (!isOpen) return null

    const processCode = async (inputCode: string) => {
        const cleanCode = inputCode.trim().toUpperCase()
        if (!cleanCode) return

        setStatus('LOADING')
        setMessage('')
        setShowCamera(false) // Close camera on scan

        try {
            const businessId = localStorage.getItem('businessId')
            if (!businessId) {
                setStatus('ERROR')
                setMessage('Business ID not found within session. Please relogin to refresh.')
                new Audio('/sounds/error.mp3').play().catch(() => { }) // Feature 24: Sound Effect
                return
            }

            const res = await validateTicket(cleanCode, businessId)

            if (res.success) {
                setStatus('SUCCESS')
                setMessage(res.message || 'Valid Ticket!')
                setTicketData({
                    dealTitle: res.dealTitle,
                    userName: res.userName
                })
                setCode('')
                new Audio('/sounds/success.mp3').play().catch(() => { }) // Feature 24: Sound Effect
            } else {
                setStatus('ERROR')
                setMessage(res.error || 'Invalid Ticket')
                new Audio('/sounds/error.mp3').play().catch(() => { }) // Feature 24: Sound Effect
            }
        } catch (err) {
            setStatus('ERROR')
            setMessage('Network error verifying ticket')
            new Audio('/sounds/error.mp3').play().catch(() => { }) // Feature 24: Sound Effect
        }
    }

    const handleValidate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!code) return
        await processCode(code)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-[#0F392B] p-6 text-white text-center relative shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <i className="fa-solid fa-qrcode text-3xl"></i>
                    </div>
                    <h2 className="text-xl font-black">Scan Ticket</h2>
                    <p className="text-xs text-white/60 font-bold uppercase tracking-wider">Validate Customer Redemption</p>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto">
                    {status === 'SUCCESS' ? (
                        <div className="text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">
                                <i className="fa-solid fa-check"></i>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-1">Success!</h3>
                            <p className="text-slate-500 font-bold mb-6">{message}</p>

                            <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 mb-6">
                                <div className="mb-2">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Customer</p>
                                    <p className="font-bold text-slate-900">{ticketData?.userName || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Deal</p>
                                    <p className="font-bold text-slate-900">{ticketData?.dealTitle || 'Deal Promoiton'}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => { setStatus('IDLE'); setTicketData(null); }}
                                className="w-full py-4 bg-[#0F392B] text-white font-bold rounded-xl hover:bg-[#16513e] transition shadow-lg"
                            >
                                Scan Another
                            </button>
                        </div>
                    ) : showCamera ? (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 bg-black rounded-2xl overflow-hidden relative mb-4">
                                <Scanner
                                    onScan={(result) => {
                                        if (result && result.length > 0) {
                                            processCode(result[0].rawValue)
                                        }
                                    }}
                                    onError={(error: any) => console.log(error?.message || error)}
                                />
                                <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none"></div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-48 h-48 border-2 border-[#D90020] rounded-xl bg-white/5 backdrop-blur-[2px]"></div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCamera(false)}
                                className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                            >
                                Cancel Camera
                            </button>
                        </div>
                    ) : (
                        <div>
                            <form onSubmit={handleValidate}>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Ticket Code</label>
                                    <div className="relative">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="#WIN-XXXX"
                                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 font-black text-2xl text-center uppercase tracking-widest text-slate-900 focus:outline-none focus:border-[#0F392B] transition placeholder-slate-300"
                                            value={code}
                                            onChange={e => setCode(e.target.value.toUpperCase())}
                                        />
                                        {status === 'LOADING' && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <i className="fa-solid fa-circle-notch fa-spin text-slate-400"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {status === 'ERROR' && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-bold mb-6 flex items-center justify-center gap-2 animate-pulse">
                                        <i className="fa-solid fa-circle-exclamation"></i>
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!code || status === 'LOADING'}
                                    className="w-full py-4 bg-[#0F392B] text-white font-bold rounded-xl hover:bg-[#16513e] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-100 mb-4"
                                >
                                    {status === 'LOADING' ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </form>

                            <div className="relative flex py-5 items-center">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">OR</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>

                            <button
                                onClick={() => setShowCamera(true)}
                                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-camera"></i> Use Camera
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
