'use client'

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger effect for children
    },
  },
};

// ✅ FIXED: Typed as 'Variants' to prevent TypeScript errors
const itemVariants: Variants = {
  hidden: { 
    y: 20, 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    } 
  }
};

export default function AboutUsSection() {
  return (
    <section className="relative py-24 bg-white overflow-hidden font-sans">
      {/* --- Background Decorative Elements --- */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-60 mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* --- 1. Header: What is WIN? --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1.5 mb-6 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase tracking-widest">
            Our Mission
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Redefining the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-red-500">University Experience.</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            WIN isn't just an app; it's your campus operating system. We exist to bridge the gap between academic life, local culture, and your budget, ensuring your university years are memorable for the right reasons.
          </p>
        </motion.div>

        {/* --- 2. The "Why" & Benefits Grid --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
        >
          {/* Card 1: Why Use It (Financial) */}
          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-xl"></div>
            <div className="relative p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 h-full">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                💸
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Stretch Your Budget</h3>
              <p className="text-slate-500 leading-relaxed">
                Being a user is expensive. Why pay full price? We curate exclusive deals from the brands you actually love, freeing up cash for more experiences.
              </p>
            </div>
          </motion.div>

          {/* Card 2: What's Good (Access & ID) - Highlighted Card */}
          <motion.div variants={itemVariants} className="relative group md:-mt-4">
             <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-[2.5rem] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"></div>
            <div className="relative p-8 bg-slate-900 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 h-full text-white transform md:scale-105 z-10 border border-slate-800">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mb-6 backdrop-blur-sm">
                🆔
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Your Digital Identity</h3>
              <p className="text-slate-300 leading-relaxed">
                Ditch the plastic card. Your WIN profile is your verified digital ID, granting instant access to campus facilities, events, and in-store discounts with a tap.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Why Use It (Social/FOMO) */}
          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-[2.5rem] opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-xl"></div>
            <div className="relative p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 h-full">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                🎉
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Beat the FOMO</h3>
              <p className="text-slate-500 leading-relaxed">
                Never miss out. Discover hyper-local events, pop-up shops, and campus gatherings happening right now within your radius.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* --- 3. The Leadership Team --- */}
        <div className="border-t border-slate-100 pt-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900">Built for Users.</h2>
            <p className="text-slate-500 mt-4">Meet the leadership team driving the vision forward.</p>
          </motion.div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24">
            
            {/* --- Adi: CEO --- */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group text-center relative"
            >
              <div className="relative mb-6 inline-block">
                 {/* REPLACE THIS DIV WITH <Image /> WHEN YOU HAVE REAL PHOTOS */}
                <div className="w-48 h-48 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-[3rem] rotate-3 group-hover:rotate-0 transition-all duration-500 ease-out overflow-hidden shadow-lg border-[6px] border-white flex items-center justify-center">
                    <span className="text-6xl">💼</span>
                </div>
                {/* Decorative Element */}
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                    <i className="fa-solid fa-check text-white text-sm"></i>
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Adi</h3>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Chief Executive Officer (CEO)</p>
               <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">The visionary ensuring WIN delivers real value to every campus.</p>
            </motion.div>

             {/* Divider for mobile */}
             <div className="w-16 h-[2px] bg-slate-100 md:hidden"></div>

            {/* --- Moheb: CTO --- */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group text-center relative"
            >
               <div className="relative mb-6 inline-block">
                {/* REPLACE THIS DIV WITH <Image /> WHEN YOU HAVE REAL PHOTOS */}
                <div className="w-48 h-48 bg-gradient-to-br from-red-100 to-red-200 rounded-[3rem] -rotate-3 group-hover:rotate-0 transition-all duration-500 ease-out overflow-hidden shadow-lg border-[6px] border-white flex items-center justify-center">
                     <span className="text-6xl">⚙️</span>
                </div>
                 {/* Decorative Element */}
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                    <i className="fa-solid fa-code text-white text-sm"></i>
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Moheb</h3>
              <p className="text-red-500 font-bold text-xs uppercase tracking-widest">Chief Technology Officer (CTO)</p>
              <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">The architect behind the secure, scalable platform powering your user ID.</p>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

