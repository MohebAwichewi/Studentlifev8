'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('overview')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Push Modal State
  const [isPushModalOpen, setIsPushModalOpen] = useState(false)
  const [pushForm, setPushForm] = useState({ title: '', body: '', universityId: '', radius: 0, verifiedOnly: false })
  const [estimatedReach, setEstimatedReach] = useState<number | null>(null)

  // ✅ NEW: PHOTO UPLOAD MODAL STATE
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [photoTarget, setPhotoTarget] = useState<{ id: string, type: 'deal' | 'business_logo' } | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // --- DATA STATE ---
  const [loading, setLoading] = useState(true)
  const [universities, setUniversities] = useState<any[]>([])

  // Overview Stats
  const [stats, setStats] = useState({
    revenue: '0 TND',
    livePartners: 0,
    pendingRequests: 0,
    activeStudents: 0
  })

  // Lists
  const [recentApplications, setRecentApplications] = useState<any[]>([]) // Pending Partners
  const [pendingDeals, setPendingDeals] = useState<any[]>([])           // Pending Deals

  // Tab Data
  const [usersList, setUsersList] = useState<any[]>([])
  const [offersList, setOffersList] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  // ✅ NEW: CATEGORY STATE
  const [categories, setCategories] = useState<any[]>([])
  const [newCatName, setNewCatName] = useState('')
  const [selectedParent, setSelectedParent] = useState<string>('')

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchOverviewData()

    // Fetch universities for dropdown
    fetch('/api/auth/admin/universities/list')
      .then(res => res.ok ? res.json() : [])
      .then(data => setUniversities(data))
      .catch(() => console.warn("Universities list API missing"))
  }, [])

  // --- DYNAMIC FETCHING ---
  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'offers') fetchOffers()
    if (activeTab === 'notifications') fetchNotifications()
    if (activeTab === 'categories') fetchCategories() // ✅ Fetch Categories when tab active
  }, [activeTab])

  // Calculate Estimate (Push)
  useEffect(() => {
    if (!isPushModalOpen) return

    const timer = setTimeout(async () => {
      try {
        setEstimatedReach(null)
        const res = await fetch('/api/auth/admin/push/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            universityId: pushForm.universityId,
            radius: Number(pushForm.radius),
            verifiedOnly: pushForm.verifiedOnly
          })
        })
        if (res.ok) {
          const data = await res.json()
          setEstimatedReach(data.count)
        }
      } catch (e) { console.error(e) }
    }, 500)

    return () => clearTimeout(timer)
  }, [pushForm.universityId, pushForm.radius, pushForm.verifiedOnly, isPushModalOpen])


  // --- 1. FETCH OVERVIEW ---
  const fetchOverviewData = async () => {
    try {
      setLoading(true)

      const resStats = await fetch('/api/auth/admin/stats', { cache: 'no-store' })
      if (resStats.ok) {
        const data = await resStats.json()
        setStats(data.stats || { revenue: '0 TND', livePartners: 0, pendingRequests: 0, activeStudents: 0 })
      }

      const resDash = await fetch('/api/auth/admin/dashboard', { cache: 'no-store' })
      if (resDash.ok) {
        const data = await resDash.json()
        if (data.success) {
          setRecentApplications(data.data.partners || [])
          setPendingDeals(data.data.deals || [])
        }
      }
    } catch (error) {
      console.error('Failed to load overview', error)
    } finally {
      setLoading(false)
    }
  }

  // --- 2. FETCH USERS ---
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/admin/analytics/users', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setUsersList(data.recent || [])
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // --- 3. FETCH OFFERS ---
  const fetchOffers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/admin/deals', { cache: 'no-store' })
      if (res.ok) setOffersList(await res.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // --- 4. FETCH NOTIFICATIONS ---
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/admin/push/list', { cache: 'no-store' })
      if (res.ok) setNotifications(await res.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // --- 5. ✅ FETCH CATEGORIES ---
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/admin/categories') // Note: Ensure you created this route in previous step
      if (res.ok) setCategories(await res.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // --- ACTIONS ---
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const handlePartnerAction = async (id: string, action: string) => {
    setRecentApplications(prev => prev.filter(app => app.id !== id))
    try {
      const res = await fetch('/api/auth/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'business', action })
      })
      if (!res.ok) throw new Error("Action failed")
      fetchOverviewData()
    } catch (error) {
      alert("Action failed")
      fetchOverviewData()
    }
  }

  const handleDealAction = async (dealId: string, action: string) => {
    setPendingDeals(prev => prev.filter(deal => deal.id !== dealId))
    setOffersList(prev => prev.map(deal =>
      deal.id === dealId ? { ...deal, status: action === 'APPROVE' ? 'ACTIVE' : 'REJECTED' } : deal
    ))

    try {
      const res = await fetch('/api/auth/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dealId, type: 'deal', action })
      })
      if (!res.ok) throw new Error("Action failed")
      if (activeTab === 'offers') fetchOffers()
    } catch (error) {
      console.error("Action failed", error)
      alert("Failed to update deal")
      fetchOverviewData()
    }
  }

  const handlePriority = async (dealId: string, newScore: string) => {
    setOffersList(prev => prev.map(deal => deal.id === dealId ? { ...deal, priorityScore: parseInt(newScore) } : deal))
    try {
      await fetch('/api/auth/admin/deals/prioritize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, priorityScore: newScore })
      })
    } catch (error) { console.error("Priority update failed") }
  }

  const handleExtendTrial = async (businessId: string) => {
    if (!confirm("Add 14 days to this partner's trial?")) return
    try {
      const res = await fetch('/api/auth/admin/extend-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      })
      if (res.ok) {
        alert("Trial Extended Successfully!")
        fetchOverviewData()
      }
    } catch (error) { alert("Failed to extend trial") }
  }

  // ✅ UPDATED: Open Modal instead of Prompt
  const handleFixImage = async (id: string, type: 'deal' | 'business_logo') => {
    setPhotoTarget({ id, type })
    setSelectedImage(null)
    setIsPhotoModalOpen(true)
  }

  // ✅ NEW: Handle File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // ✅ NEW: Handle Upload Submit
  const handleUploadSubmit = async () => {
    if (!photoTarget || !selectedImage) return
    setIsUploading(true)
    try {
      const res = await fetch('/api/auth/admin/fix-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: photoTarget.type,
          id: photoTarget.id,
          newUrl: selectedImage // Sends Base64
        })
      })
      if (res.ok) {
        alert("Image updated successfully!")
        setIsPhotoModalOpen(false)
        // Refresh logic
        fetchOverviewData()
        if (activeTab === 'offers') fetchOffers()
      } else {
        alert("Failed to update image.")
      }
    } catch (error) {
      console.error(error)
      alert("Server error uploading image.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdatePlan = async (id: string, currentPlan: string) => {
    const newPlan = prompt("Enter new Plan (e.g. PRO, BASIC, GOLD):", currentPlan || "BASIC")
    if (!newPlan || newPlan === currentPlan) return
    setRecentApplications(prev => prev.map(app => app.id === id ? { ...app, plan: newPlan } : app))
    try {
      await fetch('/api/auth/admin/partner/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, plan: newPlan })
      })
    } catch (error) { alert("Failed to update plan") }
  }

  const handlePushAction = async (id: string, action: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, status: action === 'APPROVE' ? 'SENT' : 'REJECTED' } : notif
    ))
    try {
      await fetch('/api/auth/admin/push/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      })
    } catch (error) { console.error("Push action failed") }
  }

  const handleSendManualPush = async () => {
    if (!pushForm.title || !pushForm.body) return alert("Please fill title and body")
    setIsPushModalOpen(false)
    try {
      const res = await fetch('/api/auth/admin/push/send-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pushForm.title,
          message: pushForm.body,
          filters: {
            universityId: pushForm.universityId,
            radius: pushForm.radius,
            verifiedOnly: pushForm.verifiedOnly
          },
          estimatedReach
        })
      })
      if (res.ok) {
        alert("Notification Blast Sent Successfully!")
        setPushForm({ title: '', body: '', universityId: '', radius: 0, verifiedOnly: false })
        fetchNotifications()
      } else {
        alert("Failed to send notification")
      }
    } catch (error) {
      console.error(error)
      alert("Server Error")
    }
  }

  // ✅ NEW: Handle Add Category
  const handleAddCategory = async () => {
    if (!newCatName) return
    await fetch('/api/auth/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName, parentId: selectedParent || null })
    })
    setNewCatName('')
    fetchCategories()
  }

  // ✅ NEW: Handle Delete Category
  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return
    await fetch('/api/auth/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchCategories()
  }

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (loading && activeTab === 'overview') return <div className="p-12 text-center text-slate-400 animate-pulse">Loading dashboard...</div>

    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <StatCard title="Total Revenue" value={stats.revenue} icon="wallet" color="text-emerald-500" bg="bg-emerald-50" />
              <StatCard title="Live Partners" value={stats.livePartners} icon="shop" color="text-indigo-500" bg="bg-indigo-50" />
              <StatCard title="Pending Requests" value={stats.pendingRequests} icon="clock" color="text-amber-500" bg="bg-amber-50" />
              <StatCard title="Active Students" value={stats.activeStudents} icon="user-graduate" color="text-red-500" bg="bg-red-50" />
            </div>

            <TableSection
              title="Pending Partners"
              data={recentApplications}
              type="applications"
              onAction={handlePartnerAction}
              onExtend={handleExtendTrial}
              onFixImage={handleFixImage}
              onUpdatePlan={handleUpdatePlan}
            />

            <TableSection
              title="Pending Deals"
              data={pendingDeals}
              type="offers"
              onAction={handleDealAction}
              onPrioritize={handlePriority}
              onFixImage={handleFixImage}
            />
          </>
        )
      case 'users':
        return <TableSection title="Newest Students" data={usersList} type="users" />
      case 'offers':
        return <TableSection title="All Active Deals" data={offersList} type="offers" onAction={handleDealAction} onPrioritize={handlePriority} onFixImage={handleFixImage} />
      case 'notifications':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Push Notifications</h3>
              <button onClick={() => setIsPushModalOpen(true)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition">
                <i className="fa-solid fa-paper-plane mr-2"></i> Create Push
              </button>
            </div>
            <TableSection title="History" data={notifications} type="notifications" onAction={handlePushAction} />
          </div>
        )

      // ✅ NEW: CATEGORIES TAB
      case 'categories':
        return (
          <div className="space-y-8">
            {/* ADD NEW CATEGORY CARD */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Add New Category</h3>
              <div className="flex gap-4">
                <input
                  placeholder="Category Name (e.g. Pizza)"
                  className="flex-1 p-4 bg-slate-50 rounded-xl font-bold border-2 border-transparent focus:border-slate-900 outline-none"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <select
                  className="p-4 bg-slate-50 rounded-xl font-bold border-r-8 border-transparent"
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                >
                  <option value="">Main Category (Root)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button onClick={handleAddCategory} className="bg-black text-white px-8 rounded-xl font-bold hover:bg-slate-800 transition">
                  Add
                </button>
              </div>
            </div>

            {/* LIST CATEGORIES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-black">{cat.name}</h4>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                  </div>
                  {/* Subcategories List */}
                  <div className="flex flex-wrap gap-2">
                    {cat.children && cat.children.length > 0 ? (
                      cat.children.map((sub: any) => (
                        <span key={sub.id} className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2">
                          {sub.name}
                          <button onClick={() => handleDeleteCategory(sub.id)} className="hover:text-red-500">×</button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-300 italic">No sub-categories</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-10">
        <div className="p-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student<span className="text-red-500">.LIFE</span></h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Control Center</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <SidebarBtn label="Overview" icon="grid-2" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarBtn label="Users" icon="users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarBtn label="Offers" icon="tags" active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
          {/* ✅ ADDED CATEGORIES BUTTON */}
          <SidebarBtn label="Categories" icon="list" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
          <SidebarBtn label="Notifications" icon="bell" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold"><i className="fa-solid fa-gear"></i> Settings</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold"><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">{activeTab}</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time platform management.</p>
          </div>
          <button onClick={() => fetchOverviewData()} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:rotate-180 transition-transform shadow-sm"><i className="fa-solid fa-arrows-rotate"></i></button>
        </header>

        {renderContent()}

        {/* SETTINGS MODAL */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Profile Settings</h3>
              <form className="space-y-4">
                <input placeholder="New Display Name" className="w-full p-3 bg-slate-50 rounded-xl" />
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => setIsSettingsOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Close</button>
                  <button type="button" className="flex-1 py-3 bg-black text-white rounded-xl font-bold">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE PUSH MODAL */}
        {isPushModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setIsPushModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full text-slate-500 font-bold">✕</button>

              <h3 className="text-2xl font-bold mb-1">New Notification</h3>
              <p className="text-slate-500 text-sm mb-6">Send to all students or target a specific area.</p>

              <div className="space-y-4">
                <input
                  placeholder="Notification Title"
                  className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:border-slate-900"
                  onChange={e => setPushForm({ ...pushForm, title: e.target.value })}
                />
                <textarea
                  placeholder="Notification Body"
                  className="w-full p-4 bg-slate-50 rounded-xl font-medium outline-none border-2 border-transparent focus:border-slate-900 h-24 resize-none"
                  onChange={e => setPushForm({ ...pushForm, body: e.target.value })}
                ></textarea>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Target University</label>
                    <select
                      className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                      onChange={e => setPushForm({ ...pushForm, universityId: e.target.value })}
                    >
                      <option value="">All Universities</option>
                      {universities.map((uni: any) => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Radius (km)</label>
                    <input
                      type="number"
                      placeholder="0 (Exact Only)"
                      className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                      onChange={e => setPushForm({ ...pushForm, radius: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer" onClick={() => setPushForm(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${pushForm.verifiedOnly ? 'bg-black border-black text-white' : 'border-slate-300'}`}>
                    {pushForm.verifiedOnly && <i className="fa-solid fa-check text-xs"></i>}
                  </div>
                  <span className="font-bold text-sm text-slate-600">Verified Students Only</span>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl flex items-center justify-between text-indigo-900">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-users text-indigo-500 text-xl"></i>
                    <div>
                      <p className="text-xs font-bold uppercase text-indigo-400">Estimated Reach</p>
                      <p className="text-lg font-black">{estimatedReach !== null ? `${estimatedReach} Students` : 'Calculating...'}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSendManualPush}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  Send Notification <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NEW: PHOTO UPLOAD MODAL */}
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsPhotoModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full text-slate-500 font-bold hover:bg-slate-200 transition">✕</button>

              <h3 className="text-2xl font-bold mb-1">Update Photo</h3>
              <p className="text-slate-500 text-sm mb-6">Upload a new image from your device.</p>

              <div className="space-y-6">
                {/* Styled File Input */}
                <label className="block w-full cursor-pointer group">
                  <div className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center transition-all ${selectedImage ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}>
                    {selectedImage ? (
                      <img src={selectedImage} alt="Preview" className="h-full w-full object-cover rounded-2xl p-1" />
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 group-hover:scale-110 transition-transform">
                          <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                        </div>
                        <p className="font-bold text-slate-600">Click to browse files</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, or JPEG (Max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>

                {/* Actions */}
                <button
                  onClick={handleUploadSubmit}
                  disabled={!selectedImage || isUploading}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-upload"></i>}
                  {isUploading ? "Uploading..." : "Save Image"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

// --- COMPONENTS ---
function SidebarBtn({ label, icon, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
      <i className={`fa-solid fa-${icon} w-5 text-center`}></i> {label}
    </button>
  )
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center text-xl mb-4`}><i className={`fa-solid fa-${icon}`}></i></div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
    </div>
  )
}

function TableSection({ title, data, type, onAction, onPrioritize, onExtend, onFixImage, onUpdatePlan }: any) {
  return (
    <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
      <div className="p-8 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">{title}</h3></div>

      {(!data || data.length === 0) ? (
        <div className="p-12 text-center text-slate-500 font-medium">No records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-8 py-4">Name / Title</th>
                <th className="px-8 py-4">Details</th>
                <th className="px-8 py-4">Status</th>
                {type === 'applications' && <th className="px-8 py-4">Plan</th>}
                {type === 'offers' && <th className="px-8 py-4">Priority</th>}
                {(type === 'applications' || type === 'offers' || type === 'notifications') && <th className="px-8 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item: any, i: number) => (
                <tr key={item.id || i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-900 flex items-center gap-3">
                    {item.business?.logo ? (
                      <img src={item.business.logo} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                        {item.businessName ? item.businessName.charAt(0) : "S"}
                      </div>
                    )}
                    <div>
                      <div className="text-sm">{item.businessName || item.fullName || (item.business ? item.business.businessName : "System")}</div>
                      <div className="text-xs text-slate-400 font-normal">{item.title || "Partner Application"}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">
                    {item.email || item.university || item.message || item.body || "N/A"}
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${(item.status === 'ACTIVE' || item.status === 'APPROVED' || item.status === 'SENT' || item.isVerified) ? 'bg-emerald-100 text-emerald-600' :
                        (item.status === 'REJECTED' || item.status === 'BANNED') ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-600'
                      }`}>
                      {item.status || (item.isVerified ? 'Verified' : 'Pending')}
                    </span>
                  </td>

                  {/* Plan Editor */}
                  {type === 'applications' && (
                    <td className="px-8 py-5">
                      <button onClick={() => onUpdatePlan(item.id, item.plan)} className="px-2 py-1 bg-violet-50 text-violet-600 text-xs font-bold rounded border border-violet-100 hover:bg-violet-100">
                        {item.plan || "FREE"} <i className="fa-solid fa-pen ml-1 opacity-50"></i>
                      </button>
                    </td>
                  )}

                  {/* Priority Input */}
                  {type === 'offers' && (
                    <td className="px-8 py-5">
                      <input
                        type="number"
                        defaultValue={item.priorityScore || 0}
                        onBlur={(e) => onPrioritize(item.id, e.target.value)}
                        className="w-16 p-2 bg-slate-50 border rounded-lg text-center font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </td>
                  )}

                  {/* Action Buttons */}
                  <td className="px-8 py-5 text-right flex justify-end gap-3">
                    {type === 'applications' && (
                      <>
                        <button onClick={() => onAction(item.id, 'APPROVE')} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-500">Approve</button>
                        <button onClick={() => onAction(item.id, 'REJECT')} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-500">Reject</button>
                        <button onClick={() => onExtend(item.id)} title="Extend Trial 14 Days" className="px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold rounded-lg hover:bg-indigo-100"><i className="fa-solid fa-calendar-plus"></i> +14d</button>
                        <button onClick={() => onFixImage(item.id, 'business_logo')} title="Fix Logo" className="px-3 py-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg"><i className="fa-solid fa-image"></i></button>
                      </>
                    )}

                    {type === 'offers' && (
                      <>
                        <button onClick={() => onAction(item.id, 'APPROVE')} className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 text-xs font-bold">✓</button>
                        <button onClick={() => onAction(item.id, 'REJECT')} className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold">✕</button>
                        <button onClick={() => onFixImage(item.id, 'deal')} title="Fix Image" className="px-3 py-1 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg"><i className="fa-solid fa-image"></i></button>
                      </>
                    )}

                    {type === 'notifications' && item.status === 'PENDING' && (
                      <>
                        <button onClick={() => onAction(item.id, 'APPROVE')} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-500">Send Now</button>
                        <button onClick={() => onAction(item.id, 'REJECT')} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-500">Reject</button>
                      </>
                    )}
                    {type === 'notifications' && item.status !== 'PENDING' && (
                      <span className="text-xs font-medium text-slate-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}