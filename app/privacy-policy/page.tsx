'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-black selection:text-white pt-[70px]">

            {/* ==================== NAVBAR (Sticky Top) ==================== */}
            <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200 h-[70px] transition-all shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 h-full flex items-center justify-between gap-4">

                    {/* Left: Hamburger & Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="w-10 h-10 flex items-center justify-center text-slate-900 hover:bg-slate-100 rounded-full transition"
                        >
                            <i className="fa-solid fa-bars text-xl"></i>
                        </button>

                        <Link href="/" className="flex items-center gap-1 group">
                            <span className="text-2xl font-black tracking-tighter text-slate-900">Student</span>
                            <span className="bg-[#FF3B30] text-white px-1.5 py-0.5 rounded text-lg font-black tracking-wide transform -rotate-2 group-hover:rotate-0 transition-transform">.LIFE</span>
                        </Link>
                    </div>

                    {/* Center: Search Bar (Hidden on Mobile) */}
                    <div className="hidden md:block flex-1 max-w-xl relative">
                        <input
                            type="text"
                            placeholder="Search brands..."
                            className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 rounded-md py-2.5 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-500 transition-all"
                        />
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-3 text-slate-400"></i>
                    </div>

                    {/* Right: Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <button className="md:hidden text-slate-900 p-2">
                            <i className="fa-solid fa-magnifying-glass text-xl"></i>
                        </button>
                        <Link href="/student/login" className="hidden sm:block text-sm font-bold text-slate-900 px-4 py-2 hover:text-slate-600 transition">
                            Log in
                        </Link>
                        <Link href="/student/signup" className="bg-black text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-slate-800 transition shadow-sm whitespace-nowrap">
                            Join now
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ==================== CONTENT ==================== */}
            <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
                <p className="text-slate-500 font-bold mb-12 uppercase tracking-wide text-sm">Last updated: 10 February 2026</p>

                <div className="prose prose-slate prose-lg max-w-none">
                    <p>
                        Student.LIFE (“we”, “our”, or “us”) values your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use the Student.LIFE mobile application (“the App”).
                    </p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">1. Information We Collect</h2>
                    <p>We may collect the following information:</p>

                    <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">a) Personal Information</h3>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Name</li>
                        <li>Email address</li>
                        <li>University affiliation (if provided)</li>
                        <li>Account login credentials</li>
                    </ul>

                    <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">b) Usage Data</h3>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>App interactions (e.g. offers viewed, brands followed)</li>
                        <li>Device type and operating system</li>
                        <li>Anonymous analytics data to improve performance and user experience</li>
                    </ul>

                    <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">c) Location Data (If Enabled)</h3>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Approximate location to show relevant local businesses and offers</li>
                        <li>Location is not tracked continuously and is only used while using the app</li>
                    </ul>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">2. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Create and manage your account</li>
                        <li>Display relevant student offers and local businesses</li>
                        <li>Improve app functionality and user experience</li>
                        <li>Communicate important updates or service-related notifications</li>
                        <li>Maintain app security and prevent misuse</li>
                    </ul>
                    <p className="font-bold">We do not sell your personal data to third parties.</p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">3. Sharing of Information</h2>
                    <p>We may share limited data with:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Trusted service providers (e.g. analytics, hosting) strictly for app operation</li>
                        <li>Legal authorities if required by law</li>
                    </ul>
                    <p>Local businesses do not receive your personal contact details unless you explicitly provide them.</p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">4. Data Storage and Security</h2>
                    <p>We take reasonable technical and organisational measures to protect your data, including:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Secure servers</li>
                        <li>Encrypted data transmission</li>
                        <li>Limited internal access to user information</li>
                    </ul>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">5. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Access your personal data</li>
                        <li>Update or correct your information</li>
                        <li>Delete your account and associated data at any time</li>
                    </ul>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6">
                        <h3 className="text-lg font-black text-slate-900 mb-2">Account Deletion</h3>
                        <p className="mb-2">You can request account deletion directly within the app or by contacting us at: <a href="mailto:support@student.life" className="text-blue-600 font-bold hover:underline">support@student.life</a></p>
                        <p className="text-sm text-slate-500">Account deletion permanently removes your personal data from our systems.</p>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">6. Children’s Privacy</h2>
                    <p>Student.LIFE is intended for users aged 16 and above. We do not knowingly collect data from children under 16.</p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">7. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. Any changes will be posted at this URL and reflected by the “Last updated” date.</p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">8. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy or how your data is handled, contact us at: <a href="mailto:support@student.life" className="text-blue-600 font-bold hover:underline">support@student.life</a></p>
                </div>
            </main>

            {/* ==================== FOOTER ==================== */}
            <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
                <div className="max-w-[1440px] mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <Link href="/" className="flex items-center gap-1 group justify-center md:justify-start mb-2">
                                <span className="text-xl font-black tracking-tighter text-slate-900">Student</span>
                                <span className="bg-[#FF3B30] text-white px-1 py-0.5 rounded text-sm font-black tracking-wide">.LIFE</span>
                            </Link>
                            <p className="text-sm text-slate-500 font-bold">© 2026 Student.LIFE UK.</p>
                        </div>

                        <div className="flex gap-8 text-sm font-bold text-slate-500">
                            <Link href="/privacy-policy" className="hover:text-slate-900 transition">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
                            <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ==================== HAMBURGER MENU (Sidebar) ==================== */}
            <div
                className={`fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            <div className={`fixed top-0 left-0 h-full w-[320px] bg-white z-[100] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-5 flex justify-between items-center border-b border-slate-100">
                    <span className="text-xl font-black text-slate-900">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition text-slate-900">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="grid grid-cols-2 gap-3 mb-8 md:hidden">
                        <Link href="/student/login" className="py-3 text-center border-2 border-slate-100 rounded-lg font-bold text-slate-900 hover:border-slate-300 transition">Log in</Link>
                        <Link href="/student/signup" className="py-3 text-center bg-black text-white rounded-lg font-bold hover:bg-slate-800 transition">Join now</Link>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">For Businesses</p>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <Link href="/business" className="block mb-3">
                                    <h4 className="font-black text-slate-900 mb-1">Partner with us</h4>
                                    <p className="text-xs text-slate-500">Reach millions of students and grow your brand.</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-300">© 2026 Student.LIFE UK</p>
                </div>
            </div>

        </div>
    )
}
