import React, { useState, useEffect, useRef } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

interface AnalyticsTabProps {
    businessEmail: string;
    businessId: string;
}

export default function AnalyticsTab({ businessEmail, businessId }: AnalyticsTabProps) {
    const [range, setRange] = useState('7d'); // 7d, 30d
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [range]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/auth/business/analytics?email=${businessEmail}&businessId=${businessId}&range=${range}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!data || !data.chart) return;

        const headers = ["Date", "Claims (Interest)", "Redemptions (Sales)"];
        const rows = data.chart.map((row: any) => [row.date, row.claims, row.redemptions]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `win_analytics_${range}_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && !data) return <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Loading Analytics...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Performance Report</h3>
                    <p className="text-sm text-slate-500 font-medium">Track your ROI and customer engagement.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setRange('7d')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${range === '7d' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => setRange('30d')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${range === '30d' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Last 30 Days
                    </button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Views"
                    value={data?.kpi?.views?.toLocaleString() || '0'}
                    icon="fa-eye"
                    color="text-blue-500"
                    trend="All Time"
                />
                <MetricCard
                    label="Interest (Claims)"
                    value={data?.kpi?.claims?.toLocaleString() || '0'}
                    icon="fa-ticket"
                    color="text-purple-500"
                    trend="In Range"
                />
                <MetricCard
                    label="Sales (Redemptions)"
                    value={data?.kpi?.redemptions?.toLocaleString() || '0'}
                    icon="fa-qrcode"
                    color="text-green-600"
                    trend="In Range"
                />
                <MetricCard
                    label="Conversion Rate"
                    value={`${data?.kpi?.conversionRate || '0.0'}%`}
                    icon="fa-chart-line"
                    color="text-orange-500"
                    trend="Claims → Sales"
                />
            </div>

            {/* MAIN CHART */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <i className="fa-solid fa-layer-group text-slate-400"></i>
                        Deal Performance
                    </h4>
                    <div className="flex gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Claims</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Sales</span>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={data?.chart || []}>
                        <defs>
                            <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#64748b', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="claims"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorClaims)"
                        />
                        <Area
                            type="monotone"
                            dataKey="redemptions"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* BOTTOM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* REVENUE ESTIMATOR */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <h4 className="font-bold text-white/60 uppercase tracking-widest text-xs mb-1">Estimated Revenue</h4>
                    <p className="text-white/40 text-[10px] mb-6 max-w-xs">Based on recorded redemptions. Does not include upsells.</p>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">
                            {/* Placeholder Logic: Assuming avg deal price of 15 TND for demo if not tracked */}
                            {(data?.kpi?.redemptions * 15).toLocaleString()}
                        </span>
                        <span className="text-xl font-bold text-white/50">TND</span>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-green-300">
                        <i className="fa-solid fa-arrow-trend-up"></i> Generated Value
                    </div>
                </div>

                {/* ENGAGEMENT & EXPORT */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 text-[#FF3B30] rounded-full flex items-center justify-center text-xl">
                                <i className="fa-regular fa-heart"></i>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-500">Saved Deals</div>
                                <div className="text-2xl font-black text-slate-900">--</div>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-slate-300">Coming Soon</div>
                    </div>

                    <button
                        onClick={downloadCSV}
                        className="w-full py-4 rounded-xl border-2 border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition font-bold text-sm flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-download"></i> Download CSV Report
                    </button>
                </div>
            </div>

        </div>
    );
}

function MetricCard({ label, value, icon, color, trend }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-opacity-10 bg-current`}>
                    <i className={`fa-solid ${icon} text-sm`}></i>
                </div>
                {/* <span className="text-[10px] font-bold bg-green-100 text-green-600 px-1.5 py-0.5 rounded">
                    +12%
                </span> */}
            </div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{label}</div>
            <div className="text-[9px] font-bold text-slate-300 mt-2 border-t pt-2 border-slate-50">{trend}</div>
        </div>
    )
}
