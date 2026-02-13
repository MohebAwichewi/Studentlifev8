'use client'

import React, { useState, useEffect } from 'react'
import ImageUpload from '@/components/ui/ImageUpload'
import { useRouter } from 'next/navigation'

interface DealFormProps {
    initialData?: any
    onSubmit: (data: any) => Promise<void>
    isSubmitting: boolean
    mode: 'create' | 'edit'
}

export default function DealForm({ initialData, onSubmit, isSubmitting, mode }: DealFormProps) {
    const router = useRouter()

    // --- CATEGORY STATE ---
    const [categories, setCategories] = useState<any[]>([])
    const [subCategories, setSubCategories] = useState<any[]>([])

    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        // Basic Info
        title: '',
        discount: '',
        category: '',
        subCategory: '',
        validUntil: '',
        description: '',
        terms: '',
        images: [] as string[],

        // Pricing
        discountType: 'PERCENTAGE', // 'PERCENTAGE' or 'FIXED'
        originalPrice: '',

        // Inventory Control
        totalInventory: '',
        maxClaimsPerUser: '1',

        // Scheduling
        startDate: '',
        startTime: '',
        expiryTime: '',
        hasActiveHours: false,
        activeHoursStart: '',
        activeHoursEnd: '',

        // Usage & Features
        isMultiUse: false,
        isFlashDeal: false
    })

    // --- INITIALIZATION ---
    useEffect(() => {
        // Fetch Categories
        fetch('/api/auth/admin/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Failed to load categories", err))

        // Populate Form if Edit Mode
        if (initialData) {
            // Logic to parse initialData into formData
            // This mirrors the logic in the old edit page but tailored to the new form structure
            let desc = initialData.description || ""
            let terms = ""
            if (desc.includes("Terms & Conditions:")) {
                const parts = desc.split("Terms & Conditions:")
                desc = parts[0].trim()
                terms = parts[1].trim()
            }

            // Derive Discount Type
            let discountType = 'PERCENTAGE';
            let discount = initialData.discount || '';
            if (discount.includes('TND')) {
                discountType = 'FIXED';
                discount = discount.replace(' TND', '').trim();
            } else {
                discount = discount.replace('%', '').trim();
            }

            setFormData({
                title: initialData.title || '',
                discount: discount,
                category: initialData.category || '',
                subCategory: initialData.subCategory || '',
                validUntil: initialData.expiry ? new Date(initialData.expiry).toISOString().split('T')[0] : '',
                description: desc,
                terms: terms,
                images: initialData.images && initialData.images.length > 0 ? initialData.images : (initialData.image ? [initialData.image] : []),

                discountType,
                originalPrice: initialData.originalPrice || '', // Might not be in DB yet if not saved previously

                totalInventory: initialData.totalInventory || '',
                maxClaimsPerUser: initialData.maxClaimsPerUser || '1',

                startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                startTime: initialData.startDate ? new Date(initialData.startDate).toTimeString().slice(0, 5) : '',
                // Expiry Time needs to be extracted from expiry if it exists, or handled separately. 
                // For now, simple ISO split for date.
                expiryTime: initialData.expiry ? new Date(initialData.expiry).toTimeString().slice(0, 5) : '',

                hasActiveHours: false, // Not persisted yet
                activeHoursStart: '',
                activeHoursEnd: '',

                isMultiUse: initialData.isMultiUse || false,
                isFlashDeal: initialData.isFlashDeal || false
            })

            // Set subcategories if category is present
            if (initialData.category) {
                // We need to wait for categories to load or do this in the category fetch then block
                // For simplicity, we might depend on categories state update or just let user re-select if it fails to autopopulate immediately without complex effect chaining.
                // Actually, let's try to set it if categories are loaded.
            }
        }
    }, [initialData])

    // Update subcategories when categories load or data changes
    useEffect(() => {
        if (categories.length > 0 && formData.category) {
            const selectedCat = categories.find(c => c.name === formData.category)
            setSubCategories(selectedCat?.children || [])
        }
    }, [categories, formData.category])


    // --- HANDLERS ---
    const handleCategoryChange = (e: any) => {
        const selectedCatName = e.target.value
        const selectedCat = categories.find(c => c.name === selectedCatName)

        setFormData({
            ...formData,
            category: selectedCatName,
            subCategory: ''
        })
        setSubCategories(selectedCat?.children || [])
    }

    const calculateDiscountPercentage = () => {
        if (formData.discountType === 'PERCENTAGE' && formData.discount) return `${formData.discount}%`
        if (formData.discountType === 'FIXED' && formData.discount && formData.originalPrice) {
            const original = parseFloat(formData.originalPrice)
            const fixed = parseFloat(formData.discount)
            if (original > 0) {
                const percent = Math.round(((original - fixed) / original) * 100)
                return `${percent}%`
            }
        }
        return null
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Main Details */}
            <div className="lg:col-span-2 space-y-6">
                {/* Section 1: Core Info */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <i className={`fa-solid ${mode === 'edit' ? 'fa-pen-to-square' : 'fa-pen-nib'} text-[#FF3B30]`}></i>
                        {mode === 'edit' ? 'Edit Deal Details' : 'Deal Details'}
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

                        {/* Pricing Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Discount Type Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Discount Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, discountType: 'PERCENTAGE' })}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${formData.discountType === 'PERCENTAGE' ? 'bg-[#FF3B30] text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        <i className="fa-solid fa-percent"></i> Percentage
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, discountType: 'FIXED' })}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${formData.discountType === 'FIXED' ? 'bg-[#FF3B30] text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        <i className="fa-solid fa-coins"></i> Fixed Amount
                                    </button>
                                </div>
                            </div>

                            {/* Discount Value */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    {formData.discountType === 'PERCENTAGE' ? 'Percentage OFF' : 'New Price (TND)'}
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type="number"
                                        step={formData.discountType === 'FIXED' ? '0.01' : '1'}
                                        placeholder={formData.discountType === 'PERCENTAGE' ? '50' : '10.00'}
                                        className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 pr-16 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition"
                                        value={formData.discount}
                                        onChange={e => setFormData({ ...formData, discount: e.target.value })}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                        {formData.discountType === 'PERCENTAGE' ? '%' : 'TND'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Original Price */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Original Price (Optional)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="20.00"
                                    className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-5 py-4 pr-16 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition"
                                    value={formData.originalPrice}
                                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">TND</span>
                            </div>
                            {/* Auto-calc display */}
                            {formData.originalPrice && formData.discount && (
                                <p className="text-sm font-bold text-green-600 mt-2 flex items-center gap-2 animate-in fade-in">
                                    <i className="fa-solid fa-arrow-trend-down"></i>
                                    Calculated Deal: <span className="line-through text-slate-400">{formData.originalPrice} TND</span>
                                    {' '}→{' '}
                                    <span className="text-[#FF3B30]">
                                        {formData.discountType === 'FIXED' ? formData.discount : (parseFloat(formData.originalPrice) * (1 - parseFloat(formData.discount) / 100)).toFixed(2)} TND
                                    </span>
                                    {calculateDiscountPercentage() && <span className="bg-red-100 text-[#FF3B30] px-2 py-0.5 rounded text-xs ml-2">{calculateDiscountPercentage()} OFF</span>}
                                </p>
                            )}
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

                        {/* Image Upload (Multi) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Deal Images (Max 3)</label>
                            <ImageUpload
                                value={formData.images}
                                onUpload={(val) => setFormData({ ...formData, images: Array.isArray(val) ? val : [val] })}
                                maxFiles={3}
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

                {/* Section 2: Special Toggles */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-bolt text-yellow-500"></i> Boost Visibility
                    </h3>

                    {/* Flash Deal Toggle */}
                    <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer mb-4 ${formData.isFlashDeal ? 'border-[#FF3B30] bg-red-50' : 'border-slate-100 hover:border-slate-300'}`} onClick={() => setFormData({ ...formData, isFlashDeal: !formData.isFlashDeal })}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${formData.isFlashDeal ? 'bg-[#FF3B30] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <i className="fa-solid fa-bolt"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Flash Deal</h4>
                                    <p className="text-xs text-slate-500">Highlights deal in Red & pushes to top of feed.</p>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition ${formData.isFlashDeal ? 'bg-[#FF3B30] border-[#FF3B30] text-white' : 'border-slate-300'}`}>
                                {formData.isFlashDeal && <i className="fa-solid fa-check text-xs"></i>}
                            </div>
                        </div>
                    </div>

                    {/* Happy Hour Toggle */}
                    <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.hasActiveHours ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-slate-300'}`} onClick={() => setFormData({ ...formData, hasActiveHours: !formData.hasActiveHours })}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${formData.hasActiveHours ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <i className="fa-solid fa-clock"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Happy Hour</h4>
                                    <p className="text-xs text-slate-500">Limit redemption to specific hours.</p>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition ${formData.hasActiveHours ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-300'}`}>
                                {formData.hasActiveHours && <i className="fa-solid fa-check text-xs"></i>}
                            </div>
                        </div>
                        {formData.hasActiveHours && (
                            <div className="mt-4 grid grid-cols-2 gap-3 pl-14 animate-in slide-in-from-top-2">
                                <input
                                    type="time"
                                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold"
                                    value={formData.activeHoursStart}
                                    onChange={e => setFormData({ ...formData, activeHoursStart: e.target.value })}
                                    onClick={e => e.stopPropagation()}
                                />
                                <input
                                    type="time"
                                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold"
                                    value={formData.activeHoursEnd}
                                    onChange={e => setFormData({ ...formData, activeHoursEnd: e.target.value })}
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* RIGHT COLUMN: Settings & Publish */}
            <div className="lg:col-span-1 space-y-6">

                {/* ✅ PRO TIP ASIDE */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <img src="/icons/light-bulb_red.svg" alt="Tip" className="w-6 h-6 brightness-0 invert" />
                            {/* Fallback icon if svg missing */}
                            <i className="fa-solid fa-lightbulb text-yellow-300 absolute opacity-0"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-1">Pro Tip</h4>
                            <p className="text-sm text-white/80 leading-relaxed">High-quality photos increase sales by <span className="text-white font-bold">40%</span>. Ensure your lighting is good!</p>
                        </div>
                    </div>
                </div>

                {/* Publish Actions */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm sticky top-24">
                    <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">Publishing</h3>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#FF3B30] text-white font-bold py-4 rounded-xl hover:bg-[#E6352B] transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 mb-3"
                    >
                        {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (mode === 'create' ? "Publish Deal" : "Save Changes")}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => router.back()} className="py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                            Cancel
                        </button>
                        <button type="button" className="py-3 px-4 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900 transition">
                            Preview
                        </button>
                    </div>

                    {/* Valid Until (Moved here) */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Expires On</label>
                        <input
                            required
                            type="date"
                            className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 mb-3"
                            value={formData.validUntil}
                            onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                        />
                        <input
                            type="time"
                            className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                            value={formData.expiryTime}
                            onChange={e => setFormData({ ...formData, expiryTime: e.target.value })}
                        />
                    </div>
                    {/* Inventory Control (Simplified move) */}
                    <div className="mt-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Max Tickets (Inventory)</label>
                        <input
                            type="number"
                            placeholder="e.g. 100"
                            className="w-full bg-[#F8F9FC] border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                            value={formData.totalInventory}
                            onChange={e => setFormData({ ...formData, totalInventory: e.target.value })}
                        />
                    </div>

                </div>

            </div>
        </form>
    )
}
