'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface BillingTabProps {
    businessId: string;
}

export default function BillingTab({ businessId }: BillingTabProps) {
    // In a real app, we would fetch this from the API. 
    // Since Stripe is removed, we mock the subscription state based on the Business model structure.
    // Assuming simple defaults for now or these could be passed as props.
    const subscription = {
        plan: 'Gold Partner',
        status: 'ACTIVE',
        price: '199 TND',
        interval: 'Month',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        features: [
            'Unlimited Deals',
            'Advanced Analytics',
            'Priority Support',
            'Push Campaigns (5/mo)',
            'Branch Management (Up to 3)'
        ]
    }

    const invoices = [
        { id: 'INV-001', date: '01 Feb 2026', amount: '199.00 TND', status: 'PAID' },
        { id: 'INV-002', date: '01 Jan 2026', amount: '199.00 TND', status: 'PAID' },
        { id: 'INV-003', date: '01 Dec 2025', amount: '199.00 TND', status: 'PAID' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* CURRENT PLAN CARD */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <i className="fa-solid fa-crown text-9xl text-amber-400"></i>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-amber-100 text-amber-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                {subscription.status}
                            </span>
                            <span className="text-slate-400 text-xs font-bold">Renews on {subscription.nextBilling}</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-2">{subscription.plan}</h2>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900">{subscription.price}</span>
                            <span className="text-slate-500 font-bold">/{subscription.interval}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">
                            Upgrade Plan
                        </button>
                        <button className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition">
                            Cancel
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subscription.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <i className="fa-solid fa-check-circle text-green-500"></i>
                            {feature}
                        </div>
                    ))}
                </div>
            </div>

            {/* INVOICE HISTORY */}
            <div>
                <h3 className="text-xl font-black text-slate-900 mb-4 px-2">Invoice History</h3>
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Invoice ID</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition">
                                    <td className="p-6 font-bold text-slate-900">{inv.id}</td>
                                    <td className="p-6 font-medium text-slate-600">{inv.date}</td>
                                    <td className="p-6 font-bold text-slate-900">{inv.amount}</td>
                                    <td className="p-6">
                                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded uppercase">
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="text-slate-400 hover:text-slate-900 transition">
                                            <i className="fa-solid fa-download"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-[#0F392B] rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black mb-1">Payment Method</h3>
                        <p className="text-white/60 text-sm font-medium">Manage how you pay for your subscription</p>
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition text-sm backdrop-blur-sm">
                        Update Method
                    </button>
                </div>
                <div className="mt-6 flex items-center gap-4">
                    <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                        <i className="fa-brands fa-cc-visa text-2xl"></i>
                    </div>
                    <div className="font-mono text-lg tracking-wider">•••• •••• •••• 4242</div>
                    <div className="text-sm text-white/50 ml-auto font-bold">Exp 12/28</div>
                </div>
            </div>

        </div>
    )
}
