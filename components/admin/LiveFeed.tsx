import React from 'react';

interface FeedItem {
    type: 'REDEMPTION' | 'REGISTRATION';
    message: string;
    timestamp: string;
}

interface LiveFeedProps {
    feed: FeedItem[];
}

export default function LiveFeed({ feed }: LiveFeedProps) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Live Feed
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Real-Time</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                {feed.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center mt-10">No recent activity</p>
                ) : (
                    feed.map((item, index) => (
                        <div key={index} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-2xl transition">
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${item.type === 'REDEMPTION' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                                <i className={`fa-solid fa-${item.type === 'REDEMPTION' ? 'ticket' : 'store'} text-sm`}></i>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 leading-tight">{item.message}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                    {item.type} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
