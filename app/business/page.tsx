'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// --- TYPES ---
interface Offer { id: number; title: string; discount: string; status: 'ACTIVE' | 'INACTIVE'; ends: string; }
interface Location { id: number; address: string; city: string; }

export default function BusinessDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  
  // --- MOCK DATA ---
  const [profile, setProfile] = useState({
    name: "Burger King Campus",
    category: "Food & Drinks",
    description: "Home of the Whopper.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/85/Burger_King_logo_%281999%29.svg"
  })

  // BP-10: Subscription Status
  const [subscription, setSubscription] = useState({
    status: "TRIAL", 
    plan: "Free Trial (3 Months)",
    expiry: "2025-10-15",
    isExpired: false // BP-11: Logic flag
  })

  const [offers, setOffers] = useState<Offer[]>([
    { id: 1, title: "Student Whopper Meal", discount: "-40%", status: 'ACTIVE', ends: '2025-12-31' },
    { id: 2, title: "Free Coffee", discount: "100%", status: 'INACTIVE', ends: '2025-06-01' }
  ])

  // --- ACTIONS ---

  // BP-18: Secure Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/business/logout', { method: 'POST' })
      router.push('/business/login')
      router.refresh()
    } catch (error) { console.error(error) }
  }

  // BP-04 & BP-11: Create Offer with Enforcement
  const handleCreateOffer = () => {
    if (subscription.isExpired) {
      alert("⚠️ Subscription Expired: You must upgrade to PRO to publish new offers.") 
      setActiveTab('billing') // Redirect to billing
      return
    }
    const newOffer: Offer = { id: Date.now(), title: "New Deal", discount: "-10%", status: 'INACTIVE', ends: '2025-12-31' }
    setOffers([...offers, newOffer])
  }

  // NOT-01: Send Push Notification Logic
  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault()
    if (subscription.isExpired) return alert("Upgrade to send Push Notifications.")
    
    // Simulate Backend Call
    alert("🚀 Push Notification Sent!\nTarget: Students within 5km radius.")
  }

  // SEC-03: Data Deletion Request
  const handleDeleteAccount = () => {
    if(confirm("DANGER: This will permanently delete all your data, offers, and history in compliance with GDPR. Are you sure?")) {
        alert("Request ID #9921 Submitted. Your data will be wiped within 30 days.")
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '280px', background: 'white', padding: '30px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={profile.logo} alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'contain', background: '#f8fafc', padding: '5px' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', lineHeight: '1.2' }}>{profile.name}</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>Business Portal</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavButton icon="chart-pie" label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavButton icon="tags" label="Offers & Deals" active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
          {/* NEW: Push Campaign Tab */}
          <NavButton icon="paper-plane" label="Push Campaigns" active={activeTab === 'push'} onClick={() => setActiveTab('push')} />
          <NavButton icon="credit-card" label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
          <NavButton icon="shield-halved" label="Privacy & Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div style={{ marginTop: 'auto' }}>
            <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#ef4444', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <i className="fa-solid fa-right-from-bracket"></i> Logout
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* 1. OVERVIEW (BP-15) */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px', color: '#0f172a' }}>Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
                <StatCard icon="eye" label="Total Views" value="1,250" color="#3b82f6" />
                <StatCard icon="computer-mouse" label="Clicks" value="450" color="#8b5cf6" />
                <StatCard icon="ticket" label="Redemptions" value="85" color="#10b981" />
            </div>
          </div>
        )}

        {/* 2. OFFERS (BP-04, BP-05) */}
        {activeTab === 'offers' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>My Offers</h1>
                <button onClick={handleCreateOffer} disabled={subscription.isExpired} style={{ ...btnPrimary, width: 'auto', opacity: subscription.isExpired ? 0.5 : 1 }}>
                    + Create Offer
                </button>
            </div>
            {/* List would go here (simplified for brevity) */}
            <p>Managing {offers.length} active offers.</p>
          </div>
        )}

        {/* 3. NEW: PUSH CAMPAIGNS (NOT-01, NOT-02) */}
        {activeTab === 'push' && (
          <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', color: '#0f172a' }}>Push Campaigns</h1>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Send instant alerts to students near your store.</p>
            
            <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <form onSubmit={handleSendPush}>
                  <div style={{ marginBottom: '20px' }}>
                     <label style={labelStyle}>Campaign Title</label>
                     <input type="text" placeholder="e.g. Flash Sale: 50% Off for 1 Hour!" style={inputStyle} required />
                  </div>
                  
                  {/* NOT-01: Radius Targeting */}
                  <div style={{ marginBottom: '20px' }}>
                     <label style={labelStyle}>Target Radius (Km)</label>
                     <input type="range" min="1" max="10" defaultValue="3" style={{ width: '100%', accentColor: '#6246ea' }} />
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>1km (Walking)</span>
                        <span>5km (Campus)</span>
                        <span>10km (City)</span>
                     </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', color: '#64748b' }}>
                     <i className="fa-solid fa-circle-info" style={{ marginRight: '8px' }}></i>
                     <strong>Rate Limit (NOT-02):</strong> You can send 1 push per week on your current plan.
                  </div>

                  <button type="submit" style={btnPrimary}>
                     <i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }}></i> Send Blast
                  </button>
               </form>
            </div>
          </div>
        )}

        {/* 4. BILLING (BP-09, BP-10) */}
        {activeTab === 'billing' && (
          <div className="animate-fade-in">
             <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px', color: '#0f172a' }}>Billing</h1>
             <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h3>Current Plan: {subscription.plan}</h3>
                <p>Status: <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{subscription.status}</span></p>
                <button style={{ ...btnPrimary, marginTop: '20px' }}>Upgrade to Annual Pro</button>
             </div>
          </div>
        )}

        {/* 5. PRIVACY & SETTINGS (SEC-01, SEC-03, BP-02) */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
             <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px', color: '#0f172a' }}>Settings</h1>
             
             {/* Edit Profile */}
             <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Business Profile</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div>
                      <label style={labelStyle}>Business Name</label>
                      <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} style={inputStyle} />
                   </div>
                   <div>
                      <label style={labelStyle}>Category</label>
                      <select style={inputStyle}><option>Food</option><option>Tech</option></select>
                   </div>
                </div>
                <button style={{ ...btnPrimary, marginTop: '20px', width: 'auto' }}>Save Changes</button>
             </div>

             {/* SEC-03: Compliance Zone */}
             <div style={{ background: '#fff1f2', padding: '30px', borderRadius: '24px', border: '1px solid #fee2e2' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#be123c', marginBottom: '10px' }}>Danger Zone</h3>
                <p style={{ fontSize: '0.9rem', color: '#881337', marginBottom: '20px' }}>
                   GDPR Compliance: You can export all your data or permanently delete your account here.
                </p>
                <div style={{ display: 'flex', gap: '15px' }}>
                   <button style={{ background: 'white', border: '1px solid #fecdd3', color: '#be123c', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                      Export Data (JSON)
                   </button>
                   <button onClick={handleDeleteAccount} style={{ background: '#be123c', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                      Delete Account
                   </button>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  )
}

// --- STYLES & HELPERS ---
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }
const btnPrimary = { width: '100%', padding: '14px', background: '#0f172a', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }

function NavButton({ icon, label, active, onClick }: any) {
    return (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', border: 'none', background: active ? '#f1f5f9' : 'transparent', color: active ? '#0f172a' : '#64748b', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem' }}>
            <i className={`fa-solid fa-${icon}`} style={{ width: '20px', textAlign: 'center' }}></i> {label}
        </button>
    )
}

function StatCard({ icon, label, value, color }: any) {
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ width: '45px', height: '45px', background: `${color}15`, color: color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><i className={`fa-solid fa-${icon}`}></i></div>
                <span style={{ color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>{label}</span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a' }}>{value}</div>
        </div>
    )
}