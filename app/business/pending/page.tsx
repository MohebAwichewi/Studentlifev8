'use client'

import React from 'react'
import Link from 'next/link'

export default function PendingApprovalScreen() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center border border-slate-100">

                {/* ICON */}
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-clock text-3xl text-orange-500"></i>
                </div>

                {/* HEADLINE */}
                <h1 className="text-2xl font-black text-slate-900 mb-2">Account Under Review</h1>

                {/* BODY */}
                <p className="text-slate-500 font-medium mb-6 leading-relaxed">
                    Thanks for registering! Our team is verifying your business details to ensure quality.
                </p>

                {/* INFO BOX */}
                <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <i className="fa-solid fa-stopwatch text-slate-400"></i>
                        <span className="text-sm font-bold text-slate-700">Estimated Time</span>
                    </div>
                    <p className="text-sm text-slate-600 pl-7">Approval usually takes 24-48 hours.</p>
                </div>

                {/* NEXT STEPS */}
                <p className="text-xs text-slate-400 mb-8">
                    You will receive an email once your account is active.
                </p>

                {/* ACTIONS */}
                <a href="mailto:support@win.com" className="block w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition mb-4">
                    Contact Support
                </a>

                <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-600">
                    Back to Home
                </Link>

            </div>
        </div>
    )
}
