"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  // Handle Scroll Effect & Auth Check
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Check Auth Token
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Active Link Helper
  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? "py-4" : "py-6"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div
          className={`relative backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 shadow-2xl ${scrolled ? "bg-black/80 shadow-black/20" : "bg-black/60 shadow-black/10"
            }`}
        >
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#E60023] rounded-full flex items-center justify-center text-white font-black text-xl tracking-tighter shadow-lg shadow-red-600/30 group-hover:scale-110 transition-transform">
              W
            </div>
            <span className="text-2xl font-black text-white tracking-tighter hidden sm:block">
              WIN<span className="text-[#E60023]">.</span>
            </span>
          </Link>

          {/* --- DESKTOP LINKS --- */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
            {[
              { name: "Home", path: "/" },
              { name: "Deals", path: "/deals" },
              { name: "Map", path: "/map" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isActive(link.path)
                  ? "bg-white text-black shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* --- ACTIONS --- */}
          <div className="flex items-center gap-4">
            {/* Search Trigger (Icon Only) */}
            <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/5">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>

            {isLoggedIn ? (
              // USER LOGGED IN
              <div className="flex items-center gap-3">
                <Link
                  href="/user/dashboard"
                  className="hidden sm:flex items-center gap-2 text-white font-bold hover:text-[#E60023] transition-colors"
                >
                  My Wallet
                </Link>
                <Link
                  href="/user/profile"
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E60023] to-orange-500 p-[2px] shadow-lg shadow-red-500/20"
                >
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                    <i className="fa-solid fa-user text-white/80 text-sm"></i>
                  </div>
                </Link>
              </div>
            ) : (
              // GUEST
              <div className="flex items-center gap-3">
                <Link
                  href="/user/login"
                  className="hidden sm:block text-sm font-bold text-white hover:text-gray-300 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/user/signup"
                  className="bg-[#E60023] hover:bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white"
            >
              <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU --- */}
        {isOpen && (
          <div className="absolute top-[90px] left-6 right-6 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Link href="/" onClick={toggleMenu} className="p-4 rounded-xl hover:bg-white/5 text-white font-bold text-lg flex justify-between items-center group">
                Home <i className="fa-solid fa-arrow-right -rotate-45 opacity-0 group-hover:opacity-100 transition-opacity text-[#E60023]"></i>
              </Link>
              <Link href="/deals" onClick={toggleMenu} className="p-4 rounded-xl hover:bg-white/5 text-white font-bold text-lg flex justify-between items-center group">
                Deals <span className="bg-[#E60023] text-white text-xs px-2 py-0.5 rounded-full">Hot</span>
              </Link>
              {!isLoggedIn && (
                <>
                  <div className="h-px bg-white/10 my-2"></div>
                  <Link href="/user/login" onClick={toggleMenu} className="p-4 text-center text-gray-400 font-bold hover:text-white">Log In</Link>
                  <Link href="/user/signup" onClick={toggleMenu} className="p-4 bg-white text-black rounded-xl font-black text-center shadow-lg hover:scale-[1.02] transition-transform">Get Started Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
