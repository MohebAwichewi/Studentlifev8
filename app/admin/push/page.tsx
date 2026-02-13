'use client'

import React, { useState, useEffect } from 'react'

export default function PushModeration() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState('ALL')
    const [preview, setPreview] = useState<any>(null)
    const [reason, setReason] = useState('')
    const [rejectId, setRejectId] = useState<number | null>(null)

    useEffect(() => {
        fetchRequests()
    }, [status])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/auth/admin/push/list?status=${status}`)
            const data = await res.json()
            setRequests(data)
            if (data.length > 0 && !preview) setPreview(data[0])
        } catch (error) {
            console.error("Failed to fetch requests", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: number, action: 'APPROVE' | 'REJECT' | 'SEND') => {
        if (action === 'REJECT' && !reason && !rejectId) {
            setRejectId(id)
            return
        }

        try {
            const res = await fetch(`/api/auth/admin/push/${id}/moderate`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reason })
            })
            if (res.ok) {
                if (action === 'REJECT') { setRejectId(null); setReason('') }
                fetchRequests()
            }
        } catch (error) {
            console.error("Action failed", error)
        }
    }

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 animate-in fade-in slide-in-from-bottom-4">

            {/* LEFT: Request Queue */}
            <div className="flex-1 flex flex-col gap-4">

                {/* Filters */}
                <div className="bg-white p-2 rounded-xl border border-slate-100 flex gap-2 w-fit">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SENT'].map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatus(s); setPreview(null) }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${status === s ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {loading ? (
                        <div className="text-center py-10 text-slate-400">Loading requests...</div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">No requests found.</div>
                    ) : requests.map(req => (
                        <div
                            key={req.id}
                            onClick={() => setPreview(req)}
                            className={`bg-white p-4 rounded-xl border cursor-pointer transition relative group ${preview?.id === req.id ? 'border-slate-900 shadow-md transform scale-[1.01]' : 'border-slate-100 hover:border-slate-300'
                                }`}
                        >
                            {/* Spam Alert Badge */}
                            {req.business.recentSends > 2 && req.status === 'PENDING' && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
                                    <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                                    {req.business.recentSends} Sends (7d)
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg overflow-hidden">
                                        {req.business.logo ? (
                                            <img src={req.business.logo} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                                {req.business.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{req.business.name}</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">{req.business.category}</div>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${req.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                        req.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                                            req.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>

                            <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{req.content.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{req.content.message}</p>

                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 bg-slate-50 p-2 rounded-lg">
                                <span className="flex items-center gap-1">
                                    <i className="fa-solid fa-location-dot"></i>
                                    {req.targeting.radius > 0 ? `${req.targeting.radius}km Radius` : 'Global'}
                                </span>
                                {req.content.dealDiscount && (
                                    <span className="flex items-center gap-1 text-purple-500">
                                        <i className="fa-solid fa-tag"></i>
                                        Linked Deal
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Preview & Action Console */}
            <div className="w-[380px] flex flex-col">
                {preview ? (
                    <div className="bg-white rounded-[2.5rem] border-8 border-slate-900 shadow-xl overflow-hidden flex flex-col h-full relative">
                        {/* Fake Dynamic Island */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20"></div>

                        {/* Lock Screen UI */}
                        <div className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white relative flex flex-col pt-20">
                            <div className="font-light text-6xl text-center opacity-80 mb-2">09:41</div>
                            <div className="text-sm font-bold text-center opacity-60 mb-12">Thursday, Feb 13</div>

                            {/* Notification Card */}
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 text-left shadow-lg border border-white/10 animate-in zoom-in-50 duration-300">
                                <div className="flex justify-between items-start mb-2 opacity-90">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-slate-900 rounded-md flex items-center justify-center">
                                            <i className="fa-solid fa-bolt text-xs text-yellow-400"></i>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wide">WIN App</span>
                                    </div>
                                    <span className="text-[10px] lowercase">now</span>
                                </div>
                                <h4 className="font-bold text-sm mb-1">{preview.content.title}</h4>
                                <p className="text-xs leading-relaxed opacity-90">{preview.content.message}</p>
                            </div>

                            {/* Linked Deal Info */}
                            {preview.content.dealTitle && (
                                <div className="mt-auto mb-10 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Linked Promotion</div>
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl">
                                            {preview.content.dealDiscount}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm line-clamp-1">{preview.content.dealTitle}</div>
                                            <div className="text-xs opacity-70">15m ago • {preview.business.name}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Console */}
                        <div className="bg-white border-t border-slate-100 p-6 z-30">
                            {preview.status === 'PENDING' && !rejectId && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleAction(preview.id, 'REJECT')}
                                        className="py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(preview.id, 'APPROVE')}
                                        className="py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                                    >
                                        Approve
                                    </button>
                                </div>
                            )}

                            {preview.status === 'APPROVED' && (
                                <button
                                    onClick={() => handleAction(preview.id, 'SEND')}
                                    className="w-full py-4 rounded-xl bg-green-500 text-white font-black text-sm hover:bg-green-600 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-rocket"></i>
                                    SEND BROADCAST NOW
                                </button>
                            )}

                            {/* Rejection Modal (Inline) */}
                            {rejectId === preview.id && (
                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-slate-900">Reason for rejection:</div>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 ring-red-100 outline-none"
                                        placeholder="Too many emojis, Misleading content..."
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setRejectId(null); setReason('') }}
                                            className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleAction(preview.id, 'REJECT')}
                                            className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-bold"
                                        >
                                            Confirm Rejection
                                        </button>
                                    </div>
                                </div>
                            )}

                            {preview.status === 'REJECTED' && (
                                <div className="text-center">
                                    <div className="text-xs font-bold text-red-500 mb-1">REJECTED</div>
                                    <div className="text-xs text-slate-400 italic">"{preview.rejectionReason}"</div>
                                </div>
                            )}

                            {preview.status === 'SENT' && (
                                <div className="text-center">
                                    <div className="text-xs font-bold text-blue-500 mb-1">SENT</div>
                                    <div className="text-xs text-slate-400">{new Date(preview.sentAt).toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-100 rounded-[2.5rem]">
                        <i className="fa-solid fa-mobile-screen text-4xl mb-4"></i>
                        <div className="text-sm font-bold">Select a request</div>
                        <div className="text-xs">to preview logic</div>
                    </div>
                )}
            </div>
        </div>
    )
}
