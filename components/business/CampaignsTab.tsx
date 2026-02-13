'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CampaignsTabProps {
    businessId: string;
}

interface Campaign {
    id: number;
    title: string;
    message: string;
    targetRadius: number;
    status: 'PENDING' | 'SENT' | 'REJECTED';
    createdAt: string;
    deal?: { title: string };
    sentAt?: string;
}

interface Deal {
    id: number;
    title: string;
}

export default function CampaignsTab({ businessId }: CampaignsTabProps) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [activeDeals, setActiveDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        dealId: '',
        targetRadius: 2000 // Default 2000m (2km)
    })

    useEffect(() => {
        if (businessId) fetchData();
    }, [businessId])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch History
            const campRes = await fetch(`/api/auth/business/campaigns?businessId=${businessId}`);
            const campData = await campRes.json();
            if (campData.success) setCampaigns(campData.campaigns);

            // Fetch Deals for Dropdown
            const dealRes = await fetch(`/api/auth/deals/my-deals?businessId=${businessId}`);
            const dealData = await dealRes.json();
            if (dealData.success) {
                // Only active deals
                setActiveDeals(dealData.deals.filter((d: any) => d.isActive));
            }
        } catch (error) {
            console.error("Failed to load campaigns", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/auth/business/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId,
                    ...formData,
                    targetRadius: Number(formData.targetRadius)
                })
            });

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setFormData({ title: '', message: '', dealId: '', targetRadius: 2000 }); // Reset
                fetchData(); // Refresh list
                alert("Campaign requested successfully! Awaiting approval.");
            } else {
                alert(data.error || "Failed to request campaign");
            }
        } catch (error) {
            console.error("Submit error", error);
        } finally {
            setSubmitting(false);
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SENT': return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-black uppercase">Sent</span>;
            case 'REJECTED': return <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-black uppercase">Rejected</span>;
            default: return <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-black uppercase">Pending Approval</span>;
        }
    }

    if (loading) return <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Loading campaigns...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* HEADER */}
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Push Campaigns</h2>
                    <p className="text-slate-500 text-sm font-bold mt-1">Broadcast flash sales to nearby users.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#0F392B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0b291f] transition shadow-lg shadow-green-900/20 flex items-center gap-2"
                >
                    <i className="fa-solid fa-bullhorn"></i> Request Broadcast
                </button>
            </div>

            {/* CAMPAIGN HISTORY TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Message & Deal</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Target Radius</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Engagement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns.length > 0 ? campaigns.map(camp => (
                                <tr key={camp.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 text-sm font-bold text-slate-700">
                                        {new Date(camp.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 text-sm">{camp.title}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs">{camp.message}</div>
                                        {camp.deal && (
                                            <div className="mt-1 inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                                <i className="fa-solid fa-tag"></i> {camp.deal.title}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-slate-700">
                                        {(camp.targetRadius / 1000).toFixed(1)} km
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(camp.status)}
                                    </td>
                                    <td className="p-4">
                                        {camp.status === 'SENT' ? (
                                            <div className="text-xs">
                                                <div className="font-bold text-slate-900">~1,200 <span className="text-slate-400 font-medium">Reached</span></div>
                                                <div className="font-bold text-green-600">340 <span className="text-slate-400 font-medium ml-1">Opened (28%)</span></div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                                        No campaigns found. Start your first broadcast!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* REQUEST MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">New Broadcast</h3>
                                    <p className="text-xs text-slate-500 font-bold">Alert nearby users about a deal.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Campaign Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                                        placeholder="e.g. Flash Lunch Sale!"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                        Short Message <span className="text-slate-300 normal-case ml-1">({140 - formData.message.length} chars left)</span>
                                    </label>
                                    <textarea
                                        required
                                        maxLength={140}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-slate-900 h-24 resize-none"
                                        placeholder="Grab 50% off burgers for the next 2 hours only!"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Radius</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                                            value={formData.targetRadius}
                                            onChange={e => setFormData({ ...formData, targetRadius: Number(e.target.value) })}
                                        >
                                            <option value={1000}>1 km (Walking)</option>
                                            <option value={2000}>2 km (Neighborhood)</option>
                                            <option value={5000}>5 km (City Area)</option>
                                            <option value={10000}>10 km (Max Reach)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Link Active Deal</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                                            value={formData.dealId}
                                            onChange={e => setFormData({ ...formData, dealId: e.target.value })}
                                        >
                                            <option value="">No Linked Deal</option>
                                            {activeDeals.map(deal => (
                                                <option key={deal.id} value={deal.id}>{deal.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-amber-50 rounded-xl p-4 text-xs font-medium text-amber-800 flex gap-2 items-start">
                                    <i className="fa-solid fa-clock mt-0.5"></i>
                                    <p>All broadcasts require admin approval to prevent spam. Requests are usually processed within 15 minutes.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2"
                                >
                                    {submitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                    Submit Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
