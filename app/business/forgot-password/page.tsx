'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function BusinessForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus('IDLE')

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userType: 'BUSINESS' })
            })

            if (res.ok) {
                setStatus('SUCCESS')
            } else {
                setStatus('ERROR')
            }
        } catch (error) {
            setStatus('ERROR')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-900">
            <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md text-center relative border border-slate-100">

                <Link href="/business/login" className="absolute top-6 left-6 text-slate-400 hover:text-black transition">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </Link>

                <h1 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h1>
                <p className="text-slate-500 font-medium text-sm mb-8">Enter your business email to receive a reset link.</p>

                {status === 'SUCCESS' ? (
                    <div className="bg-green-50 text-green-700 p-6 rounded-2xl animate-in zoom-in">
                        <i className="fa-solid fa-envelope-circle-check text-4xl mb-3"></i>
                        <h3 className="font-bold text-lg mb-1">Check your Inbox</h3>
                        <p className="text-sm">We sent a reset link to <b>{email}</b>.</p>
                        <Link href="/business/login" className="block mt-4 text-xs font-bold underline">Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div>
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 ml-1">Business Email</label>
                            <input
                                type="email"
                                required
                                placeholder="manager@store.com"
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3.5 font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-black transition-colors"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        {status === 'ERROR' && (
                            <div className="text-red-500 text-sm font-bold text-center">
                                Something went wrong. Please try again.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                        >
                            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Send Reset Link"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
