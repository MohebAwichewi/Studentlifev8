'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ✅ MODULAR IMPORTS
import OverviewStats from '@/components/admin/OverviewStats'
import LiveFeed from '@/components/admin/LiveFeed'
import Heatmap from '@/components/admin/Heatmap'
import PendingApprovals from '@/components/admin/PendingApprovals'
import PartnerTable from '@/components/admin/PartnerTable'
import UserTable from '@/components/admin/UserTable'
import PushNotifications from '@/components/admin/PushNotifications'
import CityManagement from '@/components/admin/CityManagement'
import CategoryManagement from '@/components/admin/CategoryManagement'

// --- SIDEBAR BTN HELPER ---
function SidebarBtn({ label, icon, active, onClick }: { label: string, icon: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <i className={`fa-solid fa-${icon} w-6 text-center`}></i>
      {label}
    </button>
  )
}

export default function AdminDashboard() {
  const router = useRouter()

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // --- DATA STATE ---
  const [stats, setStats] = useState({
    users: { total: 0, new: 0, growth: 0 },
    businesses: { active: 0, pending: 0, rejected: 0, total: 0 },
    deals: { active: 0, expired: 0 },
    tickets: { total: 0, redeemed: 0, conversionRate: 0 },
    revenue: 0
  })
  const [feed, setFeed] = useState<any[]>([])
  const [pendingPartners, setPendingPartners] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchData()
  }, [])

  // --- FETCH MASTER ---
  const fetchData = async () => {
    try {
      setLoading(true)
      // 1. Stats & Feed (New Endpoint)
      const statsRes = await fetch('/api/auth/admin/stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) {
          setStats(data.stats);
          setFeed(data.activity.redemptions.concat(data.activity.registrations).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }
      } else {
        console.error('Failed to fetch stats')
      }

      // 2. Partners (Active & Pending)
      const partnersRes = await fetch('/api/auth/admin/partners/list');
      if (partnersRes.ok) {
        const allPartners = await partnersRes.json();
        setPartners(allPartners.filter((p: any) => p.status === 'ACTIVE'));
        setPendingPartners(allPartners.filter((p: any) => p.status === 'PENDING'));
      }

      // 3. Users
      const usersRes = await fetch('/api/auth/admin/analytics/users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.recent || []); // API currently returns 'recent'
      }
    } catch (e) {
      console.error("Fetch Error", e);
    } finally {
      setLoading(false);
    }
  }

  // --- ACTIONS ---
  const handlePartnerAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    // Optimistic
    setPendingPartners(prev => prev.filter(p => p.id !== id));
    if (action === 'APPROVE') {
      // Move specific partner to active list (mock object transfer for UI snapiness)
      // Ideally fetch fresh data
      fetchData();
    }

    try {
      await fetch('/api/auth/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'business', action })
      })
    } catch (e) { alert("Action failed") }
  }

  const handleBanUser = async (id: string, currentStatus: boolean) => {
    // Toggle Optimistic
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: !currentStatus } : u));
    try {
      await fetch('/api/auth/admin/users/action', { // Need to create this
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: !currentStatus ? 'BAN' : 'UNBAN' })
      });
    } catch (e) { alert("Ban failed") }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans flex text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">WIN<span className="text-red-500">.ADMIN</span></h1>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Super Admin 2.0</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarBtn label="Overview" icon="grid-2" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarBtn label="Homepage Hero" icon="pen-nib" active={activeTab === 'homepage'} onClick={() => setActiveTab('homepage')} />
          <SidebarBtn label="Partner Mgmt" icon="briefcase" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
          <SidebarBtn label="User Mgmt" icon="users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarBtn label="Deal Mgmt" icon="tags" active={activeTab === 'deals'} onClick={() => setActiveTab('deals')} />
          <SidebarBtn label="Categories" icon="layer-group" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
          <SidebarBtn label="Cities" icon="location-dot" active={activeTab === 'cities'} onClick={() => setActiveTab('cities')} />
          <SidebarBtn label="Push Notifications" icon="bell" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
        </nav>

// ... existing code ...

        {activeTab === 'homepage' && (
          <HomepageHeroEditor />
        )}



        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition">
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-10 animate-in fade-in">

        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight">
              {activeTab === 'cities' ? 'City Management' :
                activeTab === 'users' ? 'User Management' :
                  activeTab === 'partners' ? 'Partner Ecosystem' : 'Dashboard Overview'}
            </h2>
            <p className="text-slate-500 font-bold text-sm mt-1">Welcome back, Admin.</p>
          </div>

          <div className="flex gap-4">
            <button onClick={fetchData} className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:rotate-180 transition-transform">
              <i className="fa-solid fa-arrows-rotate"></i>
            </button>
            {/* Add New Button? */}
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 1. Global KPIs */}
            <OverviewStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
              {/* 2. Heatmap */}
              <div className="lg:col-span-2 h-full">
                <Heatmap />
              </div>
              {/* 3. Live Feed */}
              <div className="h-full">
                <LiveFeed feed={feed} />
              </div>
            </div>

            {/* 4. Approval Queue */}
            <PendingApprovals partners={pendingPartners} onAction={handlePartnerAction} />
          </div>
        )}

        {activeTab === 'partners' && (
          <div>
            <PendingApprovals partners={pendingPartners} onAction={handlePartnerAction} />
            <PartnerTable partners={partners} onSuspend={() => { }} onViewDetails={() => { }} />
          </div>
        )}

        {activeTab === 'users' && (
          <UserTable onBanUser={handleBanUser} />
        )}

        {activeTab === 'cities' && (
          <CityManagement />
        )}

        {activeTab === 'categories' && (
          <CategoryManagement />
        )}

        {activeTab === 'deals' && (
          <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl"><i className="fa-solid fa-tags"></i></div>
            <h3 className="font-bold text-slate-400">Deal Moderation</h3>
            <p className="text-xs text-slate-300 mt-2">Flagged and reported deals will appear here.</p>
          </div>
        )}

        {activeTab === 'homepage' && (
          <HomepageHeroEditor />
        )}

        {activeTab === 'notifications' && (
          <PushNotifications />
        )}

      </main>
    </div>
  )
}