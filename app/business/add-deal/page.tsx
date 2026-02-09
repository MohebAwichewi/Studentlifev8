'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ui/ImageUpload'

export default function AdvancedDealBuilder() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- AUTH STATE ---
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessId, setBusinessId] = useState('')

  // --- CATEGORY STATE (✅ NEW) ---
  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    category: '', // Changed default to empty string to force selection
    subCategory: '', // ✅ Added subCategory
    validUntil: '',
    description: '',
    terms: '',
    image: '',
    isMultiUse: false,
    redemptionType: 'SWIPE', // Default
    redemptionLink: ''
  })

  // --- 1. LOAD AUTH DATA & CATEGORIES ---
  useEffect(() => {
    // Auth Check
    const email = localStorage.getItem('businessEmail')
    const id = localStorage.getItem('businessId')

    if (!email || !id) {
      alert("Session expired. Please log in again.")
      router.push('/business/login')
    } else {
      setBusinessEmail(email)
      setBusinessId(id)
    }

    // ✅ Fetch Categories
    fetch('/api/auth/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Failed to load categories", err))
  }, [router])

  // --- 2. HANDLE CATEGORY CHANGE ---
  const handleCategoryChange = (e: any) => {
    const selectedCatName = e.target.value

    // Find the selected category object to get its children
    const selectedCat = categories.find(c => c.name === selectedCatName)

    setFormData({
      ...formData,
      category: selectedCatName,
      subCategory: '' // Reset sub when main changes
    })

    setSubCategories(selectedCat?.children || [])
  }

  // --- ACTIONS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const fullDescription = formData.terms
      ? `${formData.description}\n\nTerms & Conditions:\n${formData.terms}`
      : formData.description

    try {
      const res = await fetch('/api/auth/deals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: businessEmail,
          businessId: businessId,
          title: formData.title,
          discount: formData.discount,
          category: formData.category,
          subCategory: formData.subCategory, // ✅ Send SubCategory
          expiry: formData.validUntil,
          description: fullDescription,
          image: formData.image,
          isMultiUse: formData.isMultiUse,
          redemptionType: formData.redemptionType,
          redemptionLink: formData.redemptionLink
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setTimeout(() => {
          setIsSubmitting(false)
          alert("Success: Deal is now LIVE.")
          router.push('/business/dashboard')
        }, 1000)
      } else {
        throw new Error(data.error || "Failed to create deal")
      }
    } catch (error: any) {
      setIsSubmitting(false)
      alert(`Error: ${error.message}`)
    }
  }

  const handleSignOut = () => {
    localStorage.clear()
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
            <Link href="/business/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">
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
              <div className="text-xs font-bold text-slate-400">{businessEmail}</div>
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
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Discount Value</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 20%"
                      className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition"
                      value={formData.discount}
                      onChange={e => setFormData({ ...formData, discount: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Category</label>
                      <select
                        required
                        className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] appearance-none"
                        value={formData.category}
                        onChange={handleCategoryChange}
                      >
                        <option value="">Select...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Sub Category</label>
                      <select
                        className={`w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] appearance-none ${subCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={formData.subCategory || ''}
                        onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                        disabled={subCategories.length === 0}
                      >
                        <option value="">Select...</option>
                        {subCategories.map(sub => (
                          <option key={sub.id} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Deal Image</label>
                    <ImageUpload
                      value={formData.image}
                      onUpload={(url) => setFormData({ ...formData, image: url })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe the offer to students..."
                      className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition resize-none"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, terms: e.target.value })}
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
                      onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>

                  {/* Redemption Type Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Redemption Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {['SWIPE', 'LINK', 'BOTH'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, redemptionType: type })}
                          className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${formData.redemptionType === type
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          {type === 'SWIPE' ? 'In-Store Only' : type === 'LINK' ? 'Online Only' : 'Both'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conditional Link Input */}
                  {(formData.redemptionType === 'LINK' || formData.redemptionType === 'BOTH') && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Online Link</label>
                      <input
                        type="url"
                        placeholder="https://yourwebsite.com/offer"
                        className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 font-bold text-indigo-900 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        value={formData.redemptionLink || ''}
                        onChange={e => setFormData({ ...formData, redemptionLink: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Multi-Use Toggle */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-slate-900">Reusable Offer?</label>
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-[#FF3B30]"
                        checked={formData.isMultiUse}
                        onChange={e => setFormData({ ...formData, isMultiUse: e.target.checked })}
                      />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {formData.isMultiUse
                        ? "✅ Students can swipe this multiple times (5-minute cooldown)."
                        : "🔒 One-time use per student."}
                    </p>
                  </div>

                  {/* Publish Button */}
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
      </main >
    </div >
  )
}