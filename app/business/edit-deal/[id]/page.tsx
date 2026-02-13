'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
<<<<<<< HEAD
import DealForm from '@/components/business/DealForm'
=======
import ImageUpload from '@/components/ui/ImageUpload'
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

export default function EditDealPage() {
    const router = useRouter()
    const params = useParams()
    const dealId = params.id

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
<<<<<<< HEAD
    const [initialData, setInitialData] = useState<any>(null)
=======
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

    // --- AUTH STATE ---
    const [businessEmail, setBusinessEmail] = useState('')
    const [businessId, setBusinessId] = useState('')

<<<<<<< HEAD
=======
    // --- CATEGORY STATE ---
    const [categories, setCategories] = useState<any[]>([])
    const [subCategories, setSubCategories] = useState<any[]>([])

    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        title: '',
        discount: '',
        category: '',
        categoryIds: [] as string[], // ✅ Added Category IDs
        subCategory: '',
        validUntil: '',
        description: '',
        terms: '', // We might need to split description if stored combined
        isMultiUse: false,
        image: ''
    })
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

    // --- 1. LOAD DATA ---
    useEffect(() => {
        // Auth Check
        const email = localStorage.getItem('businessEmail')
        const id = localStorage.getItem('businessId')

        if (!email || !id) {
            alert("Session expired. Please log in again.")
            router.push('/business/login')
            return;
        }

        setBusinessEmail(email)
        setBusinessId(id)

        const fetchData = async () => {
            try {
<<<<<<< HEAD
=======
                // Fetch Categories
                const catRes = await fetch('/api/auth/admin/categories')
                const catData = await catRes.json()
                setCategories(catData)

>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                // Fetch Deal Details
                const dealRes = await fetch(`/api/auth/deals/${dealId}`)
                if (!dealRes.ok) throw new Error("Deal not found")
                const deal = await dealRes.json()

<<<<<<< HEAD
                setInitialData(deal)
=======
                // Parse Description & Terms
                // Assumes format: "Description content\n\nTerms & Conditions:\nTerms content"
                let desc = deal.description || ""
                let terms = ""
                if (desc.includes("Terms & Conditions:")) {
                    const parts = desc.split("Terms & Conditions:")
                    desc = parts[0].trim()
                    terms = parts[1].trim()
                }

                // Populate Form
                setFormData({
                    title: deal.title,
                    discount: deal.discountValue,
                    category: deal.category,
                    categoryIds: deal.categories ? deal.categories.map((c: any) => c.id.toString()) : [], // ✅ Pre-fill Categories
                    subCategory: deal.subCategory || "", // If your schema supports subCategory
                    validUntil: deal.expiry ? new Date(deal.expiry).toISOString().split('T')[0] : "",
                    description: desc,
                    terms: terms,
                    isMultiUse: deal.isMultiUse,
                    image: deal.image || ""
                })

                // Populate Subcategories if category exists
                if (deal.category) {
                    const selectedCat = catData.find((c: any) => c.name === deal.category)
                    if (selectedCat) {
                        setSubCategories(selectedCat.children || [])
                    }
                }

>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                setIsLoading(false)

            } catch (error) {
                console.error("Failed to load data", error)
                alert("Failed to load deal details.")
                router.push('/business/dashboard')
            }
        }

        fetchData()
    }, [dealId, router])

