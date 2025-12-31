'use client'

import Map from '@/components/ui/Map' 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// --- TYPES ---
interface Deal {
  id: number;
  brand: string;      // Mapped from business.name
  discount: string;   // Mapped from deal.title
  category: string;
  desc: string;
  terms: string;      // Placeholder for now
  expiry: string;
  img: string;        // Mapped from deal.image
}

export default function StudentDashboard() {
  const router = useRouter()
  
  // State for Data
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  // State for UI
  const [activeTab, setActiveTab] = useState('deals') 
  const [filter, setFilter] = useState('All')
  const [savedDeals, setSavedDeals] = useState<number[]>([])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [scrolled, setScrolled] = useState(false)

  // Notification State
  const [preferences, setPreferences] = useState({
    push: true,
    email: false,
    location: true
  })

  // 👇 FETCH REAL DEALS FROM API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch('/api/deals/list')
        const data = await res.json()
        
        if (data.success) {
          // Transform API data to match the UI structure
          const formattedDeals = data.deals.map((d: any) => ({
            id: d.id,
            brand: d.business.name,
            discount: d.title, // We use the Title (e.g. "50% Off") as the discount text
            category: d.category,
            desc: d.description,
            terms: 'Valid until expiry date. Show ID to redeem.',
            expiry: new Date(d.expiry).toLocaleDateString(),
            img: d.image
          }))
          setDeals(formattedDeals)
        }
      } catch (error) {
        console.error('Failed to load deals', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleSave = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setSavedDeals(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  // --- LOGOUT FUNCTIONALITY ---
  const handleLogout = async () => {
    try {
      router.push('/') 
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  // Filter Logic
  const filteredDeals = deals.filter(d => 
    (filter === 'All' || d.category === filter) && 
    (activeTab !== 'saved' || savedDeals.includes(d.id))
  )

  return (
    <div style={{ paddingBottom: '120px', fontFamily: '"Inter", sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* --- 1. HERO HEADER --- */}
      <div style={{ 
        background: 'white', 
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
        boxShadow: scrolled ? '0 4px 20px -10px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 30px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Dec 29, 2025</div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, letterSpacing: '-1px', background: 'linear-gradient(90deg, #1e293b, #64748b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Hello, Moheb 👋
              </h1>
            </div>
            
            <div 
              onClick={() => setActiveTab('profile')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                padding: '8px 12px', borderRadius: '50px', transition: 'background 0.2s',
                background: activeTab === 'profile' ? '#f1f5f9' : 'transparent'
              }}
            >
              <div className="hidden min-[600px]:block" style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Moheb S7</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>University of Tunis</div>
              </div>
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
            </div>
          </div>

          {/* Filters (Scrollable Row - Only Show on Home Tab) */}
          {activeTab === 'deals' && (
            <div style={{ marginTop: '25px', display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '5px' }}>
              {['All', 'Food', 'Tech', 'Fashion', 'Entertainment'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    padding: '10px 24px', borderRadius: '30px', border: '1px solid',
                    borderColor: filter === cat ? '#1e293b' : '#e2e8f0',
                    fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
                    background: filter === cat ? '#1e293b' : 'white',
                    color: filter === cat ? 'white' : '#64748b',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- 2. MAIN CONTENT GRID --- */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px', minHeight: '60vh' }}>
        
        {/* VIEW: DEALS GRID */}
        {(activeTab === 'deals' || activeTab === 'saved') && (
          <>
            {loading ? (
               <div className="text-center py-20 text-gray-500">Loading offers...</div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '30px' 
              }}>
                {filteredDeals.length > 0 ? filteredDeals.map((deal, i) => (
                  <div 
                    key={deal.id} 
                    className="deal-card"
                    onClick={() => setSelectedDeal(deal)}
                    style={{ 
                      background: 'white', borderRadius: '24px', overflow: 'hidden', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
                      cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease',
                      animation: `fadeIn 0.5s ease-out ${i * 0.1}s backwards`
                    }}
                  >
                    <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                      <img src={deal.img} alt={deal.brand} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }}></div>
                      
                      <span style={{ 
                        position: 'absolute', top: '15px', left: '15px', 
                        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                        padding: '6px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.85rem',
                        color: '#1e293b', maxWidth: '80%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {deal.discount}
                      </span>

                      <button 
                        onClick={(e) => toggleSave(e, deal.id)}
                        style={{ 
                          position: 'absolute', top: '15px', right: '15px', 
                          width: '38px', height: '38px', borderRadius: '50%', border: 'none', 
                          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.1rem', transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <i className={`fa-${savedDeals.includes(deal.id) ? 'solid' : 'regular'} fa-heart`} style={{ color: savedDeals.includes(deal.id) ? '#ef4444' : '#1e293b' }}></i>
                      </button>

                      <div style={{ position: 'absolute', bottom: '15px', left: '20px', color: 'white' }}>
                          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{deal.brand}</h3>
                      </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{deal.category}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Exp: {deal.expiry}</span>
                      </div>
                      <p style={{ margin: 0, color: '#475569', fontSize: '1rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{deal.desc}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                    <i className="fa-solid fa-ghost" style={{ fontSize: '2rem', marginBottom: '15px' }}></i>
                    <p>No deals found in this category.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ✅ VIEW: MAP (Added Here) */}
        {activeTab === 'map' && (
          <div style={{ height: '70vh', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
            <Map deals={deals} />
          </div>
        )}

        {/* VIEW: DIGITAL ID */}
        {activeTab === 'id' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', animation: 'fadeIn 0.4s' }}>
            <div style={{ 
              width: '100%', maxWidth: '400px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
              borderRadius: '30px', padding: '40px 30px', color: 'white', 
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
              position: 'relative', overflow: 'hidden', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%)', animation: 'shimmer 4s infinite linear' }}></div>
              
              <div style={{ marginBottom: '30px', position: 'relative', zIndex: 10 }}>
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Student" style={{ width: '110px', height: '110px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)' }} />
                <div style={{ position: 'absolute', bottom: '0', right: 'calc(50% - 55px)', width: '30px', height: '30px', background: '#22c55e', borderRadius: '50%', border: '4px solid #1e293b' }}></div>
              </div>
              
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '5px' }}>Moheb S7</h2>
              <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '40px' }}>University of Tunis</p>
              
              <div style={{ background: 'white', padding: '15px', borderRadius: '20px', width: '160px', height: '160px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=STU-12345" alt="QR" style={{ width: '100%' }} />
              </div>

              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <span>ID: #882910</span>
                <span>•</span>
                <span>Valid: 2026</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.3s' }}>
              
              {/* Profile Header */}
              <div style={{ background: 'white', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '15px', border: '4px solid #f1f5f9' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 5px 0' }}>Moheb S7</h2>
                <p style={{ color: '#64748b', margin: 0 }}>University of Tunis • CS Student</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                    <span style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Member since 2025</span>
                    <span style={{ background: '#dcfce7', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#166534' }}>Verified ✅</span>
                </div>
              </div>

              {/* Settings Group */}
              <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', fontWeight: '700', color: '#1e293b' }}>Preferences</div>
                
                {/* Push Notifications Toggle */}
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                        <div style={{ fontWeight: '600' }}>Push Notifications</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Get alerts for deals near you</div>
                    </div>
                    <div 
                      onClick={() => setPreferences({ ...preferences, push: !preferences.push })}
                      style={{ width: '44px', height: '24px', background: preferences.push ? '#6246ea' : '#e2e8f0', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                        <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: preferences.push ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                    </div>
                </div>

                {/* Email Toggle */}
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: '600' }}>Email Updates</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Weekly digest of best offers</div>
                    </div>
                    <div 
                      onClick={() => setPreferences({ ...preferences, email: !preferences.email })}
                      style={{ width: '44px', height: '24px', background: preferences.email ? '#6246ea' : '#e2e8f0', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                        <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: preferences.email ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                    </div>
                </div>
              </div>

              {/* LOGOUT BUTTON */}
              <button 
                onClick={handleLogout}
                style={{ 
                    width: '100%', padding: '18px', background: '#fef2f2', color: '#dc2626', 
                    border: '1px solid #fecaca', borderRadius: '20px', fontWeight: '700', fontSize: '1rem',
                    cursor: 'pointer', transition: 'all 0.2s' 
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
              >
                Log Out
              </button>
              
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '20px' }}>Version 1.0.2 • Student.LIFE Inc</p>
          </div>
        )}

      </div>

      {/* --- 3. FLOATING DOCK (Navigation) --- */}
      <div style={{ 
        position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', 
        zIndex: 100 
      }}>
        <nav style={{ 
          background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)',
          borderRadius: '24px', padding: '10px 20px', 
          display: 'flex', gap: '20px', alignItems: 'center',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.5)'
        }}>
          <NavIcon icon="house" label="Home" active={activeTab === 'deals'} onClick={() => setActiveTab('deals')} />
          <NavIcon icon="map" label="Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
          
          <div 
            onClick={() => setActiveTab('id')}
            style={{ 
              width: '60px', height: '60px', background: '#1e293b', 
              borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.5rem', cursor: 'pointer',
              boxShadow: '0 10px 20px -5px rgba(30, 41, 59, 0.4)', margin: '0 10px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
          >
            <i className="fa-solid fa-id-card"></i>
          </div>

          <NavIcon icon="heart" label="Saved" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />
          <NavIcon icon="user" label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </div>

      {/* --- 4. DETAILS MODAL --- */}
      {selectedDeal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', animation: 'fadeIn 0.2s' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedDeal(null)}></div>
          
          <div style={{ 
            width: '100%', background: 'white', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', 
            padding: '30px', position: 'relative', zIndex: 201, animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            maxHeight: '85vh', overflowY: 'auto'
          }}>
            <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '2px', margin: '0 auto 25px' }}></div>
            
            <img src={selectedDeal.img} alt="" style={{ width: '100%', height: '220px', borderRadius: '20px', objectFit: 'cover', marginBottom: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
            
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '5px', letterSpacing: '-0.5px' }}>{selectedDeal.brand}</h2>
            <p style={{ fontSize: '1.2rem', color: '#6246ea', fontWeight: '700', marginBottom: '20px' }}>{selectedDeal.discount}</p>
            
            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#475569', marginBottom: '30px' }}>
              {selectedDeal.desc}. Simply show your Student.LIFE digital ID at checkout to redeem this offer.
            </p>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '30px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>Terms & Conditions</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{selectedDeal.terms}</p>
            </div>

            <button style={{ width: '100%', padding: '18px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer' }}>
              Redeem in Store
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL ANIMATIONS */}
      <style jsx global>{`
        .deal-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -5px rgba(0,0,0,0.1) !important; }
        .deal-card img:hover { transform: scale(1.05); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
      `}</style>
    </div>
  )
}

function NavIcon({ icon, label, active, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      style={{ 
        cursor: 'pointer', color: active ? '#1e293b' : '#94a3b8', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        width: '50px', transition: 'all 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.color = '#6246ea'}
      onMouseOut={(e) => !active && (e.currentTarget.style.color = '#94a3b8')}
    >
      <i className={`fa-solid fa-${icon}`} style={{ fontSize: '1.3rem' }}></i>
      <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>{label}</span>
    </div>
  )
}