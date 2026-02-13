'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Ticket {
    id: string
    code: string
    deal: {
        title: string
        discount: number
        businessName: string
    }
    user: {
        name: string
        email: string
    }
    status: string
    createdAt: string
    redeemedAt: string | null
    isFraudRisk: boolean
}

export default function TicketMonitor() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [stats, setStats] = useState({ total: 0 })

    // Filters from URL or State
    const initialSearch = searchParams.get('search') || ''
    const initialStatus = searchParams.get('status') || 'ALL'

    const [search, setSearch] = useState(initialSearch)
    const [status, setStatus] = useState(initialStatus)
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams()
        if (debouncedSearch) params.set('search', debouncedSearch)
        if (status !== 'ALL') params.set('status', status)
        params.set('page', page.toString())
        router.replace(`/admin/tickets?${params.toString()}`)

        fetchTickets()
    }, [page, debouncedSearch, status])

    const fetchTickets = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search: debouncedSearch,
                status: status
            })
            const res = await fetch(`/api/auth/admin/tickets/list?${params}`)
            const data = await res.json()
            if (data.success) {
                setTickets(data.tickets)
                setTotalPages(data.pagination.totalPages)
                setStats({ total: data.pagination.total })
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRedeem = async (id: string) => {
        if (!confirm("Are you sure you want to manually redeem this ticket?")) return
        try {
            const res = await fetch(`/api/auth/admin/tickets/${id}/redeem`, { method: 'PATCH' })
            if (res.ok) fetchTickets()
            else alert("Failed to redeem")
        } catch (error) {
            console.error(error)
        }
    }

    const handleVoid = async (id: string) => {
        if (!confirm("Are you sure you want to VOID this ticket?")) return
        try {
            const res = await fetch(`/api/auth/admin/tickets/${id}/void`, { method: 'PATCH' })
            if (res.ok) fetchTickets()
            else alert("Failed to void")
        } catch (error) {
            console.error(error)
        }
    }

    const getStatusStyle = (status: string, isFraud: boolean) => {
        if (isFraud) return 'bg-red-50 text-red-600 border-red-100' // High alert
        switch (status) {
            case 'REDEEMED': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'ACTIVE': return 'bg-blue-50 text-blue-600 border-blue-100'
            case 'EXPIRED': return 'bg-slate-100 text-slate-500 border-slate-200'
            default: return 'bg-slate-50 text-slate-600'
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* Header Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search Ticket ID, User, or Business..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border border-transparent focus:border-slate-200 outline-none transition"
                    />
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                </div>

                {/* Filters */}
                <div className="flex bg-slate-50 p-1 rounded-xl">
                    {['ALL', 'ACTIVE', 'REDEEMED', 'EXPIRED'].map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatus(s); setPage(1) }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${status === s ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <button onClick={fetchTickets} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition">
                    <i className="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Ticket ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Deal</th>
                                <th className="px-6 py-4">Timestamps</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading live transactions...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No tickets found matching criteria.</td></tr>
                            ) : tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-50 transition group">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                                            {ticket.code}
                                        </div>
                                        {ticket.isFraudRisk && (
                                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-red-500">
                                                <i className="fa-solid fa-bolt"></i> Speed Warning
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 text-sm">{ticket.user.name}</div>
                                        <div className="text-xs text-slate-400">{ticket.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 text-sm">{ticket.deal.businessName}</div>
                                        <div className="text-xs text-slate-500">{ticket.deal.discount}% Off • {ticket.deal.title}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-medium text-slate-600">
                                            Created: {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {ticket.redeemedAt && (
                                            <div className="text-xs font-bold text-emerald-600 mt-1">
                                                Redeemed: {new Date(ticket.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${getStatusStyle(ticket.status, ticket.isFraudRisk)}`}>
                                            {ticket.status}
                                            {ticket.isFraudRisk && ' (SUSPICIOUS)'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {ticket.status === 'ACTIVE' && (
                                                <>
                                                    <button
                                                        onClick={() => handleRedeem(ticket.id)}
                                                        title="Manual Redeem"
                                                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition"
                                                    >
                                                        <i className="fa-solid fa-check"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleVoid(ticket.id)}
                                                        title="Void Ticket"
                                                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                                                    >
                                                        <i className="fa-solid fa-ban"></i>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-xs font-bold text-slate-400">Total: {stats.total}</div>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold disabled:opacity-50">Prev</button>
                        <span className="px-2 text-xs font-bold flex items-center text-slate-600">{page} / {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
