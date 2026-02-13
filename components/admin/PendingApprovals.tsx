import React from 'react';

interface Partner {
    id: string;
    businessName: string;
    category: string;
    city: string;
    status: string;
    plan: string;
    googleMapsUrl?: string; // For verification
}

interface PendingApprovalsProps {
    partners: Partner[];
    onAction: (id: string, action: 'APPROVE' | 'REJECT') => void;
}

export default function PendingApprovals({ partners, onAction }: PendingApprovalsProps) {
    if (partners.length === 0) return null;

    return (
        <div className="bg-white rounded-[2rem] border border-amber-100 shadow-lg shadow-amber-500/5 mb-8 animate-in slide-in-from-top-4 overflow-hidden">
            <div className="bg-amber-50/50 p-6 border-b border-amber-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-bell"></i>
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900">Pending Approvals</h3>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">{partners.length} New Requests</p>
                </div>
            </div>

            <div className="divide-y divide-slate-50">
                {partners.map(partner => (
                    <div key={partner.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-2xl text-slate-400">
                                <i className="fa-solid fa-shop"></i>
                            </div>
                            <div>
                                <h4 className="font-black text-lg text-slate-900">{partner.businessName}</h4>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded capitalize">{partner.category}</span>
                                    <span>•</span>
                                    <span>{partner.city}</span>
                                </div>
                                {partner.googleMapsUrl && (
                                    <a href={partner.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 mt-2 hover:underline">
                                        <i className="fa-solid fa-map-pin"></i> Verify Location
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => onAction(partner.id, 'REJECT')}
                                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-red-50 hover:text-red-500 transition text-sm"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => onAction(partner.id, 'APPROVE')}
                                className="px-6 py-3 rounded-xl bg-black text-white font-bold hover:bg-slate-800 transition shadow-lg text-sm flex items-center gap-2"
                            >
                                <i className="fa-solid fa-check"></i> Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
