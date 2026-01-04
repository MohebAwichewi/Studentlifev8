'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdvancedDealBuilder() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // --- FORM STATE ---
  // Removed 'location' from state
  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    category: 'Food',
    validUntil: '',
    description: '',
    terms: ''
  })

  // --- ACTIONS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1. Send Data to Real API
      const res = await fetch('/api/business/create-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        // 2. Success Feedback
        setTimeout(() => {
          setIsSubmitting(false)
          alert("Success: Deal is now LIVE.")
          router.push('/business') // Redirect back to dashboard
        }, 1000)
      } else {
        throw new Error("Failed to create deal")
      }
    } catch (error) {
      setIsSubmitting(false)
      alert("Error: Could not publish deal. Please try again.")
    }
  }

  const handleSignOut = () => {
    router.push('/business/login')
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans text-slate-900 flex">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col justify-between hidden md:flex fixed h-full z-50">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-50">
             <Link href="/" className="flex items-center gap-1 group">
               <span className="text-xl font-black tracking-tighter text-slate-900">Student</span>
               <span className="bg-[#FF3B30] text-white px-1.5 py-0.5 rounded text-xs font-black tracking-wide">.LIFE</span>
             </Link>
          </div>
          <nav className="p-4 space-y-1">
             <Link href="/business" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">
               <i className="fa-solid fa-arrow-left w-5 text-center"></i> Back to Dashboard
             </Link>
             <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase mt-4">Deal Management</div>
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-[#FF3B30]/10 text-[#FF3B30]">
               <i className="fa-solid fa-wand-magic-sparkles w-5 text-center"></i> Advanced Builder
             </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-50">
           <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition">
              <i className="fa-solid fa-right-from-bracket"></i><span>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
           <h2 className="text-xl font-black text-slate-800">Advanced Builder</h2>
           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                 <div className="text-sm font-black text-slate-900">Partner Store</div>
                 <div className="text-xs font-bold text-slate-400">Merchant Portal</div>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 border border-slate-200">PS</div>
           </div>
        </header>

        {/* Builder Form */}
        <div className="p-8 max-w-5xl mx-auto w-full">
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: Main Details */}
              <div className="lg:col-span-2 space-y-6">
                 
                 {/* Section 1: Core Info */}
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                       <i className="fa-solid fa-pen-nib text-[#FF3B30]"></i> Deal Details
                    </h3>
                    
                    <div className="space-y-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Offer Title</label>
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. 50% OFF All Mains" 
                            className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Discount Value</label>
                             <input 
                               required
                               type="text" 
                               placeholder="e.g. 20%" 
                               className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition"
                               value={formData.discount}
                               onChange={e => setFormData({...formData, discount: e.target.value})}
                             />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Category</label>
                             <select 
                               className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition appearance-none"
                               value={formData.category}
                               onChange={e => setFormData({...formData, category: e.target.value})}
                             >
                                <option>Food & Drink</option>
                                <option>Retail & Fashion</option>
                                <option>Technology</option>
                                <option>Entertainment</option>
                                <option>Services</option>
                             </select>
                          </div>
                       </div>

                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</label>
                          <textarea 
                            required
                            rows={4}
                            placeholder="Describe the offer to students..." 
                            className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition resize-none"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>

                 {/* Section 2: Fine Print */}
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                       <i className="fa-solid fa-clipboard-check text-[#FF3B30]"></i> Terms & Conditions
                    </h3>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Rules of Use</label>
                       <textarea 
                         rows={3}
                         placeholder="e.g. Valid Monday to Friday only. Cannot be used with other offers." 
                         className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition resize-none"
                         value={formData.terms}
                         onChange={e => setFormData({...formData, terms: e.target.value})}
                       />
                    </div>
                 </div>

              </div>

              {/* RIGHT COLUMN: Settings & Publish */}
              <div className="lg:col-span-1 space-y-6">
                 
                 {/* Configuration Card */}
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">Configuration</h3>
                    
                    <div className="space-y-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Expiration Date</label>
                          <input 
                            required
                            type="date" 
                            className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition"
                            value={formData.validUntil}
                            onChange={e => setFormData({...formData, validUntil: e.target.value})}
                          />
                       </div>

                       {/* Publish Button is now here */}
                       <button 
                         type="submit" 
                         disabled={isSubmitting}
                         className="w-full bg-[#FF3B30] text-white font-bold py-4 rounded-xl hover:bg-[#E6352B] transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                       >
                          {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Publish Deal Now"}
                       </button>
                    </div>
                 </div>

              </div>
           </form>
        </div>
      </main>
    </div>
  )
}