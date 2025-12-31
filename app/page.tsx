'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AboutUsSection from '@/components/AboutUsSection' // Import your new component

export default function LandingPage() {
  const [showSignupModal, setShowSignupModal] = useState(false)
  const router = useRouter()

  // Function to smooth scroll to the About section
  const scrollToAbout = () => {
    const section = document.getElementById('about-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- HELPER COMPONENT ---
  const SignupOption = ({ title, desc, icon, path, color }: any) => (
    <div 
      onClick={() => router.push(path)}
      className="group cursor-pointer relative overflow-hidden bg-white p-6 rounded-2xl border-2 border-transparent hover:border-[var(--primary)] transition-all duration-300 shadow-sm hover:shadow-xl"
      style={{ textAlign: 'left' }}
    >
       <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center text-white text-xl ${color}`}>
         <i className={`fa-solid fa-${icon}`}></i>
       </div>
       <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors">{title}</h3>
       <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
       <div className="absolute top-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--primary)]">
         <i className="fa-solid fa-arrow-right text-xl"></i>
       </div>
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="ambient-bg"></div>

      {/* --- NAVBAR --- */}
      <div className="navbar-container">
        <nav className="navbar">
          <Link href="/" className="logo logo-font">
            Student<span className="life">.LIFE</span>
          </Link>

          {/* 👇 THIS IS WHERE WE ADDED "ABOUT" */}
          <div className="hidden md:flex nav-links">
            <button className="active">Home</button>
            <button>Features</button>
            <button>Partners</button>
            <button onClick={scrollToAbout}>About</button> 
          </div>

          <div className="nav-actions">
            <Link href="/student/login" className="btn-login hidden md:block">Log in</Link>
            <button onClick={() => setShowSignupModal(true)} className="btn-signup">
              S'inscrire gratuitement
            </button>
          </div>
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main id="app">
        <section className="hero-section">
          <div className="hero-text">
            <h1>
              The Ultimate <br />
              <span className="text-[var(--primary)]">Student Lifestyle</span>
              <br /> Platform.
            </h1>
            <p>
              Exclusive discounts, digital ID verification, and campus events. 
              Join the network that connects students with the best brands in Tunisia.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowSignupModal(true)} className="cta-btn">
                Get Started
              </button>
              <button onClick={scrollToAbout} className="px-8 py-4 rounded-full font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* 3D Visuals */}
          <div className="hero-visual hidden md:flex">
             <div className="floating-card">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">🍔</div>
                  <span className="bg-white text-[var(--accent)] text-xs font-bold px-2 py-1 rounded">-20%</span>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">Burger King</div>
                  <div className="text-xs opacity-80">Valid until Dec 31</div>
                </div>
             </div>
             
             <div className="floating-card purple">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">💻</div>
                  <span className="bg-white text-[var(--primary)] text-xs font-bold px-2 py-1 rounded">ID Verified</span>
                </div>
                <div>
                   <div className="text-2xl font-bold mb-1">Moheb S7</div>
                   <div className="text-xs opacity-80">Computer Science</div>
                </div>
             </div>
          </div>
        </section>

        {/* --- ABOUT US SECTION (With ID for scrolling) --- */}
        <div id="about-section">
          <AboutUsSection />
        </div>

      </main>

      {/* --- MODAL --- */}
      {showSignupModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowSignupModal(false)}></div>
          <div className="relative bg-[#f8fafc] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transform transition-all scale-100 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center pt-10 pb-6 px-8 bg-white border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-['Space_Grotesk']">Join Student.LIFE</h2>
              <p className="text-gray-500">Choose how you want to use the platform.</p>
              <button onClick={() => setShowSignupModal(false)} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-4">
              <SignupOption title="I am a Student" desc="Access exclusive discounts, manage your digital ID, and find events." icon="graduation-cap" path="/student/login" color="bg-gradient-to-br from-indigo-500 to-purple-600" />
              <SignupOption title="I am a Business" desc="Create offers, verify student IDs, and reach thousands of customers." icon="shop" path="/business/signup" color="bg-gradient-to-br from-orange-400 to-pink-500" />
            </div>
            <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
               <p className="text-xs text-gray-400">Already have an account? <Link href="/student/login" className="text-[var(--primary)] font-bold hover:underline ml-1">Log in here</Link></p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}