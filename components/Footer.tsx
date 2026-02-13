'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-[#111] text-white pt-20 pb-10 relative overflow-hidden font-sans border-t border-gray-900">

            <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                {/* Col 1: Brand */}
                <div>
                    <Link href="/" className="text-3xl font-black tracking-tight mb-6 inline-block text-white hover:text-[#E60023] transition-colors">WIN.</Link>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                        Unlock exclusive discounts at your favorite local spots.
                    </p>
                </div>

                {/* Col 2: Company */}
                <div>
                    <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">WIN</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li><Link href="/about" className="hover:text-[#E60023] transition-colors">About Us</Link></li>
                        <li><Link href="/careers" className="hover:text-[#E60023] transition-colors">Careers</Link></li>
                        <li><Link href="/business" className="hover:text-[#E60023] transition-colors">For Business</Link></li>
                        <li><Link href="/partners" className="hover:text-[#E60023] transition-colors">Partners</Link></li>
                    </ul>
                </div>

                {/* Col 3: Support */}
                <div>
                    <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Help</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li><Link href="/contact" className="hover:text-[#E60023] transition-colors">Contact Us</Link></li>
                        <li><Link href="/faq" className="hover:text-[#E60023] transition-colors">FAQ</Link></li>
                        <li><Link href="/terms" className="hover:text-[#E60023] transition-colors">Terms of Service</Link></li>
                        <li><Link href="/privacy" className="hover:text-[#E60023] transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* Col 4: Socials */}
                <div>
                    <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Follow Us</h4>
                    <div className="flex gap-4">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#E60023] hover:text-white transition-all">
                            <i className="fa-brands fa-instagram"></i>
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#E60023] hover:text-white transition-all">
                            <i className="fa-brands fa-tiktok"></i>
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#E60023] hover:text-white transition-all">
                            <i className="fa-brands fa-facebook-f"></i>
                        </a>
                    </div>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="max-w-[1400px] mx-auto px-6 pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 font-medium">
                <p>&copy; 2026 WIN. All rights reserved.</p>
                <p>Made with <span className="text-[#E60023]">❤️</span> in Tunisia.</p>
            </div>

        </footer>
    )
}
