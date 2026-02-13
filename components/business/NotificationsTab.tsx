'use client'

import React, { useState, useEffect } from 'react'

interface NotificationsTabProps {
    businessId: string;
}

interface Notification {
    id: string;
    type: 'FOLLOW' | 'EXPIRY' | 'SOLD_OUT' | 'RENEWAL' | 'SYSTEM' | 'PERFORMANCE';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsTab({ businessId }: NotificationsTabProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL')

    useEffect(() => {
        if (businessId) fetchData();
    }, [businessId])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/auth/business/notifications?businessId=${businessId}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    }

    const markAsRead = async (id: string) => {
        // Optimistic Update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

        try {
            await fetch('/api/auth/business/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (e) { console.error(e) }
    }

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await fetch('/api/auth/business/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId, markAll: true })
            });
        } catch (e) { console.error(e) }
    }

    const clearAll = async () => {
        if (!confirm("Are you sure you want to delete all notifications?")) return;
        setNotifications([]);
        try {
            await fetch(`/api/auth/business/notifications?businessId=${businessId}`, { method: 'DELETE' });
        } catch (e) { console.error(e) }
    }

    const filtered = activeFilter === 'ALL' ? notifications : notifications.filter(n => !n.isRead);

    const checkIcon = (type: string) => {
        switch (type) {
            case 'FOLLOW': return 'fa-user-plus text-blue-500';
            case 'EXPIRY': return 'fa-hourglass-end text-amber-500';
            case 'SOLD_OUT': return 'fa-circle-xmark text-red-500';
            case 'RENEWAL': return 'fa-file-invoice-dollar text-green-500';
            case 'PERFORMANCE': return 'fa-trophy text-purple-500';
            default: return 'fa-bell text-slate-500';
        }
    }

    if (loading) return <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Loading alerts...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* HEADER */}
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Notifications</h2>
                    <p className="text-slate-500 text-sm font-bold mt-1">Stay updated with your shop's activity.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={markAllRead} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition">
                        Mark All Read
                    </button>
                    <button onClick={clearAll} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold text-red-500 transition">
                        Clear All
                    </button>
                </div>
            </div>

            {/* TOGGLES */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveFilter('ALL')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition ${activeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setActiveFilter('UNREAD')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition ${activeFilter === 'UNREAD' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500'}`}
                >
                    Unread Only
                </button>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
                {filtered.length > 0 ? filtered.map(item => (
                    <div
                        key={item.id}
                        className={`p-6 flex items-start gap-4 transition cursor-pointer ${item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                        onClick={() => !item.isRead && markAsRead(item.id)}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-sm shrink-0`}>
                            <i className={`fa-solid ${checkIcon(item.type)}`}></i>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className={`text-sm font-bold ${!item.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {item.title}
                                    {!item.isRead && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-4">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={`text-xs mt-1 ${!item.isRead ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                {item.message}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <i className="fa-regular fa-bell-slash text-2xl"></i>
                        </div>
                        <h3 className="font-bold text-slate-900">All caught up!</h3>
                        <p className="text-slate-400 text-xs mt-1">No new notifications to show.</p>
                    </div>
                )}
            </div>

        </div>
    )
}
