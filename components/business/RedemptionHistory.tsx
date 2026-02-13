'use client'

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

interface RedemptionHistoryProps {
    businessId: string;
}

export default function RedemptionHistory({ businessId }: RedemptionHistoryProps) {
    const [range, setRange] = useState('today');
    const [search, setSearch] = useState('');
    const [data, setData] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, totalScans: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [range, businessId]); // Debounce search in real app, simplified here

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                businessId,
                range,
                search
            });
            const res = await fetch(`/api/auth/business/redemptions?${queryParams}`);
            const json = await res.json();
            if (json.data) {
                setData(json.data);
                setSummary(json.summary);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchHistory();
    };

    const exportToExcel = () => {
        const exportData = data.map(item => ({
            "Date": format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm'),
            "Customer": item.user.fullName,
            "Deal": item.deal.title,
            "Discount": item.deal.discount,
            "Amount Collected (TND)": item.redeemedAmount || 0
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Redemptions");
        XLSX.writeFile(wb, `redemption_report_${range}.xlsx`);
    };

    const maskName = (name: string) => {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0]} ${parts[1][0]}.`;
        }
        return name;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* 1. Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Transaction Log</h3>
                    <p className="text-sm text-slate-500 font-medium">Reconcile your daily sales.</p>
                </div>

                <div className="flex gap-2">
                    <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
                        {['today', 'week', 'month'].map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition ${range === r ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                    <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Total Revenue</div>
                    <div className="text-3xl font-black">{summary.totalRevenue.toFixed(2)} <span className="text-sm text-white/50">TND</span></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Scans</div>
                    <div className="text-3xl font-black text-slate-900">{summary.totalScans}</div>
                </div>
            </div>

            {/* 3. Search & Export */}
            <div className="flex gap-2">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <i className="fa-solid fa-search absolute left-4 top-3.5 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Search by customer name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 shadow-sm"
                    />
                </form>
                <button
                    onClick={exportToExcel}
                    className="px-6 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                >
                    <i className="fa-solid fa-file-excel text-green-600"></i> <span className="hidden md:inline">Export CSV</span>
                </button>
            </div>

            {/* 4. Data Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-widest">Time</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-widest">Customer</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-widest">Deal</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Collected</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 font-bold animate-pulse">Loading Logs...</td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                            <i className="fa-solid fa-clipboard-list"></i>
                                        </div>
                                        <p className="text-slate-900 font-bold">No redemptions found</p>
                                        <p className="text-xs text-slate-400">Try changing the date filter.</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition group">
                                        <td className="p-4 text-slate-500 font-medium text-sm">
                                            {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
                                        </td>
                                        <td className="p-4 font-bold text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                                                    <i className="fa-solid fa-user"></i>
                                                </div>
                                                {maskName(item.user.fullName)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900 text-sm">{item.deal.title}</div>
                                            <div className="text-xs text-green-600 font-bold bg-green-50 inline-block px-1.5 rounded">{item.deal.discount}</div>
                                        </td>
                                        <td className="p-4 text-right font-black text-slate-900">
                                            {item.redeemedAmount > 0 ? (
                                                <span>{item.redeemedAmount.toFixed(2)} <span className="text-xs text-slate-400">TND</span></span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
