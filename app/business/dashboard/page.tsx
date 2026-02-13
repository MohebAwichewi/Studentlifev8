'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Toast from '@/components/Toast'

// ✅ MODULAR IMPORTS
import OverviewTab from '@/components/business/OverviewTab'
import DealsTab from '@/components/business/DealsTab'
import AnalyticsTab from '@/components/business/AnalyticsTab'
import RedemptionHistory from '@/components/business/RedemptionHistory'
import SettingsTab from '@/components/business/SettingsTab'
import BranchesTab from '@/components/business/BranchesTab'
import CampaignsTab from '@/components/business/CampaignsTab'
import NotificationsTab from '@/components/business/NotificationsTab'
import HelpSupportTab from '@/components/business/HelpSupportTab'
import BillingTab from '@/components/business/BillingTab'

// --- TYPES ---
type Tab = 'overview' | 'deals' | 'billing' | 'settings' | 'analytics' | 'branches' | 'campaigns' | 'notifications' | 'support'

interface Deal {
    id: number
    title: string
    discount: string
    description?: string
    expiry?: string
    startDate?: string
    status?: string
    isActive: boolean
    isDraft: boolean
    views: number
    claimed: number
    redemptions: number
    clicks: number
    image?: string | null
    images?: string[]
    totalInventory?: number | null
    maxClaimsPerUser?: number | null
    createdAt?: string
}

interface SubscriptionData {
    isSubscribed: boolean
    plan: string
    status: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
}

interface AudienceData {
    totalNearby: number
    universities: { name: string, percent: number }[]
}

