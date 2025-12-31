'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // 👈 Import Link

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '"Inter", sans-serif',
      background: 'white',
      overflowX: 'hidden',
      position: 'relative' // 👈 Added this so the absolute button works
    }}>
      
      {/* ❌ CLOSE BUTTON (Top Right) */}
      <Link 
        href="/" 
        className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-md border border-gray-200"
      >
        <i className="fa-solid fa-xmark text-lg"></i>
      </Link>

      {/* --- LEFT SIDE: FORM SECTION --- */}
      <div style={{
        flex: '1 1 500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 8%',
        position: 'relative'
      }}>
        {/* Decorative corner shape */}
        <div style={{
           position: 'absolute', top: -100, left: -100, width: 300, height: 300,
           background: 'rgba(98, 70, 234, 0.05)', borderRadius: '50%', zIndex: 0
        }}></div>
        
        <div style={{position: 'relative', zIndex: 10, maxWidth: '450px', margin: '0 auto', width: '100%'}}>
          {/* Logo */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '2rem', fontWeight: '800', color: '#1a1a1a' }}>
              Student<span style={{ color: '#ff4747' }}>.LIFE</span>
            </h1>
            <h2 style={{ marginTop: '10px', fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              Welcome back, CEO.
            </h2>
            <p style={{ color: '#64748b', marginTop: '5px' }}>Please enter your details to access the admin portal.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>Username</label>
              <input 
                type="text"
                required
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px',
                  border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.2s', background: '#f8fafc'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6246ea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>Password</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px',
                  border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.2s', background: '#f8fafc'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6246ea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: '25px', padding: '12px', borderRadius: '10px',
                background: '#fef2f2', color: '#dc2626', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500'
              }}>
                <i className="fa-solid fa-triangle-exclamation"></i> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
                background: 'linear-gradient(135deg, #6246ea 0%, #ff4747 100%)',
                color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 30px -10px rgba(98, 70, 234, 0.5)',
                opacity: loading ? 0.7 : 1, transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
          
          <p style={{marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8'}}>
            Authorized personnel only.
          </p>
        </div>
         {/* Decorative corner shape bottom right */}
         <div style={{
           position: 'absolute', bottom: -80, right: -80, width: 250, height: 250,
           background: 'rgba(255, 71, 71, 0.08)', borderRadius: '50%', zIndex: 0
        }}></div>
      </div>

      {/* --- RIGHT SIDE: VISUAL BRANDING SECTION --- */}
      <div 
        className="hidden min-[900px]:flex"
        style={{
        flex: '1.5 1 0',
        background: 'linear-gradient(135deg, #6246ea 0%, #4b32c3 60%, #2c1a8d 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Abstract Overlay Pattern */}
        <div style={{
            position: 'absolute', inset: 0, opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 20% 30%, white 2px, transparent 2px), radial-gradient(circle at 80% 70%, white 2px, transparent 2px)',
            backgroundSize: '60px 60px'
        }}></div>

        {/* Central Visual Content */}
        <div style={{ textAlign: 'center', color: 'white', zIndex: 10, padding: '40px' }}>
          <div style={{
            fontSize: '5rem', marginBottom: '20px',
            background: 'rgba(255,255,255,0.1)', width: '120px', height: '120px',
            borderRadius: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            🔥
          </div>
          <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>
            Powering Student Life.
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
            Manage partnerships, approve deals, and connect with campuses across the nation from one central hub.
          </p>
        </div>
      </div>
    </div>
  )
}