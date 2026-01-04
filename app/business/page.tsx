'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BusinessDashboard() {
  const router = useRouter()
  
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  // --- DASHBOARD STATE ---
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ reach: 0, redemptions: 0, convRate: '0%', daysLeft: 0, rating: 0, views: 0, clicks: 0 })
  const [myDeals, setMyDeals] = useState<any[]>([]) 
  const [profile, setProfile] = useState<any>({})
  const [audience, setAudience] = useState<any>({ totalNearby: 0, universities: [] })
  
  // --- FORM STATE ---
  const [offerData, setOfferData] = useState({ title: '', discount: '', description: '', expiry: '', category: 'Food & Drink' })
  const [pushMessage, setPushMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- 1. AUTH GUARD ---
  useEffect(() => {
    const email = localStorage.getItem('businessEmail')
    if (!email) {
      router.push('/business/login')
    } else {
      setIsAuthenticated(true)
      setIsAuthChecking(false)
    }
  }, [router])

  // --- 2. FETCH REAL DATA ---
  useEffect(() => {
    if (!isAuthenticated) return

    async function loadAllData() {
      try {
        setLoading(true)
        const email = localStorage.getItem('businessEmail')

        if (!email) return

        // 1. Fetch Stats
        const statsRes = await fetch('/api/business/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        // 2. Fetch Deals
        const dealsRes = await fetch('/api/deals/my-deals', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email })
        })

        // 3. Fetch Profile
        const profileRes = await fetch('/api/business/profile', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email })
        })

        // 4. Fetch Audience
        const audRes = await fetch('/api/business/audience')

        if (statsRes.ok) {
           const data = await statsRes.json()
           setStats(data.stats)
           if (data.activeDeals) setMyDeals(data.activeDeals)
        }
        if (dealsRes.ok) {
            const data = await dealsRes.json()
            if (data.deals) setMyDeals(data.deals)
        }
        if (profileRes.ok) setProfile(await profileRes.json())
        if (audRes.ok) setAudience(await audRes.json())

      } catch (e) {
        console.error("Error loading dashboard data:", e)
      } finally {
        setLoading(false)
      }
    }
    loadAllData()
  }, [isAuthenticated])

  // --- 3. ACTIONS ---

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if(!offerData.title || !offerData.expiry) {
        alert("Please fill in Title and Expiration Date")
        return
    }

    setIsSubmitting(true)
    const email = localStorage.getItem('businessEmail')
    
    try {
      const res = await fetch('/api/deals/create', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...offerData, email }) 
      })
      
      const data = await res.json() 

      if (res.ok) {
        alert("Deal Live!")
        setOfferData({ title: '', discount: '', description: '', expiry: '', category: 'Food & Drink' })
        
        const dealsRes = await fetch('/api/deals/my-deals', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email })
        })
        const dealsData = await dealsRes.json()
        if (dealsData.deals) setMyDeals(dealsData.deals)
        
        setActiveTab('offers')
      } else {
        alert(data.error || "Error publishing deal")
        if (res.status === 403) {
            setActiveTab('billing')
        }
      }
    } catch (e) {
      alert("Failed to connect to server")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const email = localStorage.getItem('businessEmail')
    
    const res = await fetch('/api/business/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, email }) 
    })
    setIsSubmitting(false)
    if (res.ok) alert("Profile Updated Successfully")
  }

  const handleUpgradePlan = async () => {
    if(!confirm("Are you sure you want to upgrade to Yearly? You will be charged immediately.")) return

    setIsSubmitting(true)
    const email = localStorage.getItem('businessEmail')

    try {
      const res = await fetch('/api/business/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      if (res.ok) {
        alert("Success! You are now on the Yearly Plan.")
        setProfile({ ...profile, plan: 'YEARLY' })
      } else {
        alert("Upgrade failed: " + data.error)
      }
    } catch (e) {
      alert("Network Error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ REAL: Delete Account Logic
  const handleDeleteAccount = async () => {
    const confirmText = prompt("Type 'DELETE' to confirm closing your store permanently. This will cancel your subscription and remove your data.")
    
    if (confirmText !== 'DELETE') return

    setIsSubmitting(true)
    const email = localStorage.getItem('businessEmail')

    try {
      const res = await fetch('/api/business/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        alert("Your store has been closed and subscription cancelled.")
        localStorage.clear()
        router.push('/')
      } else {
        alert("Failed to close account. Please contact support.")
      }
    } catch (e) {
      alert("Network Error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePushBlast = () => {
    if(!pushMessage) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Flash Blast Sent to " + (audience.totalNearby || 0) + " students!")
      setPushMessage('')
    }, 1500)
  }

  const handleSignOut = () => {
    localStorage.removeItem('businessEmail')
    localStorage.removeItem('businessToken')
    router.push('/business/login')
  }

  // --- 4. RENDERERS ---

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
      <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#FF3B30]"></i>
    </div>
  }

  if (!isAuthenticated) return null

  const renderContent = () => {
    if (loading) return <div className="p-20 text-center"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-[#FF3B30]"></i></div>

    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <StatCard icon="fa-eye" color="blue" label="Total Reach" value={stats.reach?.toLocaleString() || 0} />
               <StatCard icon="fa-mouse-pointer" color="purple" label="Redemptions" value={stats.redemptions || 0} />
               <StatCard icon="fa-qrcode" color="orange" label="Conv. Rate" value={stats.convRate || "0%"} />
               <StatCard icon="fa-clock" color="red" label="Trial Days Left" value={stats.daysLeft || 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-900">Create New Offer</h3>
                    <Link href="/business/add-deal" className="text-sm font-bold text-[#FF3B30] hover:underline">Advanced Builder &rarr;</Link>
                  </div>
                  <form onSubmit={handleCreateOffer} className="space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Offer Title" placeholder="e.g. Free Coffee" value={offerData.title} onChange={v => setOfferData({...offerData, title: v})} />
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Expiration Date</label>
                            <input type="date" className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-[#FF3B30] transition" value={offerData.expiry} onChange={e => setOfferData({...offerData, expiry: e.target.value})} />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Discount %" placeholder="e.g. 100% OFF" value={offerData.discount} onChange={v => setOfferData({...offerData, discount: v})} />
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Category</label>
                            <select className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-[#FF3B30] transition" value={offerData.category} onChange={e => setOfferData({...offerData, category: e.target.value})}>
                                <option>Food & Drink</option>
                                <option>Retail</option>
                                <option>Services</option>
                            </select>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Description</label>
                        <textarea required rows={3} className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-[#FF3B30] transition resize-none" value={offerData.description} onChange={e => setOfferData({...offerData, description: e.target.value})} />
                     </div>
                     <div className="pt-2 flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="bg-[#FF3B30] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#E6352B] transition shadow-lg shadow-red-100 flex items-center gap-2">
                           {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Publish Live"} <i className="fa-solid fa-arrow-right"></i>
                        </button>
                     </div>
                  </form>
               </div>

               <div className="bg-[#1B1B29] rounded-3xl shadow-xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B30] blur-[80px] opacity-20 pointer-events-none"></div>
                  <div>
                     <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#FF3B30]"><i className="fa-solid fa-bullhorn"></i></div>
                        <div><h3 className="text-lg font-black">Flash Blast</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">5km Radius</p></div>
                     </div>
                     <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#FF3B30] focus:outline-none resize-none h-32" placeholder="Message nearby students..." value={pushMessage} onChange={e => setPushMessage(e.target.value)}></textarea>
                  </div>
                  <button onClick={handlePushBlast} disabled={isSubmitting} className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-slate-200 transition mt-6">Send Blast</button>
               </div>
            </div>
          </>
        )

      case 'offers':
        return (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Active Deals ({myDeals.length})</h3>
                <button onClick={() => setActiveTab('overview')} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition">+ New Deal</button>
             </div>
             {myDeals.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No active deals found. Create one!</div>
             ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                     <thead className="bg-slate-50 text-slate-400 uppercase text-xs font-bold">
                        <tr>
                           <th className="px-8 py-4">Title</th>
                           <th className="px-8 py-4">Category</th>
                           <th className="px-8 py-4">Status</th>
                           <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {myDeals.map((deal: any) => (
                           <tr key={deal.id} className="hover:bg-slate-50 transition">
                              <td className="px-8 py-4 font-bold text-slate-900">{deal.title}</td>
                              <td className="px-8 py-4">{deal.category}</td>
                              <td className="px-8 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Live</span></td>
                              <td className="px-8 py-4 text-right"><button className="text-red-400 hover:text-red-600 font-bold text-xs">Delete</button></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
             )}
          </div>
        )

      case 'audience':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6">Student Demographics</h3>
                {audience.universities?.map((uni: any, index: number) => (
                  <div key={index} className="mb-4">
                     <div className="flex justify-between items-center mb-1"><span className="font-bold text-slate-500 text-sm">{uni.name}</span><span className="font-black text-sm">{uni.percent}%</span></div>
                     <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-[#FF3B30] h-2 rounded-full" style={{ width: `${uni.percent}%` }}></div></div>
                  </div>
                ))}
             </div>
             <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center text-center">
                <div>
                   <div className="text-6xl font-black text-slate-900 mb-2">{audience.totalNearby || 0}</div>
                   <p className="text-slate-500 font-bold">Students Registered & Verified</p>
                </div>
             </div>
          </div>
        )

      case 'billing':
        return (
          <div className="max-w-4xl">
             <h2 className="text-2xl font-black text-slate-900 mb-6">Subscription & Billing</h2>
             <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Plan</div>
                   <div className="text-3xl font-black text-slate-900">
                      {profile.plan === 'YEARLY' ? 'Yearly Pro' : 'Monthly Trial'}
                   </div>
                   <div className="text-sm text-slate-500 mt-2">
                      {profile.plan === 'YEARLY' 
                        ? 'Next billing date: Jan 2027' 
                        : `Trial ends in ${stats.daysLeft} days. Then £29/mo.`}
                   </div>
                </div>
                {profile.plan !== 'YEARLY' && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-4">
                     <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><i className="fa-solid fa-gift"></i></div>
                     <div>
                        <div className="font-bold text-orange-800">Save 20% on Yearly</div>
                        <div className="text-xs text-orange-600">Pay £290/yr instead of £348</div>
                     </div>
                  </div>
                )}
             </div>
             {profile.plan !== 'YEARLY' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl border-2 border-slate-200 opacity-50 grayscale">
                     <div className="font-bold text-lg mb-2">Monthly</div>
                     <div className="text-2xl font-black">£29<span className="text-sm font-medium text-slate-400">/mo</span></div>
                     <div className="mt-4 inline-block bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold">Current Plan</div>
                  </div>
                  <div className="p-6 rounded-3xl border-2 border-[#5856D6] bg-[#F4F7FE] relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-[#FF3B30] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">BEST VALUE</div>
                     <div className="font-bold text-lg mb-2 text-[#5856D6]">Yearly Pro</div>
                     <div className="text-2xl font-black">£290<span className="text-sm font-medium text-slate-400">/yr</span></div>
                     <ul className="mt-4 space-y-2 text-sm text-slate-600 mb-6">
                        <li><i className="fa-solid fa-check text-green-500 mr-2"></i> 2 Months Free</li>
                        <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Priority Support</li>
                     </ul>
                     <button onClick={handleUpgradePlan} disabled={isSubmitting} className="w-full bg-[#5856D6] text-white font-bold py-3 rounded-xl hover:bg-[#4845B8] transition shadow-lg shadow-indigo-200">
                        {isSubmitting ? 'Processing...' : 'Upgrade Now'}
                     </button>
                  </div>
               </div>
             )}
          </div>
        )

      case 'settings':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-12">
             
             {/* LEFT: EDIT FORM */}
             <div className="space-y-10">
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6">Edit Public Profile</h3>
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                       <InputGroup label="Business Name" value={profile.businessName || ''} onChange={v => setProfile({...profile, businessName: v})} />
                       <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">About the Business</label>
                          <textarea 
                            rows={4} 
                            className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-[#FF3B30] transition resize-none"
                            placeholder="Tell students what makes your place special..."
                            value={profile.description || ''}
                            onChange={e => setProfile({...profile, description: e.target.value})}
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-5">
                          <InputGroup label="Phone" value={profile.phone || ''} onChange={v => setProfile({...profile, phone: v})} />
                          <InputGroup label="Website" value={profile.website || ''} onChange={v => setProfile({...profile, website: v})} />
                       </div>
                       <InputGroup label="Logo URL" placeholder="https://..." value={profile.logo || ''} onChange={v => setProfile({...profile, logo: v})} />
                       <InputGroup label="Cover Image URL" placeholder="https://..." value={profile.coverImage || ''} onChange={v => setProfile({...profile, coverImage: v})} />
                       <div className="pt-4 flex gap-4">
                          <button disabled={isSubmitting} className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-black transition">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                          </button>
                          <Link href={`/business/${profile.id}`} target="_blank" className="px-6 py-4 border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">
                            View Live Page <i className="fa-solid fa-external-link-alt ml-2"></i>
                          </Link>
                       </div>
                    </form>
                 </div>

                 {/* ✅ NEW: DANGER ZONE (Delete Account) */}
                 <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
                    <h3 className="text-xl font-black text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700/70 mb-6">Closing your store will immediately cancel your subscription and delete all your data. This action cannot be undone.</p>
                    <button 
                      onClick={handleDeleteAccount} 
                      disabled={isSubmitting}
                      className="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-700 transition"
                    >
                        {isSubmitting ? 'Closing Store...' : 'Close Store & Delete Account'}
                    </button>
                 </div>
             </div>

             {/* RIGHT: REAL-TIME PREVIEW */}
             <div className="sticky top-28 h-fit">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Live Student Preview</h3>
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
                   <div className="h-40 bg-slate-200 relative">
                      {profile.coverImage ? (
                        <img src={profile.coverImage} className="w-full h-full object-cover" alt="Cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">No Cover Image</div>
                      )}
                   </div>
                   <div className="p-6 relative">
                      <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-md absolute -top-10 left-6">
                         {profile.logo ? (
                           <img src={profile.logo} className="w-full h-full object-cover rounded-xl" alt="Logo" />
                         ) : (
                           <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-2xl">🏪</div>
                         )}
                      </div>
                      <div className="mt-10">
                         <h2 className="text-2xl font-black text-slate-900">{profile.businessName || "Your Business Name"}</h2>
                         <div className="flex items-center gap-2 text-sm text-slate-500 font-bold mt-1">
                            <span>{profile.category || "Category"}</span>
                            <span>•</span>
                            <span>{profile.address || "Location"}</span>
                         </div>
                         <p className="mt-4 text-slate-600 leading-relaxed text-sm">
                            {profile.description || "Your description will appear here. Add a bio to tell students about your story!"}
                         </p>
                         <div className="mt-6 pt-6 border-t border-slate-50 flex gap-3">
                            <button className="flex-1 bg-[#FF3B30] text-white py-2 rounded-lg font-bold text-sm">View Deals</button>
                            <button className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm">Directions</button>
                         </div>
                      </div>
                   </div>
                </div>
                <p className="text-center text-xs text-slate-400 font-bold mt-6">
                   <i className="fa-solid fa-info-circle mr-1"></i> This is exactly how students see your store.
                </p>
             </div>
          </div>
        )

      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans text-slate-900 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col justify-between hidden md:flex fixed h-full z-50">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-50">
             <Link href="/" className="flex items-center gap-1 group">
               <span className="text-xl font-black tracking-tighter text-slate-900">Student</span>
               <span className="bg-[#FF3B30] text-white px-1.5 py-0.5 rounded text-xs font-black tracking-wide group-hover:opacity-90 transition">.LIFE</span>
             </Link>
          </div>
          <nav className="p-4 space-y-1">
             <NavButton id="overview" label="Overview" icon="fa-chart-pie" active={activeTab} set={setActiveTab} />
             <NavButton id="offers" label="Offers & Deals" icon="fa-ticket" active={activeTab} set={setActiveTab} />
             <NavButton id="audience" label="Audience" icon="fa-users" active={activeTab} set={setActiveTab} />
             <NavButton id="billing" label="Billing" icon="fa-credit-card" active={activeTab} set={setActiveTab} />
             <NavButton id="settings" label="Settings" icon="fa-gear" active={activeTab} set={setActiveTab} />
          </nav>
        </div>
        <div className="p-4 border-t border-slate-50">
           <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition"><i className="fa-solid fa-right-from-bracket"></i><span>Sign Out</span></button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
           <h2 className="text-xl font-black text-slate-800 capitalize">{activeTab}</h2>
           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block"><div className="text-sm font-black text-slate-900">{profile.businessName || 'My Store'}</div><div className="text-xs font-bold text-slate-400">Partner</div></div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500">PS</div>
           </div>
        </header>
        <div className="p-8">
           {renderContent()}
        </div>
      </main>
    </div>
  )
}

// --- SUB COMPONENTS ---
const StatCard = ({ icon, color, label, value, change }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
     <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center text-${color}-600`}><i className={`fa-solid ${icon}`}></i></div>
        {change && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{change}</span>}
     </div>
     <div className="text-3xl font-black text-slate-900">{value}</div>
     <div className="text-xs font-bold text-slate-400 mt-1">{label}</div>
  </div>
)

const InputGroup = ({ label, placeholder, value, onChange }: any) => (
  <div>
     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
     <input type="text" placeholder={placeholder} className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-[#FF3B30] transition" value={value} onChange={e => onChange && onChange(e.target.value)} />
  </div>
)

const NavButton = ({ id, label, icon, active, set }: any) => (
  <button onClick={() => set(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active === id ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
     <i className={`fa-solid ${icon} w-5 text-center`}></i> {label}
  </button>
)