import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    bg: string;
}

function StatCard({ title, value, icon, color, bg }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 transition hover:-translate-y-1 hover:shadow-md">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${bg} ${color}`}>
                <i className={`fa-solid fa-${icon}`}></i>
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
            </div>
        </div>
    );
}

interface OverviewStatsProps {
    stats: {
        users: { total: number; new: number; growth: number };
        businesses: { active: number; pending: number; rejected: number; total: number };
        deals: { active: number; expired: number };
        tickets: { total: number; redeemed: number; conversionRate: number };
        revenue: number;
    };
}

export default function OverviewStats({ stats }: OverviewStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
            <StatCard
                title="Total Revenue"
                value={`${stats.revenue} TND`}
                icon="wallet"
                color="text-emerald-500"
                bg="bg-emerald-50"
            />
            <StatCard
                title="Total Users"
                value={stats.users.total.toLocaleString()}
                icon="users"
                color="text-indigo-500"
                bg="bg-indigo-50"
            />
            <StatCard
                title="Active Partners"
                value={stats.businesses.active}
                icon="shop"
                color="text-amber-500"
                bg="bg-amber-50"
            />
            <StatCard
                title="Redeemed Tickets"
                value={stats.tickets.redeemed.toLocaleString()}
                icon="ticket"
                color="text-red-500"
                bg="bg-red-50"
            />
        </div>
    );
}
