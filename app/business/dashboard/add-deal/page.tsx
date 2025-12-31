'use client'

import React, { useState } from 'react'

export default function BusinessDashboardPage() {
  // Mock data for BP-15 (Analytics)
  const stats = { views: 1240, redemptions: 85 };
  const isSubscriptionExpired = false; // Linked to BP-11 logic

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] pb-20">
      
      {/* --- NAVBAR (BP-10: Subscription Status) --- */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Student<span className="text-orange-500">.LIFE</span> <span className="text-slate-400 font-medium ml-1">Partner</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* BP-10: Subscription Status Badge */}
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
            <i className="fa-solid fa-crown mr-1"></i> PLAN: PRO TRIAL (88 days left)
          </span>
          <button className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* --- BP-11: ENFORCEMENT WARNING --- */}
        {isSubscriptionExpired && (
          <div className="bg-red-600 text-white p-4 rounded-2xl flex justify-between items-center animate-pulse shadow-lg shadow-red-200">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p className="font-bold text-sm">Subscription Expired. Access to post new deals is currently blocked.</p>
            </div>
            <button className="bg-white text-red-600 px-4 py-1.5 rounded-xl font-bold text-xs uppercase hover:bg-slate-100 transition-colors">
              Renew Now
            </button>
          </div>
        )}

        {/* --- BP-15: ANALYTICS DASHBOARD --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-hover hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reach (BP-15)</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.views.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-hover hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Redemptions</p>
            <h3 className="text-3xl font-bold text-orange-500">{stats.redemptions}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-hover hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Conv. Rate</p>
            <h3 className="text-3xl font-bold text-green-600">6.8%</h3>
          </div>
          <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white group cursor-pointer hover:bg-indigo-700 transition-all">
            <p className="text-xs font-bold opacity-80 uppercase mb-1">Billing (BP-13)</p>
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium underline decoration-indigo-300">Download Last Invoice</span>
              <i className="fa-solid fa-file-invoice text-2xl opacity-30 group-hover:opacity-100 transition-opacity"></i>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: MANAGEMENT TOOLS --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* BP-04 & BP-05: DISCOUNT CREATOR */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <div>
                  <h2 className="font-bold text-lg">New Student Offer (BP-04)</h2>
                  <p className="text-xs text-slate-400 font-medium">Create deals that automatically expire (BP-05).</p>
                </div>
              </div>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Offer Title</label>
                  <input type="text" placeholder="e.g. -20% on all Burgers" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Expiration Date (BP-05)</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Category</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                    <option>Food & Drink</option>
                    <option>Retail</option>
                    <option>Services</option>
                  </select>
                </div>
                <button className="md:col-span-2 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 hover:bg-orange-600 active:scale-95 transition-all">
                  Publish to Student App
                </button>
              </form>
            </section>

            {/* BP-03: LOCATION MANAGEMENT */}
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <i className="fa-solid fa-map-location-dot text-blue-500"></i> Physical Locations (BP-03)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-sm">Tunis Center Branch</p>
                    <p className="text-xs text-slate-500">Av. Habib Bourguiba, Tunis</p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-blue-500 transition-colors"></i>
                </div>
                <button className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs hover:border-blue-400 hover:text-blue-500 transition-all">
                  + Add New Campus Location
                </button>
              </div>
            </section>

            {/* BP-06: ACTIVE/EXPIRED LIST */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-slate-400"></i> Offer History (BP-06)
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase">Active: 1</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">Discount Title</th>
                    <th className="px-6 py-4">Valid Until</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">-20% Menu Student</td>
                    <td className="px-6 py-4 text-slate-500">Dec 31, 2025</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <span className="w-1 h-1 rounded-full bg-green-600"></span> Live
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50/30 text-slate-400">
                    <td className="px-6 py-4 font-medium italic underline">Free Coffee Monday</td>
                    <td className="px-6 py-4">Oct 12, 2025</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100">EXPIRED</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          {/* --- RIGHT COLUMN: SUPPORT & TOOLS --- */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* BP-16: SUPPORT PORTAL */}
            <section className="bg-indigo-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full opacity-10 group-hover:scale-150 transition-all"></div>
              
              <h2 className="font-bold text-xl mb-2 relative z-10">Support Portal (BP-16)</h2>
              <p className="text-indigo-200 text-xs mb-8 relative z-10 font-medium">Need help? Our startup partner team is available 24/7.</p>
              
              <form className="space-y-4 relative z-10">
                <input type="text" placeholder="Subject" className="w-full p-3.5 bg-white/10 border border-white/10 rounded-2xl text-sm placeholder:text-indigo-300 outline-none focus:border-white/40 transition-all" />
                <textarea placeholder="How can we help?" className="w-full p-3.5 bg-white/10 border border-white/10 rounded-2xl text-sm h-32 placeholder:text-indigo-300 outline-none focus:border-white/40 transition-all resize-none" />
                <button className="w-full py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all shadow-xl shadow-black/20">
                  Submit Ticket
                </button>
              </form>
            </section>

            {/* BP-13: PAYMENT HISTORY */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="font-bold text-xs mb-6 uppercase tracking-widest text-slate-400 border-b pb-4">Invoice History (BP-13)</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center group cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Inv #8821 - Sept 2025</p>
                    <p className="text-[10px] text-slate-400 font-medium">Paid via Card • 49.00 TND</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <i className="fa-solid fa-download text-xs"></i>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}