'use client'

import React, { useState, useEffect } from 'react'

interface Partner {
  id: string
  businessName: string
  email: string
  customPlanPrice: number | null
  isSubscribed: boolean
  plan: string
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPrice, setNewPrice] = useState('')

  // ✅ 1. FETCH REAL DATA
  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch('/api/auth/admin/partners', { cache: 'no-store' })
        const data = await res.json()
        if (data.success) {
          setPartners(data.partners)
        }
      } catch (err) {
        console.error("Failed to load partners", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPartners()
  }, [])

  // ✅ 2. SAVE REAL PRICE CHANGE
  const handleSavePrice = async (businessId: string) => {
    // Allow setting to 0 or higher
    if (newPrice === '') return

    try {
      const res = await fetch('/api/admin/set-custom-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            businessId, 
            price: parseFloat(newPrice) 
        })
      })

      if (res.ok) {
        // Update local state instantly so we see the change
        setPartners(prev => prev.map(p => 
            p.id === businessId ? { ...p, customPlanPrice: parseFloat(newPrice) } : p
        ))
        setEditingId(null)
        setNewPrice('')
        alert("Price updated successfully")
      } else {
        alert("Failed to update price in database")
      }
    } catch (err) {
      alert("Network error")
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Database...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black">Partner Management</h1>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-bold text-slate-500">
                Total Partners: {partners.length}
            </div>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Plan Price</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {partners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">{partner.businessName}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{partner.email}</td>
                        <td className="px-6 py-4">
                            {partner.isSubscribed ? (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                    Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold">
                                    Trial / Free
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                        {partner.customPlanPrice !== null ? (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                            Custom: £{partner.customPlanPrice}
                            </span>
                        ) : (
                            <span className="text-slate-400 text-xs font-bold">
                            Default (£29)
                            </span>
                        )}
                        </td>
                        <td className="px-6 py-4 text-right">
                        {editingId === partner.id ? (
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-sm font-bold text-slate-400">£</span>
                                <input 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-sm font-bold focus:border-blue-500 outline-none"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={() => handleSavePrice(partner.id)} className="bg-[#0F392B] text-white px-3 py-1 rounded-lg text-xs font-bold hover:opacity-90">Save</button>
                                <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-300">X</button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => { setEditingId(partner.id); setNewPrice(partner.customPlanPrice?.toString() || ''); }} 
                                className="text-blue-600 font-bold text-xs hover:underline decoration-2 underline-offset-4"
                            >
                                Set Price
                            </button>
                        )}
                        </td>
                    </tr>
                    ))}
                    {partners.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                No partners found in database.
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  )
}