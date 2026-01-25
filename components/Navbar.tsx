"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Make sure to install lucide-react or use your own icons

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  // MOCK AUTH STATE: Change this logic to your real auth check (e.g., useSession())
  const isLoggedIn = false; 

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white tracking-tighter">
              Student<span className="text-[#bfdbfe] bg-[#6366f1] px-1 rounded-sm ml-1 text-white">.LIFE</span>
            </Link>
          </div>

          {/* Desktop Menu (Hidden on Mobile) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              {!isLoggedIn && (
                <>
                  <Link href="/business-signup" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Business Sign-up
                  </Link>
                  <Link href="/contact" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Contact Us
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Call to Action Button (Desktop) */}
          <div className="hidden md:block">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-bold transition-all"
            >
              {isLoggedIn ? "Dashboard" : "Join Now"}
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Visible when isOpen is true) */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-800"
            >
              Home
            </Link>

            {/* UN-AUTHENTICATED LINKS */}
            {!isLoggedIn && (
              <>
                <Link 
                  href="/business-signup" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Business Sign-up
                </Link>
                <Link 
                  href="/contact" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Contact Us
                </Link>
              </>
            )}

            {/* Mobile CTA Button */}
            <div className="mt-4 px-3">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-bold transition-all"
              >
                {isLoggedIn ? "Go to Dashboard" : "Join Now"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}