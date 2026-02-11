'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function TermsOfServicePage() {
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

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Terms of Service</h1>
                <p className="text-slate-500 font-bold mb-12 uppercase tracking-wide text-sm">Last updated: 10 February 2026</p>

                <div className="prose prose-slate prose-lg max-w-none">
                    <p>
                        Welcome to Student.LIFE! By downloading, accessing, or using our mobile application ("the App") or website, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
                    </p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">1. Eligibility</h2>
                    <p>To use Student.LIFE, you must:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Be at least 16 years old.</li>
                        <li>Be a current student at a recognised university or college (verification may be required).</li>
                        <li>Provide accurate, current, and complete account information.</li>
                    </ul>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">2. User Accounts & Security</h2>
                    <p><strong>Account Safety:</strong> You are responsible for maintaining the confidentiality of your login credentials. You are responsible for all activities that occur under your account.</p>
                    <p><strong>Verification:</strong> We reserve the right to request proof of student status (e.g., Student ID card or university email). If you cannot provide valid proof, we may suspend or terminate your account.</p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">3. Deals & Redemptions</h2>
                    <p>Student.LIFE provides a platform for you to discover offers from third-party businesses ("Partners").</p>
                    <p><strong>Third-Party Service:</strong> We display offers, but the Partner (restaurant, shop, etc.) is solely responsible for providing the goods or services. We are not liable for the quality, safety, or availability of their products.</p>

                    <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">Redemption Rules:</h3>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Deals must be redeemed physically at the Partner's location unless stated otherwise.</li>
                        <li>You must use the "Swipe to Redeem" feature in the presence of staff if required.</li>
                        <li>Redeemed vouchers cannot be reversed or reused (unless specified as "Unlimited").</li>
                    </ul>

                    <p><strong>Expiry:</strong> Deals and rewards have strict expiration dates. Expired vouchers will not be honored or refunded.</p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">4. Spin & Win Feature</h2>
                    <p><strong>Nature of Game:</strong> The "Spin & Win" feature is a promotional activity. Outcomes are determined by a server-side algorithm based on set probabilities.</p>

                    <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">Prizes:</h3>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Prizes are subject to availability and may be changed or withdrawn by us or the Partner at any time without notice.</li>
                        <li>Prizes must be saved to your in-app Wallet and redeemed within the stated validity period (usually 14 days).</li>
                        <li>Prizes are non-transferable and cannot be exchanged for cash.</li>
                    </ul>

                    <p><strong>Malfunctions:</strong> In the event of a technical glitch, server error, or manipulation of the App, Student.LIFE reserves the right to void any "wins" deemed invalid.</p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">5. Acceptable Use</h2>
                    <p>You agree NOT to:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Use the App for any illegal purpose.</li>
                        <li>Attempt to bypass the "Swipe to Redeem" mechanism or use screenshots of deals.</li>
                        <li>Manipulate location data (GPS spoofing) to access location-restricted features.</li>
                        <li>Create multiple accounts to abuse the "Spin & Win" system or "New User" offers.</li>
                    </ul>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">6. Limitation of Liability</h2>
                    <p>The App is provided on an "AS IS" and "AS AVAILABLE" basis. To the fullest extent permitted by law, Student.LIFE excludes all liability for:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Any errors or interruptions in the App.</li>
                        <li>Any refusal by a Partner to honour a specific deal.</li>
                        <li>Any injury, loss, or damage arising from goods or services purchased from Partners.</li>
                    </ul>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">7. Termination</h2>
                    <p>We reserve the right to suspend or delete your account immediately, without notice, if we believe you have violated these Terms (e.g., using a fake ID, abusing the referral system, or harassing staff).</p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">8. Changes to Terms</h2>
                    <p>We may modify these Terms at any time. Continued use of the App after changes are posted constitutes your acceptance of the new Terms.</p>

                    <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">9. Contact Us</h2>
                    <p>For any questions regarding these Terms, please contact us at: <a href="mailto:support@student.life" className="text-blue-600 font-bold hover:underline">support@student.life</a></p>
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
