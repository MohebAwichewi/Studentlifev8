'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function AdminDashboard() {
  const router = useRouter()
  
  // --- STATE ---
  const [stats, setStats] = useState({
    revenue: '0 TND',
    livePartners: 0,
    pendingRequests: 0,
    activeStudents: 0
  })
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [profileData, setProfileData] = useState({ name: '', newPassword: '' })

  // --- 1. FETCH REAL DATA ON LOAD ---
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      if (data.stats) {
        setStats(data.stats)
        setApplications(data.recentApplications)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // --- 2. HANDLE APPROVAL ACTION ---
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    // Optimistic Update (Update UI immediately)
    setApplications(prev => prev.filter(app => app.id !== id))
    
    // Send to DB
    await fetch('/api/admin/partner/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    })
    
    // Refresh stats to show new revenue/partner count
    fetchDashboardData()
  }

  // --- 3. HANDLE PROFILE UPDATE ---
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    // Call your profile API here (code provided in previous step)
    await fetch('/api/admin/profile', {
        method: 'PUT', 
        body: JSON.stringify(profileData) 
    })
    setIsSettingsOpen(false)
    alert("Profile Updated")
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans flex">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full z-10">
        <div className="p-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Student<span className="text-red-500">.LIFE</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Control Center</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 text-sm font-bold">
            <i className="fa-solid fa-grid-2 w-5 text-center"></i> Overview
          </button>
          <button onClick={() => router.push('/admin/universities')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-sm font-bold">
            <i className="fa-solid fa-school w-5 text-center"></i> Universities
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold">
            <i className="fa-solid fa-gear"></i> Settings
          </button>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold">
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time overview of your platform.</p>
          </div>
          <button onClick={fetchDashboardData} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:rotate-180 transition-transform duration-500">
             <i className="fa-solid fa-arrows-rotate"></i>
          </button>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Revenue" value={stats.revenue} icon="wallet" color="text-emerald-500" bg="bg-emerald-50" loading={loading} />
          <StatCard title="Live Partners" value={stats.livePartners} icon="shop" color="text-indigo-500" bg="bg-indigo-50" loading={loading} />
          <StatCard title="Pending Requests" value={stats.pendingRequests} icon="clock" color="text-amber-500" bg="bg-amber-50" loading={loading} />
          <StatCard title="Active Students" value={stats.activeStudents} icon="user-graduate" color="text-red-500" bg="bg-red-50" loading={loading} />
        </div>

        {/* REAL APPLICATIONS TABLE */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">New Partner Applications</h3>
          </div>
          
          {loading ? (
             <div className="p-8 text-center text-slate-400">Loading applications...</div>
          ) : applications.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-4">✨</div>
                <p className="text-slate-500 font-medium">No pending applications right now.</p>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-4">Business</th>
                  <th className="px-8 py-4">Applied Date</th>
                  <th className="px-8 py-4">Email Contact</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.map((app) => (
                  <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900">{app.businessName}</div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {app.email}
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-3">
                       <button 
                         onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                         className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors shadow-lg hover:shadow-emerald-500/30"
                       >
                         Approve
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                         className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                       >
                         Decline
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Update Profile</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                 <input 
                   placeholder="New Display Name" 
                   className="w-full p-3 bg-slate-50 rounded-xl"
                   onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                 />
                 <input 
                   type="password" 
                   placeholder="New Password" 
                   className="w-full p-3 bg-slate-50 rounded-xl"
                   onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                 />
                 <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setIsSettingsOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-bold">Save</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}

// Simple Stat Component
function StatCard({ title, value, icon, color, bg, loading }: any) {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center text-xl mb-4`}>
        <i className={`fa-solid fa-${icon}`}></i>
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-slate-100 rounded animate-pulse mt-1"></div>
      ) : (
        <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
      )}
    </div>
  )
}