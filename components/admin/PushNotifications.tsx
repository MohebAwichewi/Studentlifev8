'use client'

import React, { useState, useEffect } from 'react'

interface PushRequest {
    id: number
    businessId: string | null
    businessName: string
    category: string
    title: string
    message: string
    targetRadius: number
    filters: string | null
    status: string
    createdAt: string
    sentAt: string | null
}

export default function PushNotifications() {
    const [requests, setRequests] = useState<PushRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT'>('ALL')

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/auth/admin/push/list')
            if (res.ok) {
                const data = await res.json()
                setRequests(data)
            }
        } catch (error) {
            console.error('Failed to fetch push requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: number, action: 'APPROVE' | 'REJECT') => {
        try {
            const res = await fetch('/api/auth/admin/push/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
            })

            if (res.ok) {
                // Optimistic update
                setRequests(prev => prev.map(req =>
                    req.id === id ? { ...req, status: action === 'APPROVE' ? 'SENT' : 'REJECTED', sentAt: action === 'APPROVE' ? new Date().toISOString() : null } : req
                ))
            }
        } catch (error) {
            console.error('Action failed:', error)
            alert('Failed to process request')
        }
    }

    const filteredRequests = requests.filter(req => {
        if (filter === 'ALL') return true
        return req.status === filter
    })

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            APPROVED: 'bg-green-100 text-green-700 border-green-200',
            REJECTED: 'bg-red-100 text-red-700 border-red-200',
            SENT: 'bg-blue-100 text-blue-700 border-blue-200'
        }
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {(['ALL', 'PENDING', 'SENT', 'REJECTED'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter === f
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {f}
                            {f !== 'ALL' && (
                                <span className="ml-2 text-xs opacity-70">
                                    ({requests.filter(r => r.status === f).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchRequests}
                    className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm"
                >
                    <i className="fa-solid fa-arrows-rotate mr-2"></i>
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-2xl font-black text-slate-900">{requests.length}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Requests</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <div className="text-2xl font-black text-yellow-700">{requests.filter(r => r.status === 'PENDING').length}</div>
                    <div className="text-xs font-bold text-yellow-600 uppercase tracking-wider mt-1">Pending Review</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-2xl font-black text-green-700">{requests.filter(r => r.status === 'APPROVED').length}</div>
                    <div className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1">Approved</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-2xl font-black text-blue-700">{requests.filter(r => r.status === 'SENT').length}</div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">Sent</div>
                </div>
            </div>

            {/* Requests Table */}
            {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">
                        <i className="fa-solid fa-bell"></i>
                    </div>
                    <h3 className="font-bold text-slate-400">No Push Notifications</h3>
                    <p className="text-xs text-slate-300 mt-2">
                        {filter === 'ALL'
                            ? 'No push notification requests yet.'
                            : `No ${filter.toLowerCase()} requests.`}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Message</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{req.businessName}</div>
                                        <div className="text-xs text-slate-400">{req.category}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800 mb-1">{req.title}</div>
                                        <div className="text-sm text-slate-600 line-clamp-2 max-w-md">{req.message}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-600">
                                            {req.targetRadius > 0 ? `${req.targetRadius}km radius` : 'All users'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-slate-500">
                                            {new Date(req.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.status === 'PENDING' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAction(req.id, 'APPROVE')}
                                                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition"
                                                >
                                                    <i className="fa-solid fa-check mr-1"></i>
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'REJECT')}
                                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition"
                                                >
                                                    <i className="fa-solid fa-xmark mr-1"></i>
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 font-medium">
                                                {req.status === 'SENT' && req.sentAt
                                                    ? `Sent ${new Date(req.sentAt).toLocaleDateString()}`
                                                    : '—'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