<<<<<<< HEAD

    // --- ACTIONS ---
    const handleSubmit = async (formData: any) => {
=======
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
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
        setIsSubmitting(true)

        const fullDescription = formData.terms
            ? `${formData.description}\n\nTerms & Conditions:\n${formData.terms}`
            : formData.description

        try {
            const res = await fetch(`/api/auth/deals/${dealId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    discount: formData.discount,
<<<<<<< HEAD
                    discountType: formData.discountType, // Pass this to help backend format if needed, though backend mostly expects pre-formatted or handles it
                    category: formData.category,
                    subCategory: formData.subCategory,
                    expiry: formData.validUntil,
                    expiryTime: formData.expiryTime,
                    description: fullDescription,
                    isMultiUse: formData.isMultiUse,
                    image: formData.images[0] || '', // Back compat
                    images: formData.images,
                    isFlashDeal: formData.isFlashDeal,
                    totalInventory: formData.totalInventory,
                    maxClaimsPerUser: formData.maxClaimsPerUser,
                    startDate: formData.startDate,
                    startTime: formData.startTime,
=======
                    category: formData.category,
                    categoryIds: formData.categoryIds, // ✅ Send Updated Categories
                    // subCategory: formData.subCategory, // Add if schema supports it
                    expiry: formData.validUntil,
                    description: fullDescription,
                    isMultiUse: formData.isMultiUse,
                    image: formData.image
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setTimeout(() => {
                    setIsSubmitting(false)
                    alert("Success: Deal updated.")
                    router.push('/business/dashboard')
                }, 1000)
            } else {
                throw new Error(data.error || "Failed to update deal")
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

    if (isLoading) return <div className="flex min-h-screen items-center justify-center text-slate-500 font-bold">Loading...</div>

    return (
        <div className="min-h-screen bg-[#F4F7FE] font-sans text-slate-900 flex">
<<<<<<< HEAD
=======

>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-slate-200 flex-col justify-between hidden md:flex fixed h-full z-50">
                <div>
                    <div className="h-20 flex items-center px-6 border-b border-slate-50">
                        <Link href="/" className="flex items-center gap-1 group">
<<<<<<< HEAD
                            <span className="text-xl font-black tracking-tighter text-slate-900">WIN</span>
                            <span className="bg-[#FF3B30] text-white px-1.5 py-0.5 rounded text-xs font-black tracking-wide">.PARTNER</span>
=======
                            <span className="text-xl font-black tracking-tighter text-slate-900">Student</span>
                            <span className="bg-[#FF3B30] text-white px-1.5 py-0.5 rounded text-xs font-black tracking-wide">.LIFE</span>
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                        </Link>
                    </div>
                    <nav className="p-4 space-y-1">
                        <Link href="/business/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">
                            <i className="fa-solid fa-arrow-left w-5 text-center"></i> Back to Dashboard
                        </Link>
                        <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase mt-4">Deal Management</div>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-[#FF3B30]/10 text-[#FF3B30]">
                            <i className="fa-solid fa-pen w-5 text-center"></i> Edit Deal
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
<<<<<<< HEAD
=======

>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <h2 className="text-xl font-black text-slate-800">Edit Deal</h2>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-black text-slate-900">Partner Store</div>
                            <div className="text-xs font-bold text-slate-400">{businessEmail}</div>
                        </div>
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 border border-slate-200">PS</div>
                    </div>
                </header>

                {/* Builder Form */}
<<<<<<< HEAD
                <div className="p-8 max-w-6xl mx-auto w-full">
                    <DealForm
                        mode="edit"
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
=======
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

                                    {/* UPDATED CATEGORY SECTION */}
                                    {/* UPDATED CATEGORY SECTION (MULTI-SELECT) */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Categories (Select Multiple)</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-slate-200 rounded-xl p-2 bg-[#F8F9FC]">
                                            {categories.map((cat: any) => {
                                                const isSelected = formData.categoryIds.includes(cat.id.toString());
                                                return (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => {
                                                            const currentIds = formData.categoryIds;
                                                            const catId = cat.id.toString();
                                                            let newIds;
                                                            if (currentIds.includes(catId)) {
                                                                newIds = currentIds.filter((id: string) => id !== catId);
                                                            } else {
                                                                newIds = [...currentIds, catId];
                                                            }
                                                            // Also update the legacy single category string to the first selected one
                                                            const firstCat = categories.find((c: any) => c.id.toString() === (newIds[0] || ''));
                                                            setFormData({
                                                                ...formData,
                                                                categoryIds: newIds,
                                                                category: firstCat ? firstCat.name : ''
                                                            });
                                                        }}
                                                        className={`cursor-pointer px-3 py-2.5 rounded-xl border-2 font-bold text-xs text-center transition-all select-none flex items-center justify-center gap-2 ${isSelected
                                                                ? 'bg-[#FF3B30] border-[#FF3B30] text-white shadow-md'
                                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {cat.name}
                                                        {isSelected && <i className="fa-solid fa-check"></i>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {formData.categoryIds.length === 0 && (
                                            <p className="text-xs text-red-500 mt-2 font-bold"><i className="fa-solid fa-circle-exclamation mr-1"></i> Please select at least one category</p>
                                        )}
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
                                        {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Update Deal"}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </form>
                </div >
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af
            </main >
        </div >
    )
}
<<<<<<< HEAD
const router = useRouter()
const params = useParams()
const dealId = params.id

const [isSubmitting, setIsSubmitting] = useState(false)
const [isLoading, setIsLoading] = useState(true)

// --- AUTH STATE ---
const [businessEmail, setBusinessEmail] = useState('')
const [businessId, setBusinessId] = useState('')

// --- CATEGORY STATE ---
const [categories, setCategories] = useState<any[]>([])
const [subCategories, setSubCategories] = useState<any[]>([])

// --- FORM STATE ---
const [formData, setFormData] = useState({
    title: '',
    discount: '',
    category: '',
    subCategory: '',
    validUntil: '',
    description: '',
    terms: '', // We might need to split description if stored combined
    isMultiUse: false,
    image: ''
})

// --- 1. LOAD DATA ---
useEffect(() => {
    // Auth Check
    const email = localStorage.getItem('businessEmail')
    const id = localStorage.getItem('businessId')

    if (!email || !id) {
        alert("Session expired. Please log in again.")
        router.push('/business/login')
        return;
    }

    setBusinessEmail(email)
    setBusinessId(id)

    const fetchData = async () => {
        try {
            // Fetch Categories
            const catRes = await fetch('/api/auth/admin/categories')
            const catData = await catRes.json()
            setCategories(catData)

            // Fetch Deal Details
            const dealRes = await fetch(`/api/auth/deals/${dealId}`)
            if (!dealRes.ok) throw new Error("Deal not found")
            const deal = await dealRes.json()

            // Parse Description & Terms
            // Assumes format: "Description content\n\nTerms & Conditions:\nTerms content"
            let desc = deal.description || ""
            let terms = ""
            if (desc.includes("Terms & Conditions:")) {
                const parts = desc.split("Terms & Conditions:")
                desc = parts[0].trim()
                terms = parts[1].trim()
            }

            // Populate Form
            setFormData({
                title: deal.title,
                discount: deal.discountValue,
                category: deal.category,
                subCategory: deal.subCategory || "", // If your schema supports subCategory
                validUntil: deal.expiry ? new Date(deal.expiry).toISOString().split('T')[0] : "",
                description: desc,
                terms: terms,
                isMultiUse: deal.isMultiUse,
                image: deal.image || ""
            })

            // Populate Subcategories if category exists
            if (deal.category) {
                const selectedCat = catData.find((c: any) => c.name === deal.category)
                if (selectedCat) {
                    setSubCategories(selectedCat.children || [])
                }
            }

            setIsLoading(false)

        } catch (error) {
            console.error("Failed to load data", error)
            alert("Failed to load deal details.")
            router.push('/business/dashboard')
        }
    }

    fetchData()
}, [dealId, router])

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
        const res = await fetch(`/api/auth/deals/${dealId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: formData.title,
                discount: formData.discount,
                category: formData.category,
                // subCategory: formData.subCategory, // Add if schema supports it
                expiry: formData.validUntil,
                description: fullDescription,
                isMultiUse: formData.isMultiUse,
                image: formData.image
            })
        })

        const data = await res.json()

        if (res.ok && data.success) {
            setTimeout(() => {
                setIsSubmitting(false)
                alert("Success: Deal updated.")
                router.push('/business/dashboard')
            }, 1000)
        } else {
            throw new Error(data.error || "Failed to update deal")
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

if (isLoading) return <div className="flex min-h-screen items-center justify-center text-slate-500 font-bold">Loading...</div>

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
                        <i className="fa-solid fa-pen w-5 text-center"></i> Edit Deal
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
                <h2 className="text-xl font-black text-slate-800">Edit Deal</h2>
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

                                {/* UPDATED CATEGORY SECTION */}
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
                                        placeholder="Describe the offer to customers..."
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
                                            ? "✅ Customers can swipe this multiple times (5-minute cooldown)."
                                            : "🔒 One-time use per customer."}
                                    </p>
                                </div>

                                {/* Publish Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#FF3B30] text-white font-bold py-4 rounded-xl hover:bg-[#E6352B] transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Update Deal"}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div >
        </main >
    </div >
)
}
=======
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

