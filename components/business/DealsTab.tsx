```
import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, isPast, isFuture, parseISO } from 'date-fns';

interface Deal {
    id: number;
    title: string;
    description?: string;
    discount: string;
    status?: string; // We will derive this if not present
    isActive: boolean;
    isDraft: boolean;
    expiry?: string;
    startDate?: string;
    image?: string | null;
    images?: string[];
    views: number;
    clicks: number;
    claimed: number;     // From _count.tickets
    redemptions: number; // From _count.redemptions
    totalInventory?: number | null;
    maxClaimsPerUser?: number;
    createdAt?: string;
}

interface DealsTabProps {
    deals: Deal[];
    filterStatus: string; // Not used as much internally now, but kept for compat
    setFilterStatus: (status: string) => void;
    handleDeleteDeal: (id: number) => void;
    setShowModal: (show: boolean) => void;
}

export default function DealsTab({ deals, handleDeleteDeal, setShowModal }: DealsTabProps) {
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFTS'>('ACTIVE');
    const [selectedDeals, setSelectedDeals] = useState<number[]>([]);

    // --- DERIVED STATE ---
    const getDealStatus = (deal: Deal) => {
        if (deal.isDraft) return 'DRAFT';
        if (deal.expiry && isPast(new Date(deal.expiry))) return 'EXPIRED';
        if (deal.startDate && isFuture(new Date(deal.startDate))) return 'SCHEDULED';
        if (!deal.isActive) return 'INACTIVE'; // or Draft
        return 'ACTIVE';
    };

    const filteredDeals = deals.filter(deal => {
        const status = getDealStatus(deal);
        if (activeTab === 'ACTIVE') return status === 'ACTIVE';
        if (activeTab === 'SCHEDULED') return status === 'SCHEDULED';
        if (activeTab === 'EXPIRED') return status === 'EXPIRED';
        if (activeTab === 'DRAFTS') return status === 'DRAFT' || status === 'INACTIVE';
        return true;
    });

    // --- HANDLERS ---
    const toggleSelect = (id: number) => {
        if (selectedDeals.includes(id)) {
            setSelectedDeals(selectedDeals.filter(d => d !== id));
        } else {
            setSelectedDeals([...selectedDeals, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedDeals.length === filteredDeals.length) {
            setSelectedDeals([]);
        } else {
            setSelectedDeals(filteredDeals.map(d => d.id));
        }
    };

    const handleDuplicate = (deal: Deal) => {
        // Implementation for duplication (API call needed normally, for now alert)
        alert(`Duplicate functionality coming soon for: ${ deal.title } `);
    };

    const handleExtend = (deal: Deal) => {
        alert(`Extend functionality coming soon for: ${ deal.title } `);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* TABS HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex p-1 bg-slate-100 rounded-xl overflow-hidden self-start">
                    {(['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DRAFTS'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px - 6 py - 2.5 rounded - lg text - xs font - bold transition - all ${
    activeTab === tab
    ? 'bg-white text-[#0F392B] shadow-sm'
    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
} `}
                        >
                            {tab === 'ACTIVE' ? 'Active Deals' :
                             tab === 'SCHEDULED' ? 'Scheduled' :
                             tab === 'EXPIRED' ? 'Expired' : 'Drafts'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {selectedDeals.length > 0 && (
                        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold animate-in fade-in zoom-in">
                            <span>{selectedDeals.length} Selected</span>
                            <div className="h-4 w-px bg-white/20 mx-1"></div>
                            <button className="hover:text-red-400 transition" onClick={() => alert('Bulk Delete')}>Delete</button>
                            {activeTab === 'EXPIRED' && (
                                <>
                                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                                    <button className="hover:text-green-400 transition" onClick={() => alert('Bulk Republish')}>Republish</button>
                                </>
                            )}
                        </div>
                    )}
                    <Link href="/business/add-deal" className="bg-[#FF3B30] hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-900/20 hover:shadow-xl transition flex items-center gap-2">
                        <i className="fa-solid fa-plus"></i> Create Deal
                    </Link>
                </div>
            </div>

            {/* EMPTY STATE */}
            {filteredDeals.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i className="fa-solid fa-folder-open"></i>
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">No {activeTab.toLowerCase()} deals</h3>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">
                        {activeTab === 'ACTIVE' ? "You don't have any active deals running right now." :
                         activeTab === 'SCHEDULED' ? "No upcoming deals scheduled." :
                         activeTab === 'EXPIRED' ? "No expired deals history yet." : "No drafts saved."}
                    </p>
                    {activeTab === 'ACTIVE' && (
                        <Link href="/business/add-deal" className="bg-[#0F392B] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition">
                            Create First Deal
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {/* Header Row (Desktop) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-1 flex items-center">
                            <input type="checkbox" onChange={toggleSelectAll} checked={selectedDeals.length === filteredDeals.length && filteredDeals.length > 0} className="rounded border-slate-300 text-[#0F392B] focus:ring-[#0F392B]" />
                        </div>
                        <div className="col-span-5">Deal Info</div>
                        <div className="col-span-3">Performance</div>
                        <div className="col-span-2">Inventory</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {filteredDeals.map((deal) => {
                        const status = getDealStatus(deal);
                        const inventoryPercent = deal.totalInventory ? Math.round(((deal.totalInventory - deal.claimed) / deal.totalInventory) * 100) : 100;

                        return (
                            <div key={deal.id} className={`bg - white p - 4 rounded - 2xl border transition - all group grid grid - cols - 1 md: grid - cols - 12 gap - 4 items - center relative overflow - hidden ${ selectedDeals.includes(deal.id) ? 'border-[#0F392B] ring-1 ring-[#0F392B] bg-slate-50' : 'border-slate-100 hover:border-slate-200 hover:shadow-md' } `}>
                                
                                {/* Select */}
                                <div className="col-span-1 hidden md:flex">
                                    <input type="checkbox" checked={selectedDeals.includes(deal.id)} onChange={() => toggleSelect(deal.id)} className="rounded border-slate-300 text-[#0F392B] focus:ring-[#0F392B] w-4 h-4 cursor-pointer" />
                                </div>

                                {/* Main Info */}
                                <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                                     <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 relative">
                                        {deal.image || (deal.images && deal.images[0]) ? (
                                            <img src={deal.image || (deal.images && deal.images[0]) || ''} alt={deal.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">IMG</div>
                                        )}
                                        {/* Mobile Badge */}
                                        <div className={`md:hidden absolute top - 1 left - 1 px - 1.5 py - 0.5 rounded text - [8px] font - black uppercase tracking - wide 
                                            ${
    status === 'ACTIVE' ? 'bg-green-500 text-white' :
    status === 'EXPIRED' ? 'bg-slate-500 text-white' : 'bg-orange-500 text-white'
} `}>
                                            {status}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-[#0F392B] transition line-clamp-1">{deal.title}</h3>
                                        <div className="text-xs font-bold text-[#FF3B30] mb-1">{deal.discount} OFF</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                            <i className="fa-regular fa-clock"></i>
                                            {status === 'EXPIRED' ? 'Ended' : 'Ends'} {deal.expiry ? formatDistanceToNow(new Date(deal.expiry), { addSuffix: true }) : 'Never'}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="col-span-6 md:col-span-3 grid grid-cols-3 gap-2">
                                    <div className="text-center md:text-left">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Views</div>
                                        <div className="font-bold text-slate-700">{deal.views}</div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Claims</div>
                                        <div className="font-bold text-slate-900">{deal.claimed}</div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Used</div>
                                        <div className="font-bold text-green-600">{deal.redemptions}</div>
                                    </div>
                                </div>

                                {/* Inventory */}
                                <div className="col-span-6 md:col-span-2">
                                    {deal.totalInventory ? (
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold mb-1">
                                                <span className={`${ inventoryPercent < 20 ? 'text-red-500' : 'text-slate-500' } `}>{deal.totalInventory - deal.claimed} Left</span>
                                                <span className="text-slate-300">of {deal.totalInventory}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h - full rounded - full ${ inventoryPercent < 20 ? 'bg-red-500' : 'bg-[#0F392B]' } `} style={{ width: `${ inventoryPercent }% ` }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                            <i className="fa-solid fa-infinity"></i> Unlimited
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="col-span-12 md:col-span-1 flex md:flex-col lg:flex-row justify-end items-center gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    
                                    {/* Action Dropdown or Buttons */}
                                    <div className="flex items-center gap-1">
                                         <Link href={`/ business / edit - deal / ${ deal.id } `} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition" title="Edit">
                                            <i className="fa-solid fa-pen text-xs"></i>
                                        </Link>
                                        <button onClick={() => handleDeleteDeal(deal.id)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition" title="Delete">
                                            <i className="fa-solid fa-trash text-xs"></i>
                                        </button>
                                        <div className="relative group/menu">
                                            <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition">
                                                <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover/menu:block z-10 animate-in fade-in slide-in-from-top-2">
                                                <button onClick={() => handleDuplicate(deal)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2">
                                                    <i className="fa-regular fa-copy"></i> Duplicate
                                                </button>
                                                <button onClick={() => handleExtend(deal)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2">
                                                    <i className="fa-solid fa-clock-rotate-left"></i> Extend Expiry
                                                </button>
                                                {status === 'EXPIRED' && (
                                                     <button onClick={() => handleDuplicate(deal)} className="w-full text-left px-4 py-3 text-xs font-bold text-green-600 hover:bg-green-50 transition flex items-center gap-2">
                                                        <i className="fa-solid fa-rotate-right"></i> Republish
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
```
