import React from 'react';
import { useRouter } from 'next/navigation';
import TicketScannerModal from './TicketScannerModal';
import Link from 'next/link';

interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    color: string;
    bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition hover:shadow-md h-full">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bgColor} ${color}`}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{value}</h3>
            </div>
        </div>
    );
}

interface OverviewTabProps {
    stats: {
        activeDeals: number;
        views: number;
        claims: number;
        redemptions: number;
        saved: number;
    };
    businessName: string;
    setActiveTab: (tab: string) => void;
    recentDeals: any[]; // Passed from parent or fetched
}

export default function OverviewTab({ stats, businessName, setActiveTab, recentDeals }: OverviewTabProps) {
    const router = useRouter();
    const [showScanner, setShowScanner] = React.useState(false);

    // Default stats if missing (Mocking for now if parent doesn't provide everything)
    const safeStats = {
        activeDeals: stats?.activeDeals || 0,
        views: stats?.views || 125, // Mock as requested
        claims: stats?.claims || 42, // Mock as requested
        redemptions: stats?.redemptions || 0,
        saved: stats?.saved || 15 // Mock
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <TicketScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />

            {/* 1. Header & Status (If not in parent) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Hi, {businessName}! 👋</h1>
                    <p className="text-slate-500 font-medium">Here's what's happening with your store today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#D90020] transition flex items-center justify-center shadow-sm">
                        <i className="fa-solid fa-bell"></i>
                    </button>
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Active Account
                    </div>
                </div>
            </div>

            {/* 2. Stats Grid (5 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Active Deals"
                    value={safeStats.activeDeals.toString()}
                    icon="fa-tag"
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Total Views"
                    value={safeStats.views.toLocaleString()}
                    icon="fa-eye"
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Total Claims"
                    value={safeStats.claims.toLocaleString()}
                    icon="fa-ticket"
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <StatCard
                    title="Redemptions"
                    value={safeStats.redemptions.toLocaleString()}
                    icon="fa-qrcode"
                    color="text-[#D90020]"
                    bgColor="bg-red-50"
                />
                <StatCard
                    title="Saved by Users"
                    value={safeStats.saved.toLocaleString()}
                    icon="fa-heart"
                    color="text-pink-600"
                    bgColor="bg-pink-50"
                />
            </div>

            {/* 3. Action Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => setActiveTab('deals')}
                    className="group bg-[#D90020] hover:bg-[#b0001a] text-white p-8 rounded-3xl font-bold text-left shadow-xl shadow-red-100 transition-all transform hover:-translate-y-1"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                            <i className="fa-solid fa-plus"></i>
                        </div>
                        <i className="fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0"></i>
                    </div>
                    <div className="text-2xl font-black">Create New Deal</div>
                    <div className="text-white/80 font-medium mt-1">Boost traffic instantly</div>
                </button>

                <button
                    onClick={() => setShowScanner(true)}
                    className="group bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 p-8 rounded-3xl font-bold text-left shadow-none hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl group-hover:bg-slate-200 transition">
                            <i className="fa-solid fa-qrcode"></i>
                        </div>
                        <i className="fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0"></i>
                    </div>
                    <div className="text-2xl font-black">Scan QR Code</div>
                    <div className="text-slate-500 font-medium mt-1">Validate customer tickets</div>
                </button>
            </div>

            {/* 4. Bottom Section: Recent Active Deals */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-900">Recent Active Deals</h3>
                    <button onClick={() => setActiveTab('deals')} className="text-sm font-bold text-[#D90020] hover:underline">View All</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recentDeals && recentDeals.length > 0 ? (
                        recentDeals.slice(0, 3).map((deal) => (
                            <div key={deal.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                <div className="aspect-video w-full bg-slate-100 rounded-xl mb-4 relative overflow-hidden">
                                    {deal.image ? (
                                        <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-300"><i className="fa-solid fa-image text-2xl"></i></div>
                                    )}
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-bold text-[#D90020]">
                                        {deal.views || 0} views
                                    </div>
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1 truncate">{deal.title}</h4>
                                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                    <span>{deal.claimed || 0} / {deal.totalInventory || '∞'} claimed</span>
                                    <span className={deal.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}>{deal.status}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl shadow-sm">
                                <i className="fa-solid fa-tag"></i>
                            </div>
                            <h3 className="text-slate-900 font-bold mb-1">No active deals</h3>
                            <p className="text-slate-500 text-sm mb-4">Start by creating your first offer.</p>
                            <button onClick={() => setActiveTab('deals')} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
                                Create Deal
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