// --- HELPER COMPONENTS ---
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])
    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-top-5 duration-300 ${type === 'success' ? 'bg-[#0F392B] text-white' : 'bg-red-500 text-white'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/20`}>
                <i className={`fa-solid ${type === 'success' ? 'fa-check' : 'fa-triangle-exclamation'}`}></i>
            </div>
            <div>
                <h4 className="font-bold text-sm">{type === 'success' ? 'Success' : 'Error'}</h4>
                <p className="text-xs text-white/90 font-medium">{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 text-white/50 hover:text-white transition"><i className="fa-solid fa-xmark"></i></button>
        </div>
    )
}


function SidebarItem({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-[#FF3B30] text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
            <i className={`fa-solid ${icon} w-6 text-center text-lg`}></i>
            {label}
        </button>
    )
}

function InputGroup({ label, placeholder, value, onChange, type = "text" }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-[#0F392B] transition"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}

// --- MAIN PAGE COMPONENT ---
export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <DashboardContent />
        </Suspense>
    )
}

function DashboardContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // --- STATE ---
    const [activeTab, setActiveTab] = useState<Tab>('overview')
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    // Auth & Data State
    const [businessName, setBusinessName] = useState('')
    const [businessId, setBusinessId] = useState('')
    const [businessEmail, setBusinessEmail] = useState('')

    // Data Store
    const [deals, setDeals] = useState<Deal[]>([])
    const [audience, setAudience] = useState<AudienceData>({ totalNearby: 0, universities: [] })
    const [stats, setStats] = useState({ reach: 0, clicks: 0, redemptions: 0 })
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)

    // UI State
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [showModal, setShowModal] = useState(false)
    // Trial State
    const [daysLeft, setDaysLeft] = useState(0)
    const [isTrialActive, setIsTrialActive] = useState(true)
    const [isSubscribed, setIsSubscribed] = useState(false)

    // ✅ UPDATED PROFILE FORM (Added googleMapsUrl)
    const [profileForm, setProfileForm] = useState({
        businessName: '',
        phone: '',
        website: '',
        address: '',
        googleMapsUrl: '',
        googleMapEmbed: '', // ✅ New Field
        description: '',
        logo: '',
        banner: ''
    })

    // Modal State
    const [showModal, setShowModal] = useState(false)

    // --- CATEGORY STATE ---
    const [categories, setCategories] = useState<any[]>([])

    // DEAL FORM STATE
    const [dealForm, setDealForm] = useState({
        title: '',
        description: '',
        discountAmount: '',
        hasDiscount: false,
        discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'AMOUNT',
        expiry: '',
        isIndefinite: false,
        image: '',
        category: '',
        categoryIds: [] as string[], // ✅ Added Category IDs for Multi-Select
        redemptionMethod: 'SWIPE_SINGLE' as 'SWIPE_SINGLE' | 'SWIPE_MULTI' | 'CODE_SINGLE'
    })
    const [creatingDeal, setCreatingDeal] = useState(false)

    // Forms
    const [profileForm, setProfileForm] = useState({
        businessName: '', phone: '', website: '', address: '', googleMapsUrl: '', googleMapEmbed: '', description: '', logo: '', banner: ''
    })
    const [dealForm, setDealForm] = useState({
        title: '', description: '', discountAmount: '', hasDiscount: false, discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'AMOUNT', expiry: '', isIndefinite: false, image: '', redemptionMethod: 'SWIPE_SINGLE' as 'SWIPE_SINGLE' | 'SWIPE_MULTI' | 'CODE_SINGLE'
    })

    const showToast = (message: string, type: 'success' | 'error') => setNotification({ message, type })

    // --- FETCH DATA ---
    useEffect(() => {
        const isLogged = localStorage.getItem('isBusinessLoggedIn')
        const status = localStorage.getItem('businessStatus') // Get status

        if (!isLogged) {
            router.push('/business/login')
            return
        } else if (status === 'PENDING') {
            router.push('/business/pending') // Redirect if pending
            return
        } else {
            setBusinessName(name || 'Partner')
            setBusinessId(id)
            if (email) setBusinessEmail(email)
            setLoading(false)

            const safeFetch = async (url: string, body?: any) => {
                try {
                    const res = await fetch(url, {
                        method: body ? 'POST' : 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        body: body ? JSON.stringify(body) : undefined
                    });

                    if (res.status === 404) {
                        // Business not found in DB (zombie session)
                        localStorage.clear()
                        router.push('/business/login')
                        return null;
                    }

                    if (!res.ok) return null;
                    return await res.json();
                } catch (e) {
                    console.error("Fetch error:", url, e);
                    return null;
                }
            };

            // 1. My Deals
            safeFetch('/api/auth/deals/my-deals', { businessId: id }).then(data => {
                if (data && data.success) setDeals(data.deals)
            });

            // 2. Audience
            safeFetch('/api/auth/business/audience').then(data => {
                if (data) setAudience(data)
            });

            // 3. Profile
            safeFetch('/api/auth/business/profile', { businessId: id }).then(data => {
                if (data && !data.error) {
                    setProfileForm({
                        businessName: data.businessName || '',
                        phone: data.phone || '',
                        website: data.website || '',
                        address: data.address || '',
                        googleMapsUrl: data.googleMapsUrl || '',
                        googleMapEmbed: data.googleMapEmbed || '', // ✅ Load Embed Code
                        description: data.description || '',
                        logo: data.logo || '',
                        banner: data.banner || data.coverImage || '' // ✅ Fix: Map coverImage to banner
                    })
                    if (data.email) setBusinessEmail(data.email)

                    if (data.trialEndsAt) {
                        const now = new Date();
                        const trialEnd = new Date(data.trialEndsAt);
                        const diffTime = trialEnd.getTime() - now.getTime();
                        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        setDaysLeft(days);
                        setIsTrialActive(days > 0);
                        setIsSubscribed(data.isSubscribed || false);
                    }
                }
            });

            // 4. Billing Status
            safeFetch('/api/auth/business/billing/status', { businessId: id }).then(data => {
                if (data && data.success) {
                    setSubscription(data.subscription)
                    if (data.subscription.status === 'active') setIsSubscribed(true)
                }
            });

            // 5. Stats
            safeFetch('/api/auth/business/stats', { businessId: id }).then(data => {
                if (data && data.success) setStats(data.stats)
            });

            // 6. Categories (✅ FETCH CATEGORIES)
            safeFetch('/api/auth/admin/categories').then(data => {
                if (data) setCategories(data)
            })
        }
    }, [router, searchParams])

    const handleLogout = () => {
        localStorage.clear()
        router.push('/business/login')
    }

    // ✅ HELPER: Compress Image to reduce Payload Size
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Resize to max width 800px
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Compress to JPEG with 0.7 quality
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                }
            }
        })
    }

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
        const file = e.target.files?.[0]
        if (file) {
            try {
                const compressed = await compressImage(file);
                setProfileForm(prev => ({ ...prev, [type]: compressed }))
            } catch (err) {
                console.error("Image processing failed", err)
            }
        }
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            try {
                const compressed = await compressImage(file);
                setDealForm({ ...dealForm, image: compressed })
            } catch (err) {
                console.error("Image processing failed", err)
            }
        }
    }

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to cancel? Your plan will remain active until the end of the billing cycle, then expire.")) return;
        setCanceling(true)
        try {
            const res = await fetch('/api/auth/business/billing/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId })
            })
            const data = await res.json()
            if (res.ok && data.success) {
                showToast("Subscription set to cancel at end of period.", "success")
                setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null)
            } else {
                showToast(data.error || "Cancellation failed", "error")
            }
        } catch (err) {
            showToast("Network Error", "error")
        } finally {
            setCanceling(false)
        }
    }

    const handleCreateDeal = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isTrialActive && !isSubscribed) {
            showToast("Free trial expired. Please upgrade to post offers.", "error")
            return;
        }
        if (dealForm.categoryIds.length === 0) {
            showToast("Please select at least one category", "error")
            return;
        }

        setCreatingDeal(true)
        const emailToSend = businessEmail || localStorage.getItem('businessEmail');

        let finalDiscountValue = "";
        if (dealForm.hasDiscount) {
            finalDiscountValue = dealForm.discountType === 'PERCENTAGE'
                ? `${dealForm.discountAmount}%`
                : `£${dealForm.discountAmount}`;
        }

        const id = localStorage.getItem('businessId')
        const name = localStorage.getItem('businessName') || 'Partner'
        if (!id) { router.push('/business/login'); return; } // This check might be redundant if isLogged covers it, but keeping for robustness

        setBusinessId(id)
        setBusinessName(name)
        setLoading(false)

        // Parallel Fetch
        const fetchData = async () => {
            try {
                // 1. My Deals
                const dealsRes = await fetch('/api/auth/deals/my-deals', { method: 'POST', body: JSON.stringify({ businessId: id }) })
                const dealsData = await dealsRes.json();
                if (dealsData.success) setDeals(dealsData.deals)

                // 2. Stats (REAL DATA NOW)
                const statsRes = await fetch('/api/auth/business/stats', { method: 'POST', body: JSON.stringify({ businessId: id }) })
                const statsData = await statsRes.json();
                if (statsData.success) setStats(statsData.stats)

                // 3. Profile
                const profileRes = await fetch(`/api/auth/business/profile?businessId=${id}`) // Changed to GET/Query usually, simplifying here
                // ... (Profile logic same as before, simplified for brevity in this refactor step)

            } catch (e) { console.error("Data load error", e) }
        };
        fetchData();
    }, [router])

    // --- HANDLERS ---

    const handleDeleteDeal = async (id: number) => {
        // ... (Keep existing Logic)
        setDeals(deals.filter(d => d.id !== id))
        // Legacy Fallback: Use the name of the first selected category
        const firstCatId = dealForm.categoryIds[0];
        const firstCat = categories.find(c => c.id.toString() === firstCatId) || { name: 'General' };

        try {
            const res = await fetch('/api/auth/deals/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailToSend,
                    title: dealForm.title,
                    description: dealForm.description,
                    discount: finalDiscountValue,
                    expiry: finalExpiry,
                    image: dealForm.image,
                    businessId,
                    category: firstCat.name, // Legacy String Fallback
                    categoryIds: dealForm.categoryIds, // ✅ Send Multiple Categories
                    isMultiUse: isMultiUse,
                    redemptionType: redemptionType,
                })
            })
            const data = await res.json()
            if (res.ok) {
                setDeals(prev => [{
                    id: Date.now(),
                    title: dealForm.title,
                    discountValue: finalDiscountValue,
                    expiry: finalExpiry ? finalExpiry : "Indefinite",
                    status: 'ACTIVE',
                    views: 0,
                    claimed: 0,
                    image: dealForm.image,
                    createdAt: new Date().toISOString()
                }, ...prev])
                setShowModal(false)
                setDealForm({
                    title: '', description: '', discountAmount: '', hasDiscount: false, discountType: 'PERCENTAGE', expiry: '', isIndefinite: false, image: '', category: '', categoryIds: [], redemptionMethod: 'SWIPE_SINGLE'
                })
                setStats(prev => ({ ...prev, reach: prev.reach + 125 }))
                showToast("Deal Published Successfully!", "success")
            } else {
                showToast(data.error || "Could not create offer", "error")
            }
        } catch (err) {
            showToast("Network connection error", "error")
        } finally {
            setCreatingDeal(false)
        }
    }

    // --- RENDER ---
    if (loading) return <div className="flex h-screen items-center justify-center text-slate-500 font-bold">Loading Studio...</div>

    return (
        <div className="min-h-screen bg-[#F4F7FE] flex font-sans text-slate-900">
            <Script async src="https://js.stripe.com/v3/pricing-table.js" strategy="afterInteractive" />
            {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#0F392B] text-white flex flex-col hidden md:flex sticky top-0 h-screen transition-all">
                <div className="p-8">
                    <div className="text-2xl font-black tracking-tighter">WIN<span className="text-[#FF3B30]">.PARTNER</span></div>
                    <div className="text-xs text-white/50 font-bold mt-1 uppercase tracking-widest">Partner Studio</div>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <SidebarItem icon="fa-chart-pie" label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon="fa-tags" label="Deal Studio" active={activeTab === 'deals'} onClick={() => setActiveTab('deals')} />
                    <SidebarItem icon="fa-chart-simple" label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <SidebarItem icon="fa-bullhorn" label="Push Campaigns" active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
                    <SidebarItem icon="fa-store" label="My Branches" active={activeTab === 'branches'} onClick={() => setActiveTab('branches')} />
                    <SidebarItem icon="fa-credit-card" label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                    <SidebarItem icon="fa-headset" label="Help & Support" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                    <SidebarItem icon="fa-gear" label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>
                <div className="p-6 border-t border-white/10">
                    <button onClick={() => { localStorage.clear(); router.push('/business/login') }} className="text-red-400 text-xs font-bold hover:text-white transition flex items-center gap-2">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto h-screen p-8">

                {/* Header (Hidden for Overview as it has its own custom header now) */}
                {activeTab !== 'overview' && (
                    <div className="flex justify-between items-end mb-8 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 capitalize">
                                {activeTab === 'analytics' ? 'Performance Analytics' :
                                    activeTab === 'deals' ? 'Deal Studio' :
                                        activeTab === 'campaigns' ? 'Push Broadcasts' :
                                            activeTab === 'branches' ? 'Branch Management' :
                                                activeTab === 'notifications' ? 'Alert Center' :
                                                    activeTab === 'support' ? 'Help Center' :
                                                        activeTab === 'billing' ? 'Subscription Plan' : 'Account Settings'}
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">Welcome back, {businessName}</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center transition ${activeTab === 'notifications' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    </div>
                )}

                {/* --- VERIFY TAB --- */}
                {activeTab === 'verify' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"><i className="fa-solid fa-ticket"></i></div>
                            <h2 className="text-2xl font-black text-slate-900">Redeem Deal</h2>
                            <p className="text-slate-500 mb-6">Enter ID to process a transaction.</p>
                            <form onSubmit={handleVerifyRedemption} className="max-w-sm mx-auto space-y-4">
                                <input type="text" required placeholder="Student ID (e.g. 1001)" className="w-full text-center text-xl tracking-widest bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition" value={studentIdInput || ''} onChange={(e) => setStudentIdInput(e.target.value)} />
                                <button type="submit" disabled={redeeming} className="w-full bg-[#0F392B] text-white font-bold py-4 rounded-xl hover:opacity-90 transition">{redeeming ? "Processing..." : "Redeem Now"}</button>
                            </form>
                            {redemptionResult && (
                                <div className={`mt-6 p-4 rounded-xl border-2 ${redemptionResult.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                    {redemptionResult.success ? <div><b>✅ Redeemed!</b><br />{redemptionResult.student.fullName}</div> : <div><b>❌ Failed</b><br />{redemptionResult.error}</div>}
                                </div>
                            )}
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
                            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"><i className="fa-solid fa-magnifying-glass"></i></div>
                            <h2 className="text-2xl font-black text-slate-900">Check Status</h2>
                            <p className="text-slate-500 mb-6">Verify student eligibility.</p>
                            <div className="flex justify-center gap-2 mb-6 bg-slate-100 p-1 rounded-lg w-fit mx-auto">
                                <button type="button" onClick={() => setCheckMethod('EMAIL')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${checkMethod === 'EMAIL' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>By Email</button>
                                <button type="button" onClick={() => setCheckMethod('ID')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${checkMethod === 'ID' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>By ID</button>
                            </div>
                            <form onSubmit={handleCheckStatus} className="max-w-sm mx-auto space-y-4">
                                <input type="text" required placeholder={checkMethod === 'EMAIL' ? "student@uni.edu" : "Student ID (e.g. A7BA4472)"} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-900 focus:outline-none focus:border-purple-500 transition" value={checkInput || ''} onChange={(e) => setCheckInput(e.target.value)} />
                                <button type="submit" disabled={checkingStatus} className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50 transition">{checkingStatus ? "Checking..." : "Verify Student"}</button>
                            </form>
                            {statusResult && (
                                <div className={`mt-6 p-4 rounded-xl border-2 ${statusResult.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                    {statusResult.success ? <div><b>✅ Active Student</b><br />Name: {statusResult.student.fullName}<br /><span className="text-xs opacity-75">ID: {statusResult.student.id}</span></div> : <div><b>❌ Not Found</b><br />{statusResult.error}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- DEALS HISTORY TAB --- */}
                {activeTab === 'deals' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex gap-2 mb-4">
                            {['ALL', 'ACCEPTED', 'PENDING', 'REJECTED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filterStatus === status
                                        ? 'bg-[#0F392B] text-white shadow-md'
                                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                        }`}
                                >
                                    {status === 'ACCEPTED' ? 'Accepted' : status === 'ALL' ? 'All History' : status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                        {filteredHistory.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
                                <p className="text-slate-500 mb-6">No offers found for this filter.</p> {/* Rebranded */}
                                {filterStatus === 'ALL' && (isTrialActive || isSubscribed) && <button onClick={() => setShowModal(true)} className="text-[#0F392B] font-bold underline">Create your first offer</button>} {/* Rebranded */}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                    <h3 className="font-bold text-lg">Offer History</h3> {/* Rebranded */}
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{filteredHistory.length} Record{filteredHistory.length !== 1 && 's'}</span>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Offer Details</th> {/* Rebranded */}
                                            <th className="px-6 py-4">Clicks</th>       {/* ✅ New Column */}
                                            <th className="px-6 py-4">Redemptions</th>  {/* ✅ New Column */}
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredHistory.map((deal) => (
                                            <tr key={deal.id} className="hover:bg-slate-50/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                                                            {deal.image ? <img src={deal.image} alt="Deal" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Img</div>}
                                                        </div>
                                                        <div><div className="font-bold text-slate-900">{deal.title}</div><div className="text-xs text-slate-500">{deal.discountValue} • {deal.views} views</div></div>
                                                    </div>
                                                </td>
                                                {/* ✅ NEW ANALYTICS COLUMNS */}
                                                <td className="px-6 py-4 text-sm font-bold text-purple-600">
                                                    <i className="fa-solid fa-computer-mouse mr-2 opacity-50"></i>{deal.clicks || 0}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-green-600">
                                                    <i className="fa-solid fa-ticket mr-2 opacity-50"></i>{deal.claimed || 0}
                                                </td>

                                                <td className="px-6 py-4 text-xs font-bold text-slate-500">{deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'Just now'}</td>
                                                <td className="px-6 py-4">
                                                    {deal.status === 'ACTIVE' && <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"><i className="fa-solid fa-check"></i> Accepted</span>}
                                                    {deal.status === 'REJECTED' && <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"><i className="fa-solid fa-xmark"></i> Rejected</span>}
                                                    {deal.status === 'PENDING' && <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"><i className="fa-solid fa-clock"></i> Pending</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right pt-6 flex justify-end gap-2">
                                                    <Link href={`/business/edit-deal/${deal.id}`} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition flex items-center justify-center" title="Edit Offer"> {/* Rebranded Tooltip */}
                                                        <i className="fa-solid fa-pen"></i>
                                                    </Link>
                                                    <button onClick={() => handleDeleteDeal(deal.id)} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition flex items-center justify-center" title="Delete Offer"> {/* Rebranded Tooltip */}
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* --- BILLING TAB (✅ REAL STATUS + CANCEL + STRIPE TABLE) --- */}
                {activeTab === 'billing' && (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                        {subscription && (subscription.status === 'active' || subscription.status === 'trialing') ? (
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Current Subscription</h3>
                                        <p className="text-slate-500 text-sm">
                                            Plan: <span className="font-bold text-slate-800">{subscription.plan}</span>
                                        </p>
                                        <p className="text-slate-500 text-sm mt-1">
                                            Status: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-xs uppercase ${subscription.status === 'trialing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                {subscription.status}
                                            </span>
                                        </p>
                                        {subscription.currentPeriodEnd && (
                                            <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-xs font-bold">
                                                <i className="fa-solid fa-clock mr-1"></i>
                                                {subscription.cancelAtPeriodEnd ? 'Expires on ' : 'Renews/Expires on '}
                                                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                                            </div>
                                        )}
                                    </div>
                                    {!subscription.cancelAtPeriodEnd && (
                                        <button
                                            onClick={handleCancelSubscription}
                                            disabled={canceling}
                                            className="border-2 border-red-100 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-bold transition"
                                        >
                                            {canceling ? "Processing..." : "Cancel Subscription"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // @ts-ignore
                            <stripe-pricing-table
                                pricing-table-id="prctbl_1SlTmNIXjVTkZU2iJxgUa5DF"
                                publishable-key="pk_test_51SlG3oIXjVTkZU2iethTPDJYPTg2lpbjxzY4X9zgyRFpxv5oHhJ0WRsAj0nxC8J9E2KjQcvObViifBLN3JgqaBTj00iZoNHDYp"
                            >
                                <i className="fa-solid fa-bell"></i>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- MODULES --- */}

                {activeTab === 'overview' && (
                    <OverviewTab
                        stats={{
                            activeDeals: deals.filter(d => d.status === 'ACTIVE').length,
                            views: stats.reach,
                            claims: deals.reduce((acc, curr) => acc + (curr.claimed || 0), 0), // Calculate total claims
                            redemptions: stats.redemptions,
                            saved: 0 // Mocking saved for now as it wasn't in original stats
                        }}
                        businessName={businessName}
                        setActiveTab={setActiveTab}
                        recentDeals={deals.filter(d => d.status === 'ACTIVE')}
                    />
                )}

                {activeTab === 'deals' && (
                    <DealsTab
                        deals={deals}
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        handleDeleteDeal={handleDeleteDeal}
                        setShowModal={setShowModal}
                    />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsTab stats={stats} />
                )}

                {activeTab === 'billing' && (
                    <BillingTab businessId={businessId} />
                )}

                {activeTab === 'branches' && (
                    <BranchesTab businessId={businessId} />
                )}

                {activeTab === 'campaigns' && (
                    <CampaignsTab businessId={businessId} />
                )}

                {activeTab === 'notifications' && (
                    <NotificationsTab businessId={businessId} />
                )}

                {activeTab === 'support' && (
                    <HelpSupportTab businessId={businessId} />
                )}

                {activeTab === 'settings' && (
                    <SettingsTab businessId={businessId} />
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* PREVIEW CONTAINER */}
                        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">

                            {/* BANNER EDIT AREA */}
                            <div className="relative h-48 bg-slate-100 group cursor-pointer">
                                {profileForm.banner ? (
                                    <img src={profileForm.banner} className="w-full h-full object-cover" alt="Banner" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                                        <i className="fa-solid fa-image mr-2"></i> Upload Banner
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold cursor-pointer">
                                    <i className="fa-solid fa-camera mr-2"></i> Change Banner
                                    <input type="file" accept="image/*" hidden onChange={(e) => handleProfileImageChange(e, 'banner')} />
                                </label>
                            </div>

                            {/* PROFILE CONTENT */}
                            <div className="px-8 pb-8">
                                <div className="flex justify-between items-end -mt-10 mb-6">
                                    {/* LOGO EDIT AREA */}
                                    <div className="relative w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white overflow-hidden group cursor-pointer">
                                        {profileForm.logo ? (
                                            <img src={profileForm.logo} className="w-full h-full object-cover" alt="Logo" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                                                <i className="fa-solid fa-store text-2xl"></i>
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                                            <i className="fa-solid fa-camera"></i>
                                            <input type="file" accept="image/*" hidden onChange={(e) => handleProfileImageChange(e, 'logo')} />
                                        </label>
                                    </div>

                                    {/* ✅ VIEW ON MAP BUTTON IN PREVIEW */}
                                    <div className="flex gap-2">
                                        <a
                                            href={getMapLink()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2 text-xs"
                                        >
                                            <i className="fa-solid fa-map-location-dot"></i> View on Map
                                        </a>
                                        <button onClick={handleSaveProfile} className="bg-[#0F392B] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition">
                                            Save Changes
                                        </button>
                                    </div>
                                </div>

                                {/* EDITABLE FIELDS */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Business Info</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Business Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-[#0F392B] transition" value={profileForm.businessName} onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })} />
                                            <input type="text" placeholder="Phone Number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-[#0F392B] transition" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">About</label>
                                        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-[#0F392B] resize-none h-24" placeholder="Tell students about your business..." value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Location & Web</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* ✅ GOOGLE MAPS INPUT */}
                                            <input type="text" placeholder="Google Maps Profile Link (Optional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-[#0F392B] transition" value={profileForm.googleMapsUrl} onChange={(e) => setProfileForm({ ...profileForm, googleMapsUrl: e.target.value })} />

                                            <input type="text" placeholder="Website URL" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-[#0F392B] transition" value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} />
                                        </div>
                                        <input type="text" placeholder="Address (Street, City, Postcode)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-[#0F392B] transition mt-4" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />

                                        {/* ✅ EMBED MAP CODE INPUT */}
                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Google Maps Embed Code (Optional)</label>
                                            <textarea
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-xs font-mono text-slate-600 focus:outline-none focus:border-[#0F392B] resize-none h-20"
                                                placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>'
                                                value={profileForm.googleMapEmbed}
                                                onChange={(e) => setProfileForm({ ...profileForm, googleMapEmbed: e.target.value })}
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1 ml-1">Paste the full iframe code from Google Maps (Share {'>'} Embed a map).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-8 text-center">
                            <button onClick={handleDeleteAccount} className="text-red-400 text-xs font-bold hover:text-red-600 underline">Delete Account Permanently</button>
                        </div>
                    </div>
                )}

            </main>

            {/* CREATE DEAL MODAL (Could be extracted too) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-black mb-4">Create Deal (Step 1)</h2>
                        {/* ... Form Content ... */}
                        <button onClick={() => setShowModal(false)} className="text-red-500 font-bold">Close</button>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900">Create New Deal</h2>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <form onSubmit={handleCreateDeal} className="space-y-5">

                            {/* Image Upload Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Deal Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                                        {dealForm.image ? (
                                            <img src={dealForm.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <i className="fa-solid fa-image text-slate-300 text-xl"></i>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                                </div>
                            </div>

                            <InputGroup label="Offer Title" placeholder="e.g. 2-for-1 Burgers" value={dealForm.title} onChange={(v: string) => setDealForm({ ...dealForm, title: v })} />

                            {/* ✅ CATEGORIES (MULTI-SELECT) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Categories (Select Multiple)</label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {categories.map((cat: any) => {
                                        const isSelected = dealForm.categoryIds.includes(cat.id.toString());
                                        return (
                                            <div
                                                key={cat.id}
                                                onClick={() => {
                                                    const currentIds = dealForm.categoryIds;
                                                    const catId = cat.id.toString();
                                                    let newIds;
                                                    if (currentIds.includes(catId)) {
                                                        newIds = currentIds.filter(id => id !== catId);
                                                    } else {
                                                        newIds = [...currentIds, catId];
                                                    }
                                                    setDealForm({ ...dealForm, categoryIds: newIds });
                                                }}
                                                className={`cursor-pointer px-3 py-2.5 rounded-xl border-2 font-bold text-xs text-center transition-all select-none flex items-center justify-center gap-2 ${isSelected
                                                        ? 'bg-[#0F392B] border-[#0F392B] text-white shadow-md'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white'
                                                    }`}
                                            >
                                                {cat.name}
                                                {isSelected && <i className="fa-solid fa-check"></i>}
                                            </div>
                                        )
                                    })}
                                </div>
                                {dealForm.categoryIds.length === 0 && (
                                    <p className="text-xs text-red-400 mt-2 font-bold px-1"><i className="fa-solid fa-circle-exclamation mr-1"></i> Required</p>
                                )}
                            </div>

                            {/* ✅ REDEMPTION METHOD SELECTOR */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Redemption Method</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div
                                        onClick={() => setDealForm({ ...dealForm, redemptionMethod: 'SWIPE_SINGLE' })}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center h-28 ${dealForm.redemptionMethod === 'SWIPE_SINGLE' ? 'border-[#0F392B] bg-green-50 text-[#0F392B]' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                                    >
                                        <i className="fa-solid fa-mobile-screen-button text-2xl"></i>
                                        <div>
                                            <div className="font-bold text-sm">Single Swipe</div>
                                            <div className="text-[10px] opacity-70">One-time use</div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setDealForm({ ...dealForm, redemptionMethod: 'SWIPE_MULTI' })}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center h-28 ${dealForm.redemptionMethod === 'SWIPE_MULTI' ? 'border-[#0F392B] bg-green-50 text-[#0F392B]' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                                    >
                                        <i className="fa-solid fa-rotate text-2xl"></i>
                                        <div>
                                            <div className="font-bold text-sm">Multi Swipe</div>
                                            <div className="text-[10px] opacity-70">Unlimited usage</div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setDealForm({ ...dealForm, redemptionMethod: 'CODE_SINGLE' })}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center h-28 ${dealForm.redemptionMethod === 'CODE_SINGLE' ? 'border-[#0F392B] bg-green-50 text-[#0F392B]' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                                    >
                                        <i className="fa-solid fa-barcode text-2xl"></i>
                                        <div>
                                            <div className="font-bold text-sm">Unique Code</div>
                                            <div className="text-[10px] opacity-70">Online/Trackable</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* ✅ TOGGLE DISCOUNT FIELD (MASTER SWITCH + SUB-SELECTOR) */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Add Discount?</label>

                                        {/* Master Toggle Switch */}
                                        <div
                                            className={`flex items-center rounded-full p-0.5 cursor-pointer w-12 relative transition-colors duration-300 ${dealForm.hasDiscount ? 'bg-[#0F392B]' : 'bg-red-500'}`}
                                            onClick={() => setDealForm(prev => ({ ...prev, hasDiscount: !prev.hasDiscount, discountAmount: '' }))}
                                        >
                                            <div className={`absolute w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${dealForm.hasDiscount ? 'left-[calc(100%-1.4rem)]' : 'left-0.5'}`}></div>
                                        </div>
                                    </div>

                                    {/* Only Show Selector If Master Toggle Is ON */}
                                    {dealForm.hasDiscount && (
                                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                            {/* Sub-Selector: Percentage vs Amount */}
                                            <div className="flex bg-slate-100 rounded-lg p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setDealForm(prev => ({ ...prev, discountType: 'PERCENTAGE' }))}
                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${dealForm.discountType === 'PERCENTAGE' ? 'bg-white shadow-sm text-[#0F392B]' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Percentage (%)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDealForm(prev => ({ ...prev, discountType: 'AMOUNT' }))}
                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${dealForm.discountType === 'AMOUNT' ? 'bg-white shadow-sm text-[#0F392B]' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Amount (£)
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder={dealForm.discountType === 'PERCENTAGE' ? "20" : "5"}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-8 py-3.5 font-bold text-slate-900 focus:outline-none focus:border-[#0F392B] transition"
                                                    value={dealForm.discountAmount}
                                                    onChange={(e) => setDealForm({ ...dealForm, discountAmount: e.target.value })}
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                                                    {dealForm.discountType === 'PERCENTAGE' ? '%' : '£'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Show "No Discount" text if OFF */}
                                    {!dealForm.hasDiscount && (
                                        <div className="h-[88px] flex items-center justify-center text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            No discount badge will be shown
                                        </div>
                                    )}
                                </div>

                                {/* ✅ EXPIRY DATE FIELD WITH "INDEFINITE" CHECKBOX */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Expiry Date</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={dealForm.isIndefinite}
                                                onChange={(e) => setDealForm({ ...dealForm, isIndefinite: e.target.checked, expiry: '' })}
                                                className="w-4 h-4 rounded border-slate-300 text-[#0F392B] focus:ring-[#0F392B]"
                                            />
                                            <span className="text-[10px] font-bold text-slate-500">No Expiry</span>
                                        </label>
                                    </div>
                                    <input
                                        type="date"
                                        disabled={dealForm.isIndefinite}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:border-[#0F392B] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={dealForm.expiry}
                                        onChange={(e) => setDealForm({ ...dealForm, expiry: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Description</label><textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-[#0F392B] resize-none h-24" placeholder="Terms..." value={dealForm.description} onChange={e => setDealForm({ ...dealForm, description: e.target.value })}></textarea></div>

                            <div className="pt-2">
                                <p className="text-xs text-slate-400 mb-4 text-center">
                                    * A unique single-use code will be automatically generated for each student.
                                </p>
                                <button type="submit" disabled={creatingDeal} className="w-full bg-[#FF3B30] text-white font-bold py-4 rounded-xl hover:bg-[#d63026] transition shadow-lg shadow-red-200 flex justify-center">{creatingDeal ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Publish Deal'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
