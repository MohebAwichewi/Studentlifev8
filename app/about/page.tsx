import Link from 'next/link'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">

            {/* Header / Nav Placeholder (Matches Landing Style) */}
            <nav className="border-b border-slate-100 h-[70px] flex items-center px-6">
                <Link href="/" className="flex items-center gap-1 group">
                    <span className="text-2xl font-black tracking-tighter text-slate-900">Student</span>
                    <span className="bg-[#FF3B30] text-white px-1.5 py-0.5 rounded text-lg font-black tracking-wide transform -rotate-2 group-hover:rotate-0 transition-transform">.LIFE</span>
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-16">

                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Spend less. <span className="text-[#FF3B30]">Live more.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Student.Life is the ultimate companion for university students in the UK, dedicated to making student life more affordable, exciting, and connected.
                    </p>
                </div>

                {/* Content Blocks */}
                <div className="space-y-16">

                    <section className="flex flex-col md:flex-row gap-10 items-center">
                        <div className="flex-1">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                <i className="fa-solid fa-bolt"></i>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4">Our Mission</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                We believe that being a student shouldn't mean compromising on quality of life. Our mission is to bridge the gap between students and the best local businesses, providing exclusive access to deals, experiences, and services that matter most to you.
                            </p>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-3xl p-8 border border-slate-100 h-64 flex items-center justify-center">
                            <span className="text-6xl">🚀</span>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row-reverse gap-10 items-center">
                        <div className="flex-1">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                <i className="fa-solid fa-handshake"></i>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4">Connecting Communities</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Beyond just savings, we are building a vibrant ecosystem where students can discover their cities, and local businesses can thrive by connecting with the next generation. We are more than an app; we are a community.
                            </p>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-3xl p-8 border border-slate-100 h-64 flex items-center justify-center">
                            <span className="text-6xl">🌍</span>
                        </div>
                    </section>
                </div>

                {/* Closing */}
                <div className="mt-20 pt-10 border-t border-slate-100 text-center">
                    <p className="text-slate-400 font-medium mb-6">Join the revolution today.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/student/signup" className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg">
                            Sign Up Now
                        </Link>
                        <Link href="/business" className="bg-slate-100 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition">
                            Partner with Us
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    )
}
