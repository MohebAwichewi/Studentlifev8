'use client'

import React, { useState } from 'react'

/**
 * Business Dashboard Component
 * This is the primary interface for Startup Partners to manage deals.
 */
export default function BusinessDashboardPage() {
  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(false)
  const [newOffer, setNewOffer] = useState({
    title: '',
    desc: '',
    discount: '',
    date: ''
  })

  // --- HANDLER: CREATE REAL OFFER ---
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // SEND REAL DATA TO DATABASE
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newOffer.title,        // e.g. "Lunch Special"
          description: newOffer.desc,   // e.g. "Free drink with meal"
          discount: newOffer.discount,  // e.g. "15%"
          validUntil: newOffer.date     // e.g. "2025-12-31"
        })
      })

      if (res.ok) {
        alert("Offer is live on the Student App!")
        // Reset the form after success
        setNewOffer({ title: '', desc: '', discount: '', date: '' })
      } else {
        alert("Failed to publish offer.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter']">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Student<span className="text-orange-500">.LIFE</span></span>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-bold text-slate-500 uppercase tracking-tighter">Business Partner</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-500">Partner ID: #77</span>
          <button className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors">Sign Out</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Dashboard</h1>
          <p className="text-slate-500">Professional Control Center for Student.LIFE Partners.</p>
        </header>

        {/* --- KPI STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Offers</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Engagement</p>
            <h3 className="text-2xl font-bold text-slate-900">0 <span className="text-sm font-normal text-slate-400">clicks</span></h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Tier</p>
            <h3 className="text-2xl font-bold text-indigo-600">FREE PLAN</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- CREATE DEAL (ADM-01 FLOW) --- */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-tag text-orange-500"></i> New Student Offer
            </h2>
            <p className="text-slate-400 text-sm mb-6 font-medium">Deals are published instantly to the student app.</p>
            
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Offer Title</label>
                <input 
                  type="text" 
                  required
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                  placeholder="e.g. -20% on all Menu Items" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 transition-all" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discount</label>
                   <input 
                    type="text" 
                    required
                    value={newOffer.discount}
                    onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})}
                    placeholder="e.g. 20%" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 transition-all" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valid Until</label>
                   <input 
                    type="date" 
                    required
                    value={newOffer.date}
                    onChange={(e) => setNewOffer({...newOffer, date: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 transition-all" 
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea 
                  required
                  value={newOffer.desc}
                  onChange={(e) => setNewOffer({...newOffer, desc: e.target.value})}
                  placeholder="Details of the discount..." 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 h-24 transition-all" 
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>Submit Deal for Approval</>
                )}
              </button>
            </form>
          </section>

          {/* --- PUSH NOTIFICATION (ADM-03 / NOT-01 FLOW) --- */}
          <section className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-indigo-400"></i> Flash Push Notification
            </h2>
            <p className="text-slate-400 text-sm mb-6">Send a real-time alert to students within your radius.</p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Message Body</label>
                <textarea placeholder="What should the notification say?" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 h-24 transition-all text-white" />
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 italic">Requirement NOT-01: Radius Targeting</p>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Target Area:</span>
                  <span className="font-bold">5km Radius</span>
                </div>
              </div>
              <button type="button" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 active:scale-95">
                Request Push Blast
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}