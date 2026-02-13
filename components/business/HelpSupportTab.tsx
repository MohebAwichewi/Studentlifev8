'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface HelpSupportTabProps {
    businessId: string;
}

export default function HelpSupportTab({ businessId }: HelpSupportTabProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('ALL')

    // Support Form State
    const [ticketForm, setTicketForm] = useState({ subject: '', message: '', priority: 'NORMAL' })
    const [submitting, setSubmitting] = useState(false)
    const [activeAccordion, setActiveAccordion] = useState<number | null>(null)

    const faqs = [
        { id: 1, category: 'General', question: 'How do I create my first deal?', answer: 'Go to "Deal Studio" and click "Create New Deal". Upload an image, set a title, discount, and expiry date.' },
        { id: 2, category: 'Scanning', question: 'How do I verify a customer ticket?', answer: 'Use the QR Scanner in the top-right corner of your dashboard or use our mobile app for businesses.' },
        { id: 3, category: 'Payments', question: 'When do I get billed?', answer: 'Billing occurs monthly on the date you started your subscription. Check the "Billing" tab for invoices.' },
        { id: 4, category: 'Analytics', question: 'What does "Reach" mean?', answer: 'Reach represents the number of unique users who have seen your deal card in their feed.' },
        { id: 5, category: 'General', question: 'Can I edit a deal after posting?', answer: 'Yes, but major changes might require re-approval. Minor edits like description or inventory are instant.' },
    ]

    const videos = [
        { id: 1, title: 'How to Create a Deal', duration: '2:15', thumb: '/images/thumbnails/create-deal.jpg' },
        { id: 2, title: 'Scanning QR Codes', duration: '1:45', thumb: '/images/thumbnails/scanning.jpg' },
        { id: 3, title: 'Understanding Analytics', duration: '3:20', thumb: '/images/thumbnails/analytics.jpg' },
        { id: 4, title: 'Managing Your Profile', duration: '1:30', thumb: '/images/thumbnails/profile.jpg' },
    ]

    const filteredFaqs = faqs.filter(faq =>
        (activeCategory === 'ALL' || faq.category === activeCategory) &&
        (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/auth/business/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId, ...ticketForm })
            });
            const data = await res.json();
            if (data.success) {
                alert("Ticket submitted! Our team will contact you shortly.");
                setTicketForm({ subject: '', message: '', priority: 'NORMAL' });
            } else {
                alert("Failed to submit ticket.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* HERO SEARCH */}
            <div className="bg-[#0F392B] rounded-3xl p-10 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <i className="fa-solid fa-headset text-[200px] absolute -right-10 -bottom-10"></i>
                </div>
                <h2 className="text-3xl font-black mb-4 relative z-10">How can we help you today?</h2>
                <div className="max-w-xl mx-auto relative z-10">
                    <div className="relative">
                        <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full bg-white text-slate-900 rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none shadow-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><i className="fa-solid fa-plus text-xl"></i></div>
                    <div><h4 className="font-black text-slate-900">Create Deal</h4><p className="text-xs text-slate-500">Step-by-step guide</p></div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><i className="fa-solid fa-qrcode text-xl"></i></div>
                    <div><h4 className="font-black text-slate-900">Scan Ticket</h4><p className="text-xs text-slate-500">Learn how to verify</p></div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><i className="fa-solid fa-chart-line text-xl"></i></div>
                    <div><h4 className="font-black text-slate-900">View Reports</h4><p className="text-xs text-slate-500">Understand your data</p></div>
                </div>
            </div>

            {/* VIDEO LIBRARY */}
            <div>
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-play-circle text-red-500"></i> Video Tutorials
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {videos.map(video => (
                        <div key={video.id} className="min-w-[250px] bg-slate-900 rounded-2xl overflow-hidden relative group cursor-pointer snap-start shadow-lg">
                            <div className="h-32 bg-slate-800 flex items-center justify-center relative">
                                {/* Placeholder for thumbnail */}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition"></div>
                                <i className="fa-solid fa-play text-white text-3xl opacity-80 group-hover:scale-110 transition duration-300"></i>
                                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">{video.duration}</span>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-white text-sm">{video.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* FAQs */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Frequently Asked Questions</h3>
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                        {filteredFaqs.map(faq => (
                            <div key={faq.id} className="group">
                                <button
                                    className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-50 transition"
                                    onClick={() => setActiveAccordion(activeAccordion === faq.id ? null : faq.id)}
                                >
                                    <span className="font-bold text-slate-900">{faq.question}</span>
                                    <i className={`fa-solid fa-chevron-down text-slate-400 transition transform ${activeAccordion === faq.id ? 'rotate-180' : ''}`}></i>
                                </button>
                                <AnimatePresence>
                                    {activeAccordion === faq.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-slate-50"
                                        >
                                            <p className="p-6 pt-0 text-sm text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTACT FORM */}
                <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Contact Support</h3>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <form onSubmit={handleTicketSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                                    value={ticketForm.subject}
                                    onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                >
                                    <option value="">Select a topic...</option>
                                    <option value="Billing Issue">Billing Issue</option>
                                    <option value="Technical Bug">Technical Bug</option>
                                    <option value="Account Access">Account Access</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Priority</label>
                                <div className="flex gap-2">
                                    {['NORMAL', 'URGENT'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setTicketForm({ ...ticketForm, priority: p })}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition ${ticketForm.priority === p
                                                ? (p === 'URGENT' ? 'border-red-500 bg-red-50 text-red-500' : 'border-blue-500 bg-blue-50 text-blue-500')
                                                : 'border-slate-100 text-slate-400'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message</label>
                                <textarea
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-slate-900 h-32 resize-none"
                                    placeholder="Describe your issue..."
                                    value={ticketForm.message}
                                    onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                {submitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                Submit Request
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="font-bold text-slate-900 text-sm mb-2">Direct Contact</h4>
                            <p className="text-xs text-slate-500 font-bold flex items-center gap-2 mb-1">
                                <i className="fa-solid fa-phone text-green-500"></i> +216 71 123 456
                            </p>
                            <p className="text-xs text-slate-500 font-bold flex items-center gap-2">
                                <i className="fa-solid fa-envelope text-blue-500"></i> support@win.tn
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
