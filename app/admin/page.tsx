'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
    const router = useRouter()

    // --- STATE ---
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)

    // Data States
    const [stats, setStats] = useState({ revenue: 0, livePartners: 0, pendingRequests: 0, activeStudents: 0 })
    const [partners, setPartners] = useState<any[]>([]) // Renamed from applications to partners for clarity
    const [userAnalytics, setUserAnalytics] = useState<any>(null)
    const [pushRequests, setPushRequests] = useState<any[]>([])
    const [universities, setUniversities] = useState<any[]>([])
    const [allDeals, setAllDeals] = useState<any[]>([])
    const [allUsers, setAllUsers] = useState<any[]>([]) // ✅ Full User List State
    const [partnerFilter, setPartnerFilter] = useState('ACTIVE') // ✅ Filter State

    // Modal States
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [profileData, setProfileData] = useState({ name: '', newPassword: '' })
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
    const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
    const [extensionDays, setExtensionDays] = useState(30)
    const [isComposeModalOpen, setIsComposeModalOpen] = useState(false)

    // Edit Deal Modal State
    const [isEditDealOpen, setIsEditDealOpen] = useState(false)
    const [editingDeal, setEditingDeal] = useState<any>(null)

    // Push Composition State
    const [pushForm, setPushForm] = useState({ title: '', message: '', universityId: '', radius: 0, verifiedOnly: false })
    const [estimatedReach, setEstimatedReach] = useState<number | null>(null)
    const [isCalculating, setIsCalculating] = useState(false)

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const isAdmin = localStorage.getItem('adminSession')
        if (!isAdmin) {
            router.push('/admin/login')
            return
        }

        // Initial Load
        fetchOverviewData()
        fetchPartners() // New fetch
        fetchUserAnalytics()
        fetchPushRequests()
        fetchUniversities()
        fetchDeals()
        fetchUsers() // ✅ Fetch all users
    }, [])

    const fetchOverviewData = async () => {
        try {
            const res = await fetch('/api/auth/admin/stats')
            const data = await res.json()
            if (data.stats) {
                setStats({
                    revenue: data.stats.revenue,
                    livePartners: data.stats.totalBusinesses,
                    activeStudents: data.stats.activeStudents,
                    pendingRequests: data.stats.pendingRequests
                })
                // Removed setApplications here, handled by fetchPartners
            }
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    const fetchPartners = async () => {
        try {
            // New Endpoint
            const res = await fetch('/api/auth/admin/partners/list')
            const data = await res.json()
            if (Array.isArray(data)) setPartners(data)
        } catch (e) { console.error(e) }
    }

    // ... (Keep existing fetch functions)
    const fetchUserAnalytics = async () => { try { const res = await fetch('/api/auth/admin/analytics/users'); if (res.ok) setUserAnalytics(await res.json()); } catch (e) { } }
    const fetchUsers = async () => { try { const res = await fetch('/api/auth/admin/users/list'); if (res.ok) setAllUsers(await res.json()); } catch (e) { } } // ✅ Fetch Function
    const fetchPushRequests = async () => { try { const res = await fetch('/api/auth/admin/push/list'); if (res.ok) setPushRequests(await res.json()); } catch (e) { } }
    const fetchUniversities = async () => { try { const res = await fetch('/api/auth/admin/universities/list'); if (res.ok) setUniversities(await res.json()); } catch (e) { } }
    const fetchDeals = async () => { try { const res = await fetch('/api/auth/admin/deals/list'); if (res.ok) setAllDeals(await res.json()); } catch (e) { } }

    // --- 2. ACTIONS ---

    // Moderate Deal (Approve/Reject)
    const handleDealModeration = async (dealId: number, action: string) => {
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
        setAllDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d))

        // ✅ UPDATED PATH
        await fetch('/api/auth/admin/deals/moderate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dealId, action })
        })
        fetchDeals()
    }

    // Boost Deal
    const toggleDealPriority = async (dealId: number, currentScore: number) => {
        const newScore = currentScore > 0 ? 0 : 10
        setAllDeals(prev => prev.map(d => d.id === dealId ? { ...d, priorityScore: newScore } : d))

        // ✅ UPDATED PATH
        await fetch('/api/auth/admin/deals/prioritize', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dealId, priorityScore: newScore })
        })
    }

    const handleSendBlast = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!pushForm.title || !pushForm.message) return alert("Title and Message required")

        // ✅ UPDATED PATH
        const res = await fetch('/api/auth/admin/push/send-manual', {
            method: 'POST',
            body: JSON.stringify({
                ...pushForm,
                filters: {
                    uni: pushForm.universityId,
                    radius: pushForm.radius,
                    verified: pushForm.verifiedOnly
                },
                estimatedReach
            })
        })

        if (res.ok) {
            alert("Notification Sent Successfully!")
            setIsComposeModalOpen(false)
            setPushForm({ title: '', message: '', universityId: '', radius: 0, verifiedOnly: false })
            fetchPushRequests()
        } else {
            alert("Failed to send")
        }
    }

    const handlePushAction = async (id: number, action: string) => {
        setPushRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: action === 'APPROVE' ? 'SENT' : 'REJECTED' } : req
        ))

        // ✅ UPDATED PATH
        await fetch('/api/auth/admin/push/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action })
        })
        fetchPushRequests()
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        // Optimistic UI Update - Remove if deleting
        if (newStatus === 'REJECTED') {
            setPartners(prev => prev.filter(app => app.id !== id))
        } else {
            setPartners(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app))
        }

        const actionMap: any = { 'APPROVED': 'APPROVE', 'REJECTED': 'REJECT' } // ✅ Map REJECTED to REJECT (Soft Reject)

        // ✅ UPDATED PATH
        await fetch('/api/auth/admin/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: actionMap[newStatus] || 'DELETE' })
        })
        fetchOverviewData()
        fetchPartners() // ✅ Fetch fresh list to confirm status
    }

    const handleOpenEditDeal = (deal: any) => {
        setEditingDeal(deal)
        setIsEditDealOpen(true)
    }

    const submitDealEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingDeal) return

        try {
            const res = await fetch(`/api/auth/deals/${editingDeal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingDeal)
            })

            if (res.ok) {
                alert("Deal Updated Successfully")
                setIsEditDealOpen(false)
                fetchDeals()
            } else {
                alert("Failed to update deal")
            }
        } catch (error) {
            console.error(error)
            alert("Error updating deal")
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSettingsOpen(false)
        alert("Profile Updated (Simulation)")
    }

    // Reach Calculation
    useEffect(() => {
        if (isComposeModalOpen) {
            const timer = setTimeout(() => {
                calculateReach()
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [pushForm.universityId, pushForm.radius, pushForm.verifiedOnly])

    const calculateReach = async () => {
        setIsCalculating(true)
        try {
            // ✅ UPDATED PATH
            const res = await fetch('/api/auth/admin/push/estimate', {
                method: 'POST',
                body: JSON.stringify(pushForm)
            })
            const data = await res.json()
            setEstimatedReach(data.count)
        } catch (e) { } finally { setIsCalculating(false) }
    }

    const openExtendModal = (business: any) => { setSelectedBusiness(business); setIsExtendModalOpen(true) }

    const submitExtension = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedBusiness) return

        // ✅ UPDATED PATH
        const res = await fetch('/api/auth/admin/extend-trial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId: selectedBusiness.id, days: parseInt(extensionDays.toString()) })
        })
        if (res.ok) {
            alert(`Trial extended for ${selectedBusiness.businessName}`)
            setIsExtendModalOpen(false)
            fetchOverviewData()
        } else {
            alert("Failed to extend trial")
        }
    }

    const handleSignOut = () => {
        localStorage.removeItem('adminSession')
        router.push('/')
    }

    // --- HELPERS ---
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold">NEEDS REVIEW</span>
            case 'SENT': case 'APPROVED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">LIVE</span>
            case 'REJECTED': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold">REJECTED</span>
            default: return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold">{status}</span>
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FC] font-sans flex">
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full z-10">
                <div className="p-8">
                    <h1 className="text-2xl font-black text-slate-900">Student<span className="text-red-500">.LIFE</span></h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Control Center</p>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <NavButton id="overview" label="Overview" icon="fa-table-columns" active={activeTab} set={setActiveTab} />
                    <NavButton id="users" label="Users & Stats" icon="fa-users" active={activeTab} set={setActiveTab} />
                    <NavButton id="deals" label="Offers & Moderation" icon="fa-tags" active={activeTab} set={setActiveTab} />
                    <NavButton id="push" label="Notifications" icon="fa-bell" active={activeTab} set={setActiveTab} />
                    <Link href="/admin/universities" className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-sm font-bold">
                        <i className="fa-solid fa-school w-5 text-center"></i> Universities
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-100 space-y-2">
                    <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold">
                        <i className="fa-solid fa-gear"></i> Settings
                    </button>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold">
                        <i className="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-72 p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">{activeTab === 'push' ? 'Notifications' : activeTab}</h2>
                        <p className="text-slate-500 text-sm mt-1">Real-time platform insights.</p>
                    </div>
                    <button onClick={() => { fetchOverviewData(); fetchPushRequests(); fetchDeals(); }} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:rotate-180 transition-transform duration-500">
                        <i className="fa-solid fa-arrows-rotate"></i>
                    </button>
                </header>

                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                            <StatCard title="Total Revenue" value={`£${stats.revenue}`} icon="wallet" color="text-emerald-500" bg="bg-emerald-50" loading={loading} />
                            <StatCard title="Live Partners" value={stats.livePartners} icon="shop" color="text-indigo-500" bg="bg-indigo-50" loading={loading} />
                            <StatCard title="Pending Requests" value={stats.pendingRequests} icon="clock" color="text-amber-500" bg="bg-amber-50" loading={loading} />
                            <StatCard title="Active Students" value={stats.activeStudents} icon="user-graduate" color="text-red-500" bg="bg-red-50" loading={loading} />
                        </div>
                        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">Partner Management</h3>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button onClick={() => setPartnerFilter('ACTIVE')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${partnerFilter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Active & Pending</button>
                                    <button onClick={() => setPartnerFilter('REJECTED')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${partnerFilter === 'REJECTED' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-red-600'}`}>Rejected</button>
                                </div>
                            </div>
                            {loading ? <div className="p-8 text-center">Loading...</div> : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-8 py-4">Business</th>
                                            <th className="px-8 py-4">Secret (Hash)</th>
                                            <th className="px-8 py-4">Plan</th>
                                            <th className="px-8 py-4">Status</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {partners.filter(p => partnerFilter === 'REJECTED' ? p.status === 'REJECTED' : p.status !== 'REJECTED').length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No partners found in this category.</td></tr>
                                        ) : (
                                            partners.filter(p => partnerFilter === 'REJECTED' ? p.status === 'REJECTED' : p.status !== 'REJECTED').map((app) => (
                                                <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5"><div className="font-bold text-slate-900">{app.businessName}</div><div className="text-xs text-slate-400">{app.email}</div></td>
                                                    <td className="px-8 py-5">
                                                        <div className="group/pass relative">
                                                            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded select-all cursor-help">
                                                                {app.password ? app.password.substring(0, 10) + '...' : 'No Password'}
                                                            </span>
                                                            <div className="absolute top-full left-0 z-50 hidden group-hover/pass:block bg-black text-white text-[10px] p-2 rounded shadow-lg w-64 break-all">
                                                                {app.password || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-bold text-slate-600">{app.plan === 'YEARLY' ? <span className="text-[#FF3B30]">PRO</span> : 'Trial'}</td>
                                                    <td className="px-8 py-5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${app.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : app.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{app.status}</span></td>
                                                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                                                        {partnerFilter === 'ACTIVE' && (
                                                            <>
                                                                <button onClick={() => openExtendModal(app)} className="px-3 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100" title="Extend Trial"><i className="fa-solid fa-calendar-plus"></i></button>
                                                                {app.status !== 'ACTIVE' && (
                                                                    <>
                                                                        <button onClick={() => handleStatusUpdate(app.id, 'APPROVED')} className="px-3 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100"><i className="fa-solid fa-check"></i></button>
                                                                        <button onClick={() => handleStatusUpdate(app.id, 'REJECTED')} className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100"><i className="fa-solid fa-ban"></i></button>
                                                                    </>
                                                                )}
                                                                {app.status === 'ACTIVE' && (
                                                                    <button onClick={() => { if (confirm("Are you sure? This will delete the account.")) handleStatusUpdate(app.id, 'REJECTED') }} className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100" title="Delete Account"><i className="fa-solid fa-trash"></i></button>
                                                                )}
                                                            </>
                                                        )}
                                                        {partnerFilter === 'REJECTED' && (
                                                            <>
                                                                <button onClick={() => handleStatusUpdate(app.id, 'APPROVED')} className="px-3 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100" title="Restore"><i className="fa-solid fa-rotate-left"></i> Restore</button>
                                                                <button onClick={() => { if (confirm("Permanently delete?")) handleStatusUpdate(app.id, 'DELETE') }} className="px-3 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white" title="Permanent Delete"><i className="fa-solid fa-trash"></i></button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            )))}
                                    </tbody>
                                </table>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'deals' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[2rem] border border-amber-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-amber-100 bg-amber-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-black text-amber-900 flex items-center gap-2"><i className="fa-solid fa-gavel"></i> Moderation Queue</h3>
                                    <p className="text-xs text-amber-700">Approve these offers to make them live.</p>
                                </div>
                                <div className="text-sm font-bold text-amber-900 bg-amber-200 px-3 py-1 rounded-full">{allDeals.filter(d => d.status === 'PENDING').length} Pending</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-amber-50/50 text-xs font-bold text-amber-800 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-8 py-4">Pending Offer</th>
                                            <th className="px-8 py-4">Business</th>
                                            <th className="px-8 py-4">Details</th>
                                            <th className="px-8 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-100">
                                        {allDeals.filter(d => d.status === 'PENDING').length === 0 ? (
                                            <tr><td colSpan={4} className="p-8 text-center text-amber-400">All clear! No pending offers.</td></tr>
                                        ) : (
                                            allDeals.filter(d => d.status === 'PENDING').map(deal => (
                                                <tr key={deal.id} className="hover:bg-amber-50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-slate-900">{deal.title}</div>
                                                        <div className="text-xs text-slate-500">{deal.category}</div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-bold text-slate-600">{deal.business.businessName}</td>
                                                    <td className="px-8 py-5 text-xs text-slate-500 max-w-xs truncate">{deal.description}</td>
                                                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                                                        <button onClick={() => handleOpenEditDeal(deal)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition" title="Edit Offer">
                                                            <i className="fa-solid fa-pen"></i>
                                                        </button>
                                                        <button onClick={() => handleDealModeration(deal.id, 'APPROVE')} className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 shadow-md shadow-emerald-200">Approve</button>
                                                        <button onClick={() => handleDealModeration(deal.id, 'REJECT')} className="px-4 py-2 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200">Reject</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">Live Offers</h3>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Publicly Visible</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-8 py-4">Offer Title</th>
                                            <th className="px-8 py-4">Business</th>
                                            <th className="px-8 py-4">Status</th>
                                            <th className="px-8 py-4 text-right">Priority</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {allDeals.filter(d => d.status !== 'PENDING').map(deal => (
                                            <tr key={deal.id} className={`transition-colors ${deal.priorityScore > 0 ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50/50'}`}>
                                                <td className="px-8 py-5 font-bold text-slate-900">{deal.title}</td>
                                                <td className="px-8 py-5 text-sm text-slate-600">
                                                    {deal.business.businessName}
                                                    {deal.business.plan === 'YEARLY' && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1 rounded font-bold">PRO</span>}
                                                </td>
                                                <td className="px-8 py-5">{getStatusBadge(deal.status)}</td>
                                                <td className="px-8 py-5 text-right flex justify-end gap-2 items-center">
                                                    <button onClick={() => handleOpenEditDeal(deal)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition mr-2" title="Edit Offer">
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => toggleDealPriority(deal.id, deal.priorityScore)}
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${deal.priorityScore > 0
                                                            ? 'bg-amber-400 text-white shadow-lg shadow-amber-200 scale-105'
                                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        <i className={`fa-solid fa-star mr-2 ${deal.priorityScore > 0 ? 'animate-pulse' : ''}`}></i>
                                                        {deal.priorityScore > 0 ? 'BOOSTED' : 'BOOST'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'push' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <i className="fa-solid fa-circle-exclamation text-amber-500"></i> Priority Queue
                                </h3>
                                <button onClick={() => setIsComposeModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-800 transition"><i className="fa-solid fa-pen-nib mr-2"></i> Compose Blast</button>
                            </div>
                            {pushRequests.filter(r => r.status === 'PENDING').length === 0 ? (
                                <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center text-slate-400">No pending push requests.</div>
                            ) : (
                                pushRequests.filter(r => r.status === 'PENDING').map(req => (
                                    <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                        <div className="flex justify-between items-start mb-4 pl-2">
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">{req.business?.category || 'Unknown'}</div>
                                                <h4 className="text-lg font-black text-slate-900">{req.business?.businessName || 'Business'}</h4>
                                            </div>
                                            <div className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-600">Radius: {req.targetRadius}km</div>
                                        </div>
                                        <div className="bg-[#F8F9FC] p-4 rounded-xl mb-6">
                                            <h5 className="font-bold text-sm text-slate-900 mb-1">{req.title}</h5>
                                            <p className="text-sm text-slate-600">{req.message}</p>
                                        </div>
                                        <div className="flex gap-3 pl-2">
                                            <button onClick={() => handlePushAction(req.id, 'APPROVE')} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition shadow-lg shadow-slate-200">Approve & Send</button>
                                            <button onClick={() => handlePushAction(req.id, 'REJECT')} className="px-6 border border-slate-200 text-slate-500 py-3 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-500 transition">Reject</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><i className="fa-solid fa-clock-rotate-left text-slate-400"></i> History</h3>
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="max-h-[600px] overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase sticky top-0 backdrop-blur-md">
                                            <tr>
                                                <th className="px-6 py-4">Request</th>
                                                <th className="px-6 py-4">Sender</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {pushRequests.filter(r => r.status !== 'PENDING').map(req => (
                                                <tr key={req.id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900 text-sm">{req.title}</div>
                                                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{req.message}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold">{req.business ? req.business.businessName : <span className="text-indigo-600">SYSTEM BLAST</span>}</td>
                                                    <td className="px-6 py-4 text-right">{getStatusBadge(req.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && userAnalytics && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Total Students" value={userAnalytics.total} icon="users" color="text-slate-900" bg="bg-white" />
                            <StatCard title="Verified Users" value={userAnalytics.verified} icon="check-circle" color="text-green-600" bg="bg-green-50" />
                            <StatCard title="New Today" value={`+${userAnalytics.newToday}`} icon="chart-line" color="text-blue-600" bg="bg-blue-50" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Top Universities</h3>
                                <div className="space-y-5">
                                    {userAnalytics.uniDistribution.length === 0 && <div className="text-slate-400 text-sm">No data yet.</div>}
                                    {userAnalytics.uniDistribution.map((uni: any, idx: number) => {
                                        const percentage = (uni._count.university / userAnalytics.total) * 100
                                        return (
                                            <div key={idx}>
                                                <div className="flex justify-between text-xs font-bold mb-1">
                                                    <span className="text-slate-600 truncate max-w-[150px]">{uni.university}</span>
                                                    <span className="text-slate-900">{uni._count.university}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div className="bg-[#FF3B30] h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Student Directory ({allUsers.length})</h3>
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 sticky top-0 bg-white">
                                        <tr><th className="pb-3">Name</th><th className="pb-3">University</th><th className="pb-3 text-right">Status</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {allUsers.length === 0 ? (
                                            <tr><td colSpan={3} className="py-8 text-center text-slate-400">No students found.</td></tr>
                                        ) : (
                                            allUsers.map((stu: any) => (
                                                <tr key={stu.id}>
                                                    <td className="py-4"><div className="font-bold text-slate-900">{stu.fullName}</div><div className="text-xs text-slate-400">{stu.email}</div></td>
                                                    <td className="py-4 text-sm text-slate-500">{stu.university}</td>
                                                    <td className="py-4 text-right">{stu.isVerified ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Verified</span> : <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Pending</span>}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

            </main >

            {/* MODALS */}
            {isComposeModalOpen && <ComposeModal pushForm={pushForm} setPushForm={setPushForm} handleSendBlast={handleSendBlast} universities={universities} estimatedReach={estimatedReach} isCalculating={isCalculating} setIsComposeModalOpen={setIsComposeModalOpen} />}
            {isExtendModalOpen && <ExtendModal selectedBusiness={selectedBusiness} extensionDays={extensionDays} setExtensionDays={setExtensionDays} submitExtension={submitExtension} setIsExtendModalOpen={setIsExtendModalOpen} />}
            {isSettingsOpen && <SettingsModal profileData={profileData} setProfileData={setProfileData} handleProfileUpdate={handleProfileUpdate} setIsSettingsOpen={setIsSettingsOpen} />}
            {isEditDealOpen && <EditDealModal editingDeal={editingDeal} setEditingDeal={setEditingDeal} submitDealEdit={submitDealEdit} setIsEditDealOpen={setIsEditDealOpen} />}
        </div >
    )
}

function StatCard({ title, value, icon, color, bg, loading }: any) {
    return (
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center text-xl mb-4`}><i className={`fa-solid fa-${icon}`}></i></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            {loading ? <div className="h-8 w-24 bg-slate-100 rounded animate-pulse mt-1"></div> : <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>}
        </div>
    )
}

const NavButton = ({ id, label, icon, active, set }: any) => (
    <button onClick={() => set(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active === id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50'}`}>
        <i className={`fa-solid ${icon} w-5 text-center`}></i> {label}
    </button>
)

const ComposeModal = ({ pushForm, setPushForm, handleSendBlast, universities, estimatedReach, isCalculating, setIsComposeModalOpen }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">New Manual Blast</h3>
                <button onClick={() => setIsComposeModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSendBlast} className="space-y-5">
                <div className="space-y-3">
                    <input placeholder="Title" className="w-full p-3 bg-slate-50 rounded-xl font-bold" value={pushForm.title} onChange={e => setPushForm({ ...pushForm, title: e.target.value })} />
                    <textarea placeholder="Message" rows={3} className="w-full p-3 bg-slate-50 rounded-xl" value={pushForm.message} onChange={e => setPushForm({ ...pushForm, message: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <select className="w-full p-3 bg-slate-50 rounded-xl text-sm" value={pushForm.universityId} onChange={e => setPushForm({ ...pushForm, universityId: e.target.value })}>
                        <option value="">All Universities</option>
                        {universities.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <input type="number" placeholder="Radius (km)" className="w-full p-3 bg-slate-50 rounded-xl text-sm" value={pushForm.radius} onChange={e => setPushForm({ ...pushForm, radius: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl flex justify-between items-center text-indigo-900">
                    <span className="text-xs font-bold uppercase">Estimated Reach</span>
                    <span className="text-xl font-black">{isCalculating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : estimatedReach || '-'}</span>
                </div>
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-slate-300">Send</button>
            </form>
        </div>
    </div>
)

const ExtendModal = ({ selectedBusiness, extensionDays, setExtensionDays, submitExtension, setIsExtendModalOpen }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Extend Trial</h3>
            <p className="text-sm text-slate-500 mb-6">Add free days to <span className="font-bold text-slate-900">{selectedBusiness.businessName}</span>.</p>
            <form onSubmit={submitExtension} className="space-y-4">
                <div>
                    <select className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold" value={extensionDays} onChange={(e) => setExtensionDays(Number(e.target.value))}>
                        <option value="7">7 Days</option><option value="30">30 Days</option><option value="90">90 Days</option>
                    </select>
                </div>
                <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setIsExtendModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Confirm</button>
                </div>
            </form>
        </div>
    </div>
)

const SettingsModal = ({ profileData, setProfileData, handleProfileUpdate, setIsSettingsOpen }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Update Profile</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
                <input placeholder="Name" className="w-full p-3 bg-slate-50 rounded-xl" onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
                <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setIsSettingsOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-bold">Save</button>
                </div>
            </form>
        </div>
    </div>
)

const EditDealModal = ({ editingDeal, setEditingDeal, submitDealEdit, setIsEditDealOpen }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Offer</h3>
            <form onSubmit={submitDealEdit} className="space-y-4">
                {/* ROW 1: Title & Discount */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Title</label>
                        <input className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold" value={editingDeal.title} onChange={(e) => setEditingDeal({ ...editingDeal, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Discount</label>
                        <input className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={editingDeal.discountValue || editingDeal.discount} onChange={(e) => setEditingDeal({ ...editingDeal, discount: e.target.value, discountValue: e.target.value })} />
                    </div>
                </div>

                {/* ROW 2: Category & Sub Category */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                        <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={editingDeal.category} onChange={(e) => setEditingDeal({ ...editingDeal, category: e.target.value })}>
                            <option>Food</option><option>Tech</option><option>Fashion</option><option>Entertainment</option><option>Services</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Sub Category</label>
                        <input className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" placeholder="e.g. Burgers" value={editingDeal.subCategory || ''} onChange={(e) => setEditingDeal({ ...editingDeal, subCategory: e.target.value })} />
                    </div>
                </div>

                {/* ROW 3: Expiry & Image */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Expiry Date</label>
                        <input type="date" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={editingDeal.expiry ? editingDeal.expiry.split('T')[0] : ''} onChange={(e) => setEditingDeal({ ...editingDeal, expiry: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Image URL</label>
                        <input className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" placeholder="https://..." value={editingDeal.image || ''} onChange={(e) => setEditingDeal({ ...editingDeal, image: e.target.value })} />
                    </div>
                </div>

                {/* ROW 4: Status & Priority */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                        <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={editingDeal.status} onChange={(e) => setEditingDeal({ ...editingDeal, status: e.target.value })}>
                            <option value="PENDING">PENDING</option>
                            <option value="APPROVED">APPROVED (LIVE)</option>
                            <option value="REJECTED">REJECTED</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Priority Score</label>
                        <input type="number" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={editingDeal.priorityScore} onChange={(e) => setEditingDeal({ ...editingDeal, priorityScore: parseInt(e.target.value) || 0 })} />
                    </div>
                </div>

                {/* ROW 5: Redemption & Usage */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Redemption Type</label>
                        <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={editingDeal.redemptionType || 'SWIPE'} onChange={(e) => setEditingDeal({ ...editingDeal, redemptionType: e.target.value })}>
                            <option value="SWIPE">Swipe (In-Store)</option>
                            <option value="CODE">Code (Online)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Usage Limit</label>
                        <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={editingDeal.isMultiUse ? 'MULTI' : 'SINGLE'} onChange={(e) => setEditingDeal({ ...editingDeal, isMultiUse: e.target.value === 'MULTI' })}>
                            <option value="SINGLE">Single Use</option>
                            <option value="MULTI">Multi Use (Unlimited)</option>
                        </select>
                    </div>
                </div>

                {/* URGENT TOGGLE */}
                <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                    <input type="checkbox" id="isUrgent" className="w-5 h-5 accent-red-600" checked={editingDeal.isUrgent || false} onChange={(e) => setEditingDeal({ ...editingDeal, isUrgent: e.target.checked })} />
                    <label htmlFor="isUrgent" className="text-sm font-bold text-red-700 cursor-pointer">Mark as URGENT Deal</label>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                    <textarea rows={3} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100" value={editingDeal.description} onChange={(e) => setEditingDeal({ ...editingDeal, description: e.target.value })} />
                </div>

                {/* REJECTION REASON (If Rejected) */}
                {editingDeal.status === 'REJECTED' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-red-400 uppercase">Rejection Reason</label>
                        <textarea rows={2} className="w-full p-3 bg-red-50 rounded-xl border border-red-100 text-red-900 placeholder-red-300" placeholder="Explain why..." value={editingDeal.rejectionReason || ''} onChange={(e) => setEditingDeal({ ...editingDeal, rejectionReason: e.target.value })} />
                    </div>
                )}

                <div className="flex gap-2 mt-6">
                    <button type="button" onClick={() => setIsEditDealOpen(false)} className="flex-1 py-3 border rounded-xl font-bold hover:bg-slate-50">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
)