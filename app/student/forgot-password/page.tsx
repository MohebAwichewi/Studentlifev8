'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function StudentForgotPassword() {
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
                body: JSON.stringify({ email, userType: 'STUDENT' })
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
        <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans text-slate-900 selection:bg-black selection:text-white">
            <div className="w-full max-w-md text-center relative">

                <Link href="/student/login" className="absolute top-0 left-0 text-slate-400 hover:text-black transition p-2 hover:bg-slate-50 rounded-full">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </Link>

                <h1 className="text-3xl font-black text-slate-900 mb-2 mt-12 tracking-tight">Forgot Password?</h1>
                <p className="text-slate-500 font-medium mb-10">No worries! Enter your email and we'll send you a reset link.</p>

                {status === 'SUCCESS' ? (
                    <div className="bg-green-50 text-green-800 p-8 rounded-2xl animate-in zoom-in border border-green-100">
                        <i className="fa-solid fa-paper-plane text-4xl mb-4 text-green-600"></i>
                        <h3 className="font-black text-xl mb-2">Email Sent!</h3>
                        <p className="text-sm font-medium opacity-80">We sent a reset link to <b>{email}</b>.</p>
                        <Link href="/student/login" className="block mt-6 text-sm font-bold underline hover:text-green-950 transition">Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div>
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 ml-1">Student Email</label>
                            <input
                                type="email"
                                required
                                placeholder="name@university.ac.uk"
                                className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-4 font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-black transition-colors"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        {status === 'ERROR' && (
                            <div className="text-red-600 text-sm font-bold text-center bg-red-50 p-3 rounded-lg">
                                Something went wrong. Please check your connection.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Send Reset Link"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
