'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

// --- TYPES ---
interface HeroBlock {
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
    badgeText: string
    mediaType: 'image' | 'video' | 'color'
    mediaUrl: string // URL or Color Code
}

interface HeroConfig {
    leftBlock: HeroBlock
    rightBlock: HeroBlock
}

const DEFAULT_CONFIG: HeroConfig = {
    leftBlock: {
        title: 'Spend less. Live more.',
        subtitle: 'Unlock exclusive discounts at your favorite local spots.',
        buttonText: 'Start Saving Free',
        buttonLink: '/user/signup',
        badgeText: 'Student Life, Levelled Up',
        mediaType: 'color',
        mediaUrl: '#111111'
    },
    rightBlock: {
        title: '50% OFF',
        subtitle: 'Burgers & Fries',
        buttonText: '',
        buttonLink: '',
        badgeText: 'Verified',
        mediaType: 'color',
        mediaUrl: '#E60023'
    }
}

export default function HomepageHeroEditor() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState<HeroConfig>(DEFAULT_CONFIG)
    const [activeTab, setActiveTab] = useState<'left' | 'right'>('left')

    // --- 1. FETCH CONFIG ---
    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/public/homepage')
            if (res.ok) {
                const data = await res.json()
                if (data.hero_main) {
                    setConfig(data.hero_main)
                }
            }
        } catch (e) {
            console.error("Failed to load homepage config", e)
        } finally {
            setLoading(false)
        }
    }

    // --- 2. SAVE CONFIG ---
    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/auth/admin/homepage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: 'hero_main',
                    content: config
                })
            })

            if (res.ok) {
                alert('Homepage updated successfully!')
            } else {
                alert('Failed to update homepage.')
            }
        } catch (e) {
            alert('Error saving config.')
        } finally {
            setSaving(false)
        }
    }

    // --- 3. HANDLE CHANGE ---
    const updateBlock = (field: keyof HeroBlock, value: string) => {
        setConfig(prev => ({
            ...prev,
            [activeTab === 'left' ? 'leftBlock' : 'rightBlock']: {
                ...prev[activeTab === 'left' ? 'leftBlock' : 'rightBlock'],
                [field]: value
            }
        }))
    }

    const currentBlock = activeTab === 'left' ? config.leftBlock : config.rightBlock

    if (loading) return <div className="p-10 text-center">Loading editor...</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* --- LEFT: EDITOR FORM --- */}
            <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('left')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'left' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Left Block (Dark)
                        </button>
                        <button
                            onClick={() => setActiveTab('right')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'right' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Right Block (Red)
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-[#E60023] text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Badge */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Badge Text</label>
                        <input
                            type="text"
                            value={currentBlock.badgeText}
                            onChange={(e) => updateBlock('badgeText', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Main Headline</label>
                        <textarea
                            value={currentBlock.title}
                            onChange={(e) => updateBlock('title', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                        />
                        <p className="text-xs text-slate-400 mt-2">Use HTML tags like &lt;br/&gt; for line breaks or &lt;span class="text-red-500"&gt; for color.</p>
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subtitle</label>
                        <textarea
                            value={currentBlock.subtitle}
                            onChange={(e) => updateBlock('subtitle', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                        />
                    </div>

                    {/* Button */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Button Text</label>
                            <input
                                type="text"
                                value={currentBlock.buttonText}
                                onChange={(e) => updateBlock('buttonText', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Button Link</label>
                            <input
                                type="text"
                                value={currentBlock.buttonLink}
                                onChange={(e) => updateBlock('buttonLink', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 my-6"></div>

                    {/* Media */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Background Media</label>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {['image', 'video', 'color'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => updateBlock('mediaType', type as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border capitalize ${currentBlock.mediaType === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <label className="block text-xs font-bold text-slate-400 mb-2">
                            {currentBlock.mediaType === 'color' ? 'Hex Color Code (e.g. #E60023)' : 'Media URL (https://...)'}
                        </label>
                        <input
                            type="text"
                            value={currentBlock.mediaUrl}
                            onChange={(e) => updateBlock('mediaUrl', e.target.value)}
                            placeholder={currentBlock.mediaType === 'color' ? '#000000' : 'https://example.com/image.jpg'}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-900"
                        />
                        {currentBlock.mediaType !== 'color' && (
                            <p className="text-xs text-slate-400 mt-2">Paste a direct link to an image or MP4 video.</p>
                        )}
                    </div>

                </div>
            </div>

            {/* --- RIGHT: LIVE PREVIEW --- */}
            <div>
                <div className="sticky top-10">
                    <h3 className="font-bold text-slate-400 mb-4 uppercase text-xs tracking-widest">Live Preview</h3>

                    {/* The Actual Component Look-alike */}
                    <div className={`rounded-[40px] p-10 relative overflow-hidden flex flex-col justify-center text-white min-h-[500px] shadow-2xl transition-all duration-500 ${activeTab === 'right' ? 'items-center text-center' : ''}`}
                        style={{
                            backgroundColor: currentBlock.mediaType === 'color' ? currentBlock.mediaUrl : '#000',
                            backgroundImage: currentBlock.mediaType === 'image' ? `url(${currentBlock.mediaUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {currentBlock.mediaType === 'video' && (
                            <video
                                src={currentBlock.mediaUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                            />
                        )}

                        {/* Overlay for readability */}
                        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

                        <div className="relative z-10">
                            <span className="inline-block py-1 px-3 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6 text-gray-100 backdrop-blur-sm">
                                {currentBlock.badgeText}
                            </span>
                            <h1
                                className="text-5xl font-black leading-[0.95] tracking-tight mb-6 drop-shadow-lg"
                                dangerouslySetInnerHTML={{ __html: currentBlock.title }}
                            >
                            </h1>
                            <p className="text-lg text-gray-200 font-medium mb-10 max-w-sm mx-auto drop-shadow-md">
                                {currentBlock.subtitle}
                            </p>

                            {currentBlock.buttonText && (
                                <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                                    {currentBlock.buttonText}
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        This is a simplified preview. The actual homepage may handle layout differently.
                    </p>
                </div>
            </div>

        </div>
    )
}
