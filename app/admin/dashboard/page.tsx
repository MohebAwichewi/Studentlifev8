'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('overview')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsForm, setSettingsForm] = useState({ email: '', oldPassword: '', newPassword: '' })

  // Push Modal State
  const [isPushModalOpen, setIsPushModalOpen] = useState(false)
  const [pushForm, setPushForm] = useState({ title: '', body: '', universityId: '', radius: 0, verifiedOnly: false })
  const [estimatedReach, setEstimatedReach] = useState<number | null>(null)

  // Photo Upload Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [photoTarget, setPhotoTarget] = useState<{ id: string, type: 'deal' | 'business_logo' } | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // ✅ NEW: EDIT BUSINESS STATE
  const [isEditBusinessModalOpen, setIsEditBusinessModalOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<any>(null)

  // ✅ NEW: EDIT DEAL STATE
  const [isEditDealModalOpen, setIsEditDealModalOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<any>(null)

  // --- DATA STATE ---
  const [loading, setLoading] = useState(true)
  const [universities, setUniversities] = useState<any[]>([])

  // Overview Stats
  const [stats, setStats] = useState({
    revenue: '£0',
    livePartners: 0,
    pendingRequests: 0,
    activeStudents: 0,
    pendingVerifications: 0,
    redemptionsToday: 0
  })

  // Lists
  const [recentApplications, setRecentApplications] = useState<any[]>([]) // Pending Partners
  const [pendingDeals, setPendingDeals] = useState<any[]>([])           // Pending Deals

  // Tab Data
  const [usersList, setUsersList] = useState<any[]>([])
  const [offersList, setOffersList] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [partnersList, setPartnersList] = useState<any[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([])

  // Category State
  const [categories, setCategories] = useState<any[]>([])
  const [newCatName, setNewCatName] = useState('')
  const [selectedParent, setSelectedParent] = useState<string>('')

  // ✅ NEW: SPIN WHEEL STATE
  const [spinPrizes, setSpinPrizes] = useState<any[]>([])
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false)
  const [editingPrize, setEditingPrize] = useState<any>(null)
  const [prizeForm, setPrizeForm] = useState({ name: '', type: 'LOSE', weight: 1, quantity: 0, dealId: '' })

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
    if (activeTab === 'categories') fetchCategories()
    if (activeTab === 'partners') fetchPartners()
    if (activeTab === 'verifications') fetchVerifications()
    if (activeTab === 'spin-wheel') fetchSpinPrizes()
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
        setStats(data.stats || { revenue: '£0', livePartners: 0, pendingRequests: 0, activeStudents: 0 })
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

  // --- 5. FETCH CATEGORIES ---
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/admin/categories')
      if (res.ok) setCategories(await res.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // --- 6. FETCH PARTNERS ---
  const fetchPartners = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/admin/partners/list')
      if (res.ok) setPartnersList(await res.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // --- 7. FETCH PENDING VERIFICATIONS ---
  const fetchVerifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/admin/students/pending-verification')
      if (res.ok) {
        const data = await res.json()
        setPendingVerifications(data.students || [])
      }
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

  const handleChangePassword = async () => {
    if (!settingsForm.email || !settingsForm.oldPassword || !settingsForm.newPassword) return alert("Please fill all fields")
    try {
      const res = await fetch('/api/auth/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      })
      const data = await res.json()
      if (res.ok) {
        alert("Password Changed Successfully. Please Login again.")
        handleLogout()
      } else {
        alert(data.error || "Failed to change password")
      }
    } catch (e) { alert("Server Error") }
  }

  const handlePartnerAction = async (id: string, action: string) => {
    // Optimistic Update
    setRecentApplications(prev => prev.filter(app => app.id !== id))
    setPartnersList(prev => prev.map(p => p.id === id ? { ...p, status: action === 'APPROVE' ? 'ACTIVE' : 'REJECTED' } : p))

    try {
      const res = await fetch('/api/auth/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'business', action })
      })
      if (!res.ok) throw new Error("Action failed")

      // Refresh Data
      fetchOverviewData()
      fetchPartners()
    } catch (error) {
      alert("Action failed")
      fetchOverviewData()
      fetchPartners()
    }
  }

  const handleDealAction = async (dealId: string, action: string) => {
    let reason = null

    // Prompt for rejection reason if rejecting
    if (action === 'REJECT') {
      reason = prompt(
        "Why are you rejecting this deal?\n\nCommon reasons:\n• Inappropriate content\n• Misleading information\n• Violates terms of service\n• Poor quality image\n• Other",
        "Please review and resubmit with correct information"
      )
      if (!reason) return // Cancel if no reason provided
    }

    setPendingDeals(prev => prev.filter(deal => deal.id !== dealId))
    setOffersList(prev => prev.map(deal =>
      deal.id === dealId ? { ...deal, status: action === 'APPROVE' ? 'ACTIVE' : 'REJECTED' } : deal
    ))

    try {
      const res = await fetch('/api/auth/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dealId, type: 'deal', action, reason })
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

  const handleFixImage = async (id: string, type: 'deal' | 'business_logo') => {
    setPhotoTarget({ id, type })
    setSelectedImage(null)
    setIsPhotoModalOpen(true)
  }

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

  // ✅ NEW: Handle Business Update
  const handleUpdateBusiness = async () => {
    if (!editingBusiness) return
    try {
      const res = await fetch('/api/auth/admin/partner/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBusiness)
      })
      if (res.ok) {
        alert("Business Profile Updated!")
        setIsEditBusinessModalOpen(false)
        fetchPartners()
      } else {
        alert("Update failed")
      }
    } catch (error) { alert("Server Error") }
  }

  const openEditBusinessModal = (business: any) => {
    setEditingBusiness(business)
    setIsEditBusinessModalOpen(true)
  }


  // ✅ NEW: Handle Deal Update
  const handleUpdateDeal = async () => {
    if (!editingDeal) return
    try {
      const res = await fetch('/api/auth/admin/deals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDeal)
      })
      if (res.ok) {
        alert("Deal Updated Successfully!")
        setIsEditDealModalOpen(false)
        if (activeTab === 'offers') fetchOffers()
      } else {
        alert("Failed to update deal")
      }
    } catch (error) {
      console.error("Update failed", error)
      alert("Server error")
    }
  }

  const openEditDealModal = (deal: any) => {
    setEditingDeal(deal)
    setIsEditDealModalOpen(true)
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

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return
    await fetch('/api/auth/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchCategories()
  }

  const handleVerificationAction = async (studentId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    // Optimistic update
    setPendingVerifications(prev => prev.filter(s => s.id !== studentId))

    try {
      const res = await fetch('/api/auth/admin/students/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action, reason })
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        fetchOverviewData() // Refresh stats
      } else {
        throw new Error('Verification failed')
      }
    } catch (error) {
      alert('Failed to process verification')
      fetchVerifications() // Reload on error
    }
  }

  // --- 8. FETCH SPIN PRIZES ---
  const fetchSpinPrizes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/admin/spin-prizes')
      if (res.ok) setSpinPrizes(await res.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleSavePrize = async () => {
    try {
      const url = editingPrize ? `/api/auth/admin/spin-prizes/${editingPrize.id}` : '/api/auth/admin/spin-prizes'
      const method = editingPrize ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prizeForm)
      })

      if (res.ok) {
        alert("Prize Saved!")
        setIsPrizeModalOpen(false)
        fetchSpinPrizes()
        setPrizeForm({ name: '', type: 'LOSE', weight: 1, quantity: 0, dealId: '' })
        setEditingPrize(null)
      } else {
        alert("Failed to save prize")
      }
    } catch (e) { alert("Server Error") }
  }

  const handleDeletePrize = async (id: string) => {
    if (!confirm("Delete this prize?")) return
    try {
      await fetch(`/api/auth/admin/spin-prizes/${id}`, { method: 'DELETE' })
      fetchSpinPrizes()
    } catch (e) { alert("Failed to delete") }
  }

  const openPrizeModal = (prize?: any) => {
    if (prize) {
      setEditingPrize(prize)
      setPrizeForm({
        name: prize.name,
        type: prize.type,
        weight: prize.weight,
        quantity: prize.quantity,
        dealId: prize.dealId || ''
      })
    } else {
      setEditingPrize(null)
      setPrizeForm({ name: '', type: 'LOSE', weight: 1, quantity: 0, dealId: '' })
    }
    setIsPrizeModalOpen(true)
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
              onEdit={openEditBusinessModal}
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
      case 'partners':
        return <TableSection title="Active Business Partners" data={partnersList} type="applications" onAction={handlePartnerAction} onExtend={handleExtendTrial} onFixImage={handleFixImage} onUpdatePlan={handleUpdatePlan} onEdit={openEditBusinessModal} />
      case 'offers':
        return <TableSection title="All Active Deals" data={offersList} type="offers" onAction={handleDealAction} onPrioritize={handlePriority} onFixImage={handleFixImage} onEdit={openEditDealModal} />
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

      case 'verifications':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold">ID Verification Queue</h3>
              <p className="text-sm text-slate-500 mt-1">
                {pendingVerifications.length} student{pendingVerifications.length !== 1 ? 's' : ''} waiting for approval
              </p>
            </div>

            {pendingVerifications.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                <i className="fa-solid fa-check-circle text-6xl text-green-500 mb-4"></i>
                <h4 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h4>
                <p className="text-slate-500">No pending ID verifications at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingVerifications.map((student: any) => (
                  <div key={student.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* ID Card Image */}
                    <div className="h-48 bg-slate-100 relative">
                      <img
                        src={student.idCardUrl || '/placeholder-id.png'}
                        alt="Student ID"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ID CARD
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={student.profilePicture || '/default-avatar.png'}
                          alt={student.name}
                          className="w-12 h-12 rounded-full border-2 border-slate-100"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{student.name}</h4>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">University</p>
                        <p className="text-sm font-bold text-slate-900">{student.university?.name || 'N/A'}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerificationAction(student.id, 'APPROVE')}
                          className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition"
                        >
                          <i className="fa-solid fa-check mr-2"></i>
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt(
                              "Rejection Reason:\n1. Blurry Image\n2. Expired ID\n3. Wrong Document\n4. Other",
                              "Blurry Image"
                            )
                            if (reason) handleVerificationAction(student.id, 'REJECT', reason)
                          }}
                          className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition"
                        >
                          <i className="fa-solid fa-times mr-2"></i>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'categories':
        return (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Add New Category</h3>
              <div className="flex gap-4">
                <input
                  placeholder="Category Name"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-black">{cat.name}</h4>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                  </div>
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

      case 'spin-wheel':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Spin & Win Manager</h3>
              <button onClick={() => openPrizeModal()} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition">
                <i className="fa-solid fa-plus mr-2"></i> Add Prize
              </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 font-black text-slate-400 text-xs uppercase tracking-wider">Name</th>
                    <th className="p-5 font-black text-slate-400 text-xs uppercase tracking-wider">Type</th>
                    <th className="p-5 font-black text-slate-400 text-xs uppercase tracking-wider">Weight</th>
                    <th className="p-5 font-black text-slate-400 text-xs uppercase tracking-wider">Qty</th>
                    <th className="p-5 font-black text-slate-400 text-xs uppercase tracking-wider">Deal Link</th>
                    <th className="p-5 font-black text-slate-400 text-xs uppercase tracking-wider">Wins</th>
                    <th className="p-5 font-black text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {spinPrizes.map((prize) => (
                    <tr key={prize.id} className="hover:bg-slate-50 transition">
                      <td className="p-5 font-bold text-slate-900">{prize.name}</td>
                      <td className="p-5">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${prize.type === 'WIN' ? 'bg-green-100 text-green-700' :
                          prize.type === 'TRY_AGAIN' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                          {prize.type}
                        </span>
                      </td>
                      <td className="p-5 font-medium text-slate-600">{prize.weight}</td>
                      <td className="p-5 font-medium text-slate-600">
                        {prize.quantity === -1 ? '∞' : prize.quantity}
                      </td>
                      <td className="p-5 text-sm text-slate-500">
                        {prize.deal ? prize.deal.title : '-'}
                      </td>
                      <td className="p-5 font-medium text-slate-600">{prize.wins}</td>
                      <td className="p-5 text-right flex justify-end gap-2">
                        <button onClick={() => openPrizeModal(prize)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition">
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onClick={() => handleDeletePrize(prize.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition">
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {spinPrizes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400">No prizes configured.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PRIZE MODAL */}
            {isPrizeModalOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
                  <button onClick={() => setIsPrizeModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full text-slate-500 font-bold">✕</button>
                  <h3 className="text-xl font-bold mb-6">{editingPrize ? 'Edit Prize' : 'New Prize'}</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Prize Name</label>
                      <input
                        className="w-full p-3 bg-slate-50 rounded-xl font-bold border-2 border-transparent focus:border-slate-900 outline-none"
                        value={prizeForm.name}
                        onChange={e => setPrizeForm({ ...prizeForm, name: e.target.value })}
                        placeholder="e.g. Free Burger"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Type</label>
                        <select
                          className="w-full p-3 bg-slate-50 rounded-xl font-bold border-r-8 border-transparent"
                          value={prizeForm.type}
                          onChange={e => setPrizeForm({ ...prizeForm, type: e.target.value })}
                        >
                          <option value="WIN">WIN</option>
                          <option value="LOSE">LOSE</option>
                          <option value="TRY_AGAIN">TRY AGAIN</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Quantity (-1 for ∞)</label>
                        <input
                          type="number"
                          className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none"
                          value={prizeForm.quantity}
                          onChange={e => setPrizeForm({ ...prizeForm, quantity: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Weight (Chance)</label>
                        <input
                          type="number"
                          className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none"
                          value={prizeForm.weight}
                          onChange={e => setPrizeForm({ ...prizeForm, weight: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Linked Deal ID</label>
                        <input
                          type="number"
                          className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none"
                          value={prizeForm.dealId}
                          onChange={e => setPrizeForm({ ...prizeForm, dealId: e.target.value })}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <button onClick={handleSavePrize} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition mt-4">
                      Save Prize
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans flex">
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-10">
        <div className="p-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student<span className="text-red-500">.LIFE</span></h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Control Center</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <SidebarBtn label="Overview" icon="grid-2" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarBtn label="Users" icon="users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarBtn label="Verifications" icon="id-card" active={activeTab === 'verifications'} onClick={() => setActiveTab('verifications')} />
          <SidebarBtn label="Partners" icon="briefcase" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
          <SidebarBtn label="Offers" icon="tags" active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
          <SidebarBtn label="Categories" icon="list" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
          <SidebarBtn label="Spin Wheel" icon="gamepad" active={activeTab === 'spin-wheel'} onClick={() => setActiveTab('spin-wheel')} />
          <SidebarBtn label="Notifications" icon="bell" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold"><i className="fa-solid fa-gear"></i> Settings</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold"><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">{activeTab}</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time platform management.</p>
          </div>
          <button onClick={() => fetchOverviewData()} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:rotate-180 transition-transform shadow-sm"><i className="fa-solid fa-arrows-rotate"></i></button>
        </header>

        {renderContent()}

        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full text-slate-500 font-bold hover:bg-slate-200">✕</button>
              <h3 className="text-xl font-bold mb-1">Security Settings</h3>
              <p className="text-slate-500 text-sm mb-6">Update your admin credentials.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Admin Email</label>
                  <input
                    placeholder="admin@example.com"
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                    value={settingsForm.email}
                    onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                    value={settingsForm.oldPassword}
                    onChange={e => setSettingsForm({ ...settingsForm, oldPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">New Password</label>
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                    value={settingsForm.newPassword}
                    onChange={e => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                  />
                </div>

                <button type="button" onClick={handleChangePassword} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg mt-2">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

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

        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsPhotoModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full text-slate-500 font-bold hover:bg-slate-200 transition">✕</button>

              <h3 className="text-2xl font-bold mb-1">Update Photo</h3>
              <p className="text-slate-500 text-sm mb-6">Upload a new image from your device.</p>

              <div className="space-y-6">
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

        {/* ✅ NEW: EDIT BUSINESS MODAL */}
        {isEditBusinessModalOpen && editingBusiness && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsEditBusinessModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full text-slate-500 font-bold hover:bg-slate-200">✕</button>

              <h3 className="text-2xl font-bold mb-6">Edit Business Profile</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Branding Section (NEW) */}
                <div className="col-span-1 md:col-span-2 space-y-4 mb-2">
                  <h4 className="font-bold text-slate-900 border-b pb-2">Branding</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Business Logo</label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="relative w-24 h-24 bg-slate-100 rounded-full overflow-hidden border border-slate-200 group shrink-0">
                          <img
                            src={editingBusiness.logo || '/placeholder-logo.png'}
                            className="w-full h-full object-cover"
                            alt="Logo"
                          />
                        </div>
                        <label className="cursor-pointer bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-100 transition border border-slate-200">
                          Change Logo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  setEditingBusiness({ ...editingBusiness, logo: reader.result as string })
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Banner Upload */}
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Banner Image (Cover)</label>
                      <div className="mt-2">
                        <div className="relative w-full h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 mb-2 group">
                          <img
                            src={editingBusiness.coverImage || '/placeholder-banner.jpg'}
                            className="w-full h-full object-cover"
                            alt="Banner"
                          />
                        </div>
                        <label className="cursor-pointer bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-100 transition border border-slate-200 inline-block">
                          Change Banner
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  setEditingBusiness({ ...editingBusiness, coverImage: reader.result as string })
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 border-b pb-2">Basic Info</h4>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Business Name</label>
                    <input className="w-full p-3 bg-slate-50 rounded-xl font-bold" value={editingBusiness.businessName || ''} onChange={e => setEditingBusiness({ ...editingBusiness, businessName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                    <input className="w-full p-3 bg-slate-50 rounded-xl font-bold" value={editingBusiness.category || ''} onChange={e => setEditingBusiness({ ...editingBusiness, category: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description (About)</label>
                    <textarea className="w-full p-3 bg-slate-50 rounded-xl font-medium h-32" value={editingBusiness.description || ''} onChange={e => setEditingBusiness({ ...editingBusiness, description: e.target.value })} />
                  </div>
                </div>

                {/* Location & Web */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 border-b pb-2">Location & Web</h4>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">City</label>
                    <input className="w-full p-3 bg-slate-50 rounded-xl font-bold" value={editingBusiness.city || ''} onChange={e => setEditingBusiness({ ...editingBusiness, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Google Maps Link</label>
                    <input className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm" placeholder="https://maps.google.com/..." value={editingBusiness.googleMapsUrl || ''} onChange={e => setEditingBusiness({ ...editingBusiness, googleMapsUrl: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Website URL</label>
                    <input className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm" placeholder="https://website.com" value={editingBusiness.website || ''} onChange={e => setEditingBusiness({ ...editingBusiness, website: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Google Maps Embed Code</label>
                    <textarea className="w-full p-3 bg-slate-50 rounded-xl font-mono text-xs h-24" placeholder="<iframe src=...>" value={editingBusiness.googleMapEmbed || ''} onChange={e => setEditingBusiness({ ...editingBusiness, googleMapEmbed: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={handleUpdateBusiness} className="flex-1 py-4 bg-black text-white rounded-xl font-bold hover:shadow-lg transition">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ UPDATED: EDIT DEAL MODAL */}
        {isEditDealModalOpen && editingDeal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsEditDealModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full text-slate-500 font-bold hover:bg-slate-200">✕</button>

              <h3 className="text-2xl font-bold mb-4">Edit Deal</h3>

              <div className="space-y-4">
                {/* Image URL */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Deal Image URL</label>
                  <div className="flex gap-2">
                    <input className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm" value={editingDeal.image || ''} onChange={e => setEditingDeal({ ...editingDeal, image: e.target.value })} />
                    {editingDeal.image && <img src={editingDeal.image} className="w-10 h-10 rounded-lg object-cover" />}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Title</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                    value={editingDeal.title}
                    onChange={e => setEditingDeal({ ...editingDeal, title: e.target.value })}
                  />
                </div>

                {/* Redemption Method */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Redemption Method</label>
                  <select
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                    value={editingDeal.redemptionType || 'SWIPE'}
                    onChange={e => setEditingDeal({ ...editingDeal, redemptionType: e.target.value })}
                  >
                    <option value="SWIPE">Swipe to Redeem (In-Store)</option>
                    <option value="CODE">Unique Code</option>
                    <option value="LINK">Online Link (Website)</option>
                  </select>

                  {/* Conditional Link Input */}
                  {editingDeal.redemptionType === 'LINK' && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Online Link URL</label>
                      <input
                        className="w-full p-3 bg-indigo-50 border-2 border-indigo-100 rounded-xl font-bold text-indigo-700 placeholder-indigo-300"
                        placeholder="https://example.com/order"
                        value={editingDeal.redemptionLink || ''}
                        onChange={e => setEditingDeal({ ...editingDeal, redemptionLink: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Usage Limits */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={editingDeal.isMultiUse || false}
                    onChange={e => setEditingDeal({ ...editingDeal, isMultiUse: e.target.checked })}
                    className="w-5 h-5 accent-black"
                  />
                  <span className="font-bold text-sm text-slate-700">Unlimited / Multi-Use?</span>
                </div>

                {/* Urgent */}
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={editingDeal.isUrgent || false}
                    onChange={e => setEditingDeal({ ...editingDeal, isUrgent: e.target.checked })}
                    className="w-5 h-5 accent-amber-500"
                  />
                  <span className="font-bold text-sm text-amber-900">Mark as Urgent? <i className="fa-solid fa-fire text-amber-500"></i></span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Discount</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                    value={editingDeal.discountValue}
                    onChange={e => setEditingDeal({ ...editingDeal, discountValue: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description</label>
                  <textarea
                    className="w-full p-3 bg-slate-50 rounded-xl font-medium h-24"
                    value={editingDeal.description}
                    onChange={e => setEditingDeal({ ...editingDeal, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Expiry</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                      value={editingDeal.expiry ? editingDeal.expiry.split('T')[0] : ''}
                      onChange={e => setEditingDeal({ ...editingDeal, expiry: e.target.value })}
                    />
                    <button
                      onClick={() => setEditingDeal({ ...editingDeal, expiry: 'limitless' })}
                      className="whitespace-nowrap px-3 bg-slate-100 text-xs font-bold rounded-xl text-slate-500"
                    >No Expiry</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Priority</label>
                    <input
                      type="number"
                      className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                      value={editingDeal.priorityScore}
                      onChange={e => setEditingDeal({ ...editingDeal, priorityScore: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                    <input
                      className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                      value={editingDeal.category}
                      onChange={e => setEditingDeal({ ...editingDeal, category: e.target.value })}
                    />
                  </div>
                </div>

                <button onClick={handleUpdateDeal} className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-emerald-600 transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

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

function TableSection({ title, data, type, onAction, onPrioritize, onExtend, onFixImage, onUpdatePlan, onEdit }: any) {
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
                        <button onClick={() => onEdit(item)} title="Edit Profile" className="px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold rounded-lg hover:bg-indigo-100"><i className="fa-solid fa-pen"></i></button>

                        {item.status !== 'ACTIVE' && (
                          <button onClick={() => onAction(item.id, 'APPROVE')} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-500">
                            {item.status === 'REJECTED' ? 'Restore' : 'Approve'}
                          </button>
                        )}
                        {item.status !== 'REJECTED' && (
                          <button onClick={() => onAction(item.id, 'REJECT')} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-500">
                            {item.status === 'ACTIVE' ? 'Ban' : 'Reject'}
                          </button>
                        )}
                        <button onClick={() => onExtend(item.id)} title="Extend Trial 14 Days" className="px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold rounded-lg hover:bg-indigo-100"><i className="fa-solid fa-calendar-plus"></i> +14d</button>
                        <button onClick={() => onFixImage(item.id, 'business_logo')} title="Fix Logo" className="px-3 py-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg"><i className="fa-solid fa-image"></i></button>
                      </>
                    )}

                    {type === 'offers' && (
                      <>
                        <button onClick={() => onAction(item.id, 'APPROVE')} className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 text-xs font-bold">✓</button>
                        <button onClick={() => onAction(item.id, 'REJECT')} className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold">✕</button>
                        <button onClick={() => onFixImage(item.id, 'deal')} title="Fix Image" className="px-3 py-1 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg"><i className="fa-solid fa-image"></i></button>
                        <button onClick={() => onEdit(item)} title="Edit Deal" className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg"><i className="fa-solid fa-pen"></i></button>
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