'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BranchesTabProps {
    businessId: string;
}

interface Branch {
    id: number;
    name: string;
    address: string;
    _count: { deals: number };
    deals: { id: number }[];
}

interface Deal {
    id: number;
    title: string;
    image?: string;
    status?: string;
}

export default function BranchesTab({ businessId }: BranchesTabProps) {
    const [branches, setBranches] = useState<Branch[]>([])
    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Form Stats
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        assignedDealIds: [] as number[]
    })

    useEffect(() => {
        if (businessId) {
            fetchData();
        }
    }, [businessId])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch Branches
            const branchRes = await fetch(`/api/auth/business/branches?businessId=${businessId}`);
            const branchData = await branchRes.json();
            if (branchData.success) {
                setBranches(branchData.branches);
            }

            // Fetch Active Deals (for assignment)
            const dealRes = await fetch(`/api/auth/deals/my-deals?businessId=${businessId}`);
            const dealData = await dealRes.json();
            if (dealData.success) {
                // Filter only active/relevant deals if needed
                setDeals(dealData.deals);
            }
        } catch (error) {
            console.error("Failed to fetch branch data", error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (branch?: Branch) => {
        if (branch) {
            setEditingBranch(branch);
            setFormData({
                name: branch.name,
                address: branch.address,
                assignedDealIds: branch.deals.map(d => d.id)
            });
        } else {
            setEditingBranch(null);
            setFormData({
                name: '',
                address: '',
                assignedDealIds: []
            });
        }
        setShowModal(true);
    }

    const handleToggleDeal = (dealId: number) => {
        setFormData(prev => {
            const exists = prev.assignedDealIds.includes(dealId);
            if (exists) {
                return { ...prev, assignedDealIds: prev.assignedDealIds.filter(id => id !== dealId) };
            } else {
                return { ...prev, assignedDealIds: [...prev.assignedDealIds, dealId] };
            }
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = '/api/auth/business/branches';
            const method = editingBranch ? 'PUT' : 'POST';
            const body = {
                businessId,
                id: editingBranch?.id,
                ...formData
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                fetchData(); // Refresh list
            } else {
                alert(data.error || "Operation failed");
            }
        } catch (error) {
            console.error("Submit error", error);
        } finally {
            setSubmitting(false);
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`/api/auth/business/branches?id=${deletingId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setBranches(prev => prev.filter(b => b.id !== deletingId));
                setDeletingId(null);
            } else {
                alert("Failed to delete branch");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    }

    if (loading) return <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Loading branches...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* HEADER */}
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Branch Locations</h2>
                    <p className="text-slate-500 text-sm font-bold mt-1">Manage your stores and deal availability.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#D90020] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#b0001a] transition shadow-lg shadow-red-500/30 flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> Add New Branch
                </button>
            </div>

            {/* BRANCH LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map(branch => (
                    <div key={branch.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                    <i className="fa-solid fa-store text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg">{branch.name}</h3>
                                    <p className="text-slate-500 text-xs font-bold flex items-center gap-1">
                                        <i className="fa-solid fa-location-dot text-[#D90020]"></i> {branch.address}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(branch)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition">
                                    <i className="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button onClick={() => setDeletingId(branch.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition">
                                    <i className="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Deals:</span>
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-black">{branch._count.deals}</span>
                        </div>
                    </div>
                ))}

                {branches.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <i className="fa-solid fa-map-location-dot text-4xl mb-4 opacity-50"></i>
                        <p className="font-bold">No branches added yet.</p>
                        <p className="text-xs mt-1">Add your first location to get started.</p>
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-xl font-black text-slate-900">
                                    {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="branchForm" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Branch Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                                                placeholder="e.g. Downtown Branch"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                                                placeholder="e.g. 123 Main St, Tunis"
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* DEAL ASSIGNMENT SECTION */}
                                    <div className="border-t border-slate-100 pt-6">
                                        <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-tags text-blue-500"></i> Assign Available Deals
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2">
                                            {deals.length > 0 ? deals.map(deal => (
                                                <div
                                                    key={deal.id}
                                                    onClick={() => handleToggleDeal(deal.id)}
                                                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center gap-4 ${formData.assignedDealIds.includes(deal.id) ? 'border-green-500 bg-green-50' : 'border-slate-100 hover:border-slate-300'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.assignedDealIds.includes(deal.id) ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent'}`}>
                                                        <i className="fa-solid fa-check text-xs"></i>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">{deal.title}</div>
                                                        <div className="text-xs text-slate-500">Global Active Deal</div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center text-slate-400 py-4">No active deals found. Create deals first.</div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition">Cancel</button>
                                <button
                                    form="branchForm"
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg flex items-center gap-2"
                                >
                                    {submitting && <i className="fa-solid fa-circle-notch fa-spin"></i>}
                                    {editingBranch ? 'Update Branch' : 'Create Branch'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {deletingId && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Branch?</h3>
                            <p className="text-slate-500 text-sm font-medium mb-6">Are you sure you want to remove this location? This action cannot be undone.</p>

                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeletingId(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
                                <button onClick={handleDelete} className="px-6 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-lg shadow-red-500/30">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
