'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DealForm from '@/components/business/DealForm'

export default function AdvancedDealBuilder() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- AUTH STATE ---
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessId, setBusinessId] = useState('')

  // --- 1. LOAD AUTH DATA ---
  useEffect(() => {
    const email = localStorage.getItem('businessEmail')
    const id = localStorage.getItem('businessId')

    if (!email || !id) {
      alert("Session expired. Please log in again.")
      router.push('/business/login')
    } else {
      setBusinessEmail(email)
      setBusinessId(id)
    }
  }, [router])

  // --- ACTIONS ---
  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)

    const fullDescription = formData.terms
      ? `${formData.description}\n\nTerms & Conditions:\n${formData.terms}`
      : formData.description

    try {
      const res = await fetch('/api/auth/business/create-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: businessEmail,
          businessId: businessId,
          title: formData.title,
          discount: formData.discount,
          discountType: formData.discountType,
          originalPrice: formData.originalPrice,
          category: formData.category,
          subCategory: formData.subCategory,
          expiry: formData.validUntil,
          expiryTime: formData.expiryTime,
          description: fullDescription,
          image: formData.images[0] || '', // Backward compatibility
          images: formData.images, // New Field
          isMultiUse: formData.isMultiUse,
          isFlashDeal: formData.isFlashDeal,
          // Inventory
          totalInventory: formData.totalInventory,
          maxClaimsPerUser: formData.maxClaimsPerUser,
          // Scheduling
          startDate: formData.startDate,
          startTime: formData.startTime,
          activeHoursStart: formData.activeHoursStart,
          activeHoursEnd: formData.activeHoursEnd
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
              <span className="text-xl font-black tracking-tighter text-slate-900">WIN</span>
              <span className="bg-[#FF3B30] text-white px-1.5 py-0.5 rounded text-xs font-black tracking-wide">.PARTNER</span>
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
        <div className="p-8 max-w-6xl mx-auto w-full">
          <DealForm
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </main >
    </div >
  )
}