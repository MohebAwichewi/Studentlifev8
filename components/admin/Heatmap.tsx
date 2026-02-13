import React, { useEffect, useState } from 'react';

export default function Heatmap() {
    const [cityStats, setCityStats] = useState<{ city: string, count: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/auth/admin/stats/global')
            .then(res => res.json())
            .then(data => {
                if (data.cityDistribution) {
                    setCityStats(data.cityDistribution)
                }
            })
            .catch(err => console.error("Failed to load city stats"))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white h-full flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Tunisia_location_map.svg/652px-Tunisia_location_map.svg.png')] bg-cover bg-center opacity-10 mix-blend-overlay grayscale group-hover:scale-105 transition duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>

            <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-black flex items-center gap-2">
                        <i className="fa-solid fa-map-location-dot text-emerald-400"></i> Partner Distribution
                    </h3>
                    <p className="text-slate-400 text-xs font-bold mt-1">Active Businesses by City (Real-Time)</p>
                </div>
            </div>

            <div className="relative flex-1 flex flex-col justify-center space-y-4">
                {loading ? (
                    <div className="text-center text-slate-500 font-bold">Loading Stats...</div>
                ) : cityStats.length === 0 ? (
                    <div className="text-center text-slate-500 font-bold">No data available</div>
                ) : (
                    cityStats.map((stat, index) => (
                        <div key={stat.city} className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/5 hover:bg-white/10 transition">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-emerald-500 text-white' : index === 1 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                    {index + 1}
                                </div>
                                <span className="font-bold text-lg">{stat.city || 'Unknown City'}</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-xl">{stat.count}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Partners</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
