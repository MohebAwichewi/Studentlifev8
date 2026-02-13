'use client'

import React, { useState } from 'react'

export default function AdminNotificationsPage() {
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !message) return

        if (!confirm("Are you sure you want to send this to ALL users?")) return

        setLoading(true)
        setStatus(null)

        try {
            const res = await fetch('/api/admin/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message })
            })
            const data = await res.json()

            if (data.success) {
                setStatus({ text: data.message || 'Notifications Sent!', type: 'success' })
                setTitle('')
                setMessage('')
            } else {
                setStatus({ text: data.error || 'Failed to send', type: 'error' })
            }
        } catch (err) {
            setStatus({ text: 'Network error', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Send Notification</h1>
                        <p className="text-slate-500 text-sm font-bold">Broadcast a push message to all app users</p>
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-3 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <i className={`fa-solid ${status.type === 'success' ? 'fa-check' : 'fa-circle-exclamation'}`}></i>
                        {status.text}
                    </div>
                )}

                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Flash Sale Alert! ⚡"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Message</label>
                        <textarea
                            placeholder="Type your announcement here..."
                            required
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition resize-none"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-xl text-yellow-700 text-xs font-bold flex items-start gap-2">
                        <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
                        <p>Warning: This will perform a live broadcast to all registered devices. Use carefully.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Sending...' : (
                            <>
                                <i className="fa-solid fa-paper-plane"></i> Send to All
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
