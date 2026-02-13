import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Partner {
    id: string;
    businessName: string;
    category: string;
    city: string;
    logo: string | null;
    status: string;
    plan: string;
    createdAt: string;
    stats: {
        activeDeals: number;
        revenue: number;
    };
    email: string;
}

interface PartnerTableProps {
    onViewDetails?: (id: string) => void;
}

export default function PartnerTable({ onViewDetails }: PartnerTableProps) {
    const router = useRouter();

    // --- STATE ---
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPartners, setTotalPartners] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [cityFilter, setCityFilter] = useState('All');

    // Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modals
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // --- DEBOUNCE ---
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- FETCH ---
    const fetchPartners = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: debouncedSearch,
                status: statusFilter === 'All' ? '' : statusFilter,
                city: cityFilter === 'All' ? '' : cityFilter
            });

            const res = await fetch(`/api/auth/admin/partners/list?${params}`);
            const data = await res.json();

            if (data.success) {
                setPartners(data.businesses);
                setTotalPages(data.pagination.totalPages);
                setTotalPartners(data.pagination.total);
            }
        } catch (error) {
            console.error("Failed to fetch partners", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [page, debouncedSearch, statusFilter, cityFilter]);

    // --- HANDLERS ---
    const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
        try {
            const res = await fetch(`/api/auth/admin/partners/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, rejectionReason: reason })
            });
            if (res.ok) {
                fetchPartners();
                setRejectId(null);
                setRejectionReason('');
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error("Status Update Error", error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/auth/admin/partners/${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchPartners();
                setDeleteId(null);
            } else {
                alert('Failed to delete business');
            }
        } catch (error) {
            console.error("Delete Error", error);
        }
    };

    const handleBulkApprove = async () => {
        if (!confirm(`Approve ${selectedIds.length} businesses?`)) return;
        try {
            const res = await fetch('/api/auth/admin/partners/bulk-approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            });
            if (res.ok) {
                fetchPartners();
                setSelectedIds([]);
            }
        } catch (error) {
            console.error("Bulk Approve Error", error);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === partners.length) setSelectedIds([]);
        else setSelectedIds(partners.map(p => p.id));
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(sid => sid !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    // --- RENDER ---
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">

            {/* CONTROLS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">

                {/* Status Tabs */}
                <div className="flex bg-slate-50 p-1 rounded-xl">
                    {['All', 'PENDING', 'ACTIVE', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${statusFilter === status ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {status === 'All' ? 'All Partners' : status}
                            {status === 'PENDING' && <span className="ml-2 w-2 h-2 rounded-full bg-amber-500 inline-block"></span>}
                        </button>
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 outline-none"
                    >
                        <option value="All">All Cities</option>
                        <option value="Tunis">Tunis</option>
                        <option value="Sfax">Sfax</option>
                        <option value="Sousse">Sousse</option>
                    </select>

                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-slate-200 transition"
                        />
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    </div>
                </div>
            </div>

            {/* BULK ACTIONS */}
            {selectedIds.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center animate-in slide-in-from-top-2">
                    <span className="text-sm font-bold text-indigo-700 ml-2">{selectedIds.length} Selected</span>
                    <button
                        onClick={handleBulkApprove}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                    >
                        Bulk Approve
                    </button>
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === partners.length && partners.length > 0} />
                                </th>
                                <th className="px-6 py-4">Business</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Performance</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading...</td></tr>
                            ) : partners.map((partner) => (
                                <tr key={partner.id} className="hover:bg-slate-50/50 transition bg-white group">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(partner.id)}
                                            onChange={() => toggleSelect(partner.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {partner.logo ? (
                                                <img src={partner.logo} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold text-lg">
                                                    {partner.businessName.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-900">{partner.businessName}</div>
                                                <div className="text-xs font-medium text-slate-400">{partner.city} • {partner.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide
                                            ${partner.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' :
                                                partner.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                                    partner.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${partner.status === 'ACTIVE' ? 'bg-emerald-500' :
                                                    partner.status === 'PENDING' ? 'bg-amber-500' :
                                                        partner.status === 'REJECTED' ? 'bg-red-500' : 'bg-slate-500'
                                                }`}></div>
                                            {partner.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="font-bold text-slate-700">{partner.stats.activeDeals} Active Deals</div>
                                        <div className="text-slate-400">{partner.stats.revenue} TND Est. Rev</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                        {new Date(partner.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                                            {/* PENDING ACTIONS */}
                                            {partner.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleStatusChange(partner.id, 'ACTIVE')} title="Approve" className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition">
                                                        <i className="fa-solid fa-check"></i>
                                                    </button>
                                                    <button onClick={() => setRejectId(partner.id)} title="Reject" className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition">
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                </>
                                            )}

                                            {/* ACTIVE ACTIONS */}
                                            {partner.status === 'ACTIVE' && (
                                                <button onClick={() => handleStatusChange(partner.id, 'SUSPENDED')} title="Suspend" className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition">
                                                    <i className="fa-solid fa-pause"></i>
                                                </button>
                                            )}

                                            {/* SUSPENDED ACTIONS */}
                                            {partner.status === 'SUSPENDED' && (
                                                <button onClick={() => handleStatusChange(partner.id, 'ACTIVE')} title="Reactivate" className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition">
                                                    <i className="fa-solid fa-play"></i>
                                                </button>
                                            )}

                                            {/* VIEW DETAILS */}
                                            <button onClick={() => onViewDetails ? onViewDetails(partner.id) : router.push(`/admin/partners/${partner.id}`)} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-black hover:text-white transition text-xs font-bold">
                                                Details
                                            </button>

                                            {/* DELETE */}
                                            <button onClick={() => setDeleteId(partner.id)} title="Delete" className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="text-xs font-bold text-slate-400">
                        Total: {totalPartners} partners
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-600 flex items-center">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* REJECT MODAL */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95">
                        <h3 className="text-lg font-black text-slate-900 mb-2">Reject Business</h3>
                        <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejection. This will be emailed to the business.</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full h-32 p-3 bg-slate-50 rounded-xl border border-transparent focus:border-red-500 outline-none text-sm font-medium resize-none"
                            placeholder="Reason for rejection..."
                        ></textarea>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setRejectId(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                            <button
                                onClick={() => handleStatusChange(rejectId, 'REJECTED', rejectionReason)}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xl mx-auto mb-4">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 text-center mb-2">Delete Business?</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            Are you sure you want to delete this business? This action cannot be undone and will remove all deals and tickets.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600">Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
