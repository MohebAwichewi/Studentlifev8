import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    isVerified: boolean;
    isBanned: boolean;
    createdAt: string;
    activity: {
        tickets: number;
        redemptions: number;
    };
    _count?: { tickets: number, redemptions: number }; // Prisma raw return
}

interface UserTableProps {
    onBanUser: (id: string, currentStatus: boolean) => void;
    // Removed 'users' prop as we fetch internally now
}

export default function UserTable({ onBanUser }: UserTableProps) {
    // --- STATE ---
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('All');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // --- DEBOUNCE SEARCH ---
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- FETCH DATA ---
    useEffect(() => {
        fetchUsers();
    }, [page, debouncedSearch, statusFilter, cityFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10', // 10 per page
                search: debouncedSearch,
                status: statusFilter === 'all' ? '' : statusFilter,
                city: cityFilter === 'All' ? '' : cityFilter
            });

            const res = await fetch(`/api/auth/admin/users/list?${params}`);
            const data = await res.json();

            if (data.success) {
                // Map _count to activity for cleaner usage
                const mappedUsers = data.users.map((u: any) => ({
                    ...u,
                    activity: {
                        tickets: u._count.tickets,
                        redemptions: u._count.redemptions
                    }
                }));
                setUsers(mappedUsers);
                setTotalPages(data.pagination.totalPages);
                setTotalUsers(data.pagination.total);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
    };
    // --- ACTIONS STATE ---
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalMode, setModalMode] = useState<'VIEW' | 'BAN' | 'HISTORY' | 'DELETE' | null>(null);
    const [history, setHistory] = useState<{ tickets: any[], redemptions: any[] }>({ tickets: [], redemptions: [] });
    const [historyLoading, setHistoryLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // --- HISTORY FETCH ---
    const fetchHistory = async (userId: string) => {
        setHistoryLoading(true);
        try {
            const res = await fetch(`/api/auth/admin/users/${userId}/history`);
            const data = await res.json();
            if (data.success) {
                setHistory(data.history);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    // --- DELETE USER ---
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/auth/admin/users/${selectedUser.id}`, { method: 'DELETE' });
            if (res.ok) {
                // Remove locally
                setUsers(users.filter(u => u.id !== selectedUser.id));
                setTotalUsers(prev => prev - 1);
                setSelectedUser(null);
                setModalMode(null);
            } else {
                alert("Failed to delete user");
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("Delete failed");
        } finally {
            setDeleteLoading(false);
        }
    };

    // --- CSV EXPORT ---
    const handleExportCSV = async () => {
        try {
            const params = new URLSearchParams({
                limit: '10000', // Export all (or reasonable max)
                search: debouncedSearch,
                status: statusFilter === 'all' ? '' : statusFilter,
                city: cityFilter === 'All' ? '' : cityFilter
            });
            const res = await fetch(`/api/auth/admin/users/list?${params}`);
            const data = await res.json();

            if (data.success) {
                const csvContent = [
                    ["ID", "Name", "Email", "Phone", "City", "Status", "Joined", "Tickets", "Redemptions"],
                    ...data.users.map((u: any) => [
                        u.id,
                        u.fullName,
                        u.email,
                        u.phone || '',
                        u.city || '',
                        u.isBanned ? 'Banned' : 'Active',
                        new Date(u.createdAt).toLocaleDateString(),
                        u._count.tickets,
                        u._count.redemptions
                    ])
                ].map(e => e.join(",")).join("\n");

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "users_export.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Export failed", error);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 relative">
            {/* --- MODALS --- */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">

                        {/* VIEW MODE */}
                        {modalMode === 'VIEW' && (
                            <div className="p-8">
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-3xl mx-auto mb-4">
                                        {selectedUser.fullName.charAt(0)}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">{selectedUser.fullName}</h3>
                                    <p className="text-slate-500 font-bold">{selectedUser.email}</p>
                                    <p className="text-slate-400 text-sm mt-1">{selectedUser.phone || 'No Phone'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 p-4 rounded-xl text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Joined</p>
                                        <p className="font-black text-slate-800">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase">City</p>
                                        <p className="font-black text-slate-800">{selectedUser.city || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Tickets</p>
                                        <p className="font-black text-slate-800">{selectedUser.activity?.tickets || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Redeemed</p>
                                        <p className="font-black text-emerald-500">{selectedUser.activity?.redemptions || 0}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setSelectedUser(null); setModalMode(null); }} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                                    Close
                                </button>
                            </div>
                        )}

                        {/* HISTORY MODE */}
                        {modalMode === 'HISTORY' && (
                            <div className="flex flex-col h-full">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="text-xl font-black text-slate-900">User History</h3>
                                    <p className="text-xs font-bold text-slate-400">Activity Log for {selectedUser.fullName}</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {historyLoading ? (
                                        <div className="flex justify-center p-8"><i className="fa-solid fa-circle-notch fa-spin text-slate-300"></i></div>
                                    ) : (history.tickets.length === 0 && history.redemptions.length === 0) ? (
                                        <p className="text-center text-slate-400 text-sm font-bold">No activity found.</p>
                                    ) : (
                                        <>
                                            {history.redemptions.map((r: any) => (
                                                <div key={r.id} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center flex-shrink-0">
                                                        <i className="fa-solid fa-check"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">Redeemed: {r.deal}</p>
                                                        <p className="text-xs text-slate-500">at {r.business}</p>
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{new Date(r.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {history.tickets.map((t: any) => (
                                                <div key={t.id} className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-xl">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-400 flex items-center justify-center flex-shrink-0">
                                                        <i className="fa-solid fa-ticket"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">Claimed: {t.deal}</p>
                                                        <p className="text-xs text-slate-500">at {t.business}</p>
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{new Date(t.date).toLocaleDateString()} • {t.status}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                                <div className="p-4 border-t border-slate-100">
                                    <button onClick={() => { setSelectedUser(null); setModalMode(null); }} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* BAN MODE */}
                        {modalMode === 'BAN' && (
                            <div className="p-8 text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${selectedUser.isBanned ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}`}>
                                    <i className={`fa-solid ${selectedUser.isBanned ? 'fa-unlock' : 'fa-ban'}`}></i>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">
                                    {selectedUser.isBanned ? 'Unban User?' : 'Ban User?'}
                                </h3>
                                <p className="text-slate-500 font-medium mb-8">
                                    {selectedUser.isBanned
                                        ? "This will restore their access to the platform immediately."
                                        : "They will be logged out and unable to access their account."}
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => { setSelectedUser(null); setModalMode(null); }} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            onBanUser(selectedUser.id, selectedUser.isBanned);
                                            setSelectedUser(null);
                                            setModalMode(null);
                                            // Optimistic update locally
                                            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, isBanned: !u.isBanned } : u));
                                        }}
                                        className={`flex-1 py-3 font-bold rounded-xl text-white transition ${selectedUser.isBanned ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                                    >
                                        {selectedUser.isBanned ? 'Unban User' : 'Ban User'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* DELETE MODE */}
                        {modalMode === 'DELETE' && (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 text-3xl">
                                    <i className="fa-solid fa-trash-can"></i>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Delete User?</h3>
                                <p className="text-slate-500 font-medium mb-8">
                                    Are you sure you want to permanently delete <strong>{selectedUser.fullName}</strong>? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => { setSelectedUser(null); setModalMode(null); }} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        disabled={deleteLoading}
                                        className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50"
                                    >
                                        {deleteLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Delete Forever'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- HEADER CONTROLS --- */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900">User Management</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">
                        {totalUsers} Registered Users
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Status Filter */}
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-slate-900 transition"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                    </select>

                    {/* City Filter (Mock list for now, ideally dynamic) */}
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-slate-900 transition"
                        value={cityFilter}
                        onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                    >
                        <option value="All">All Cities</option>
                        <option value="Tunis">Tunis</option>
                        <option value="Sousse">Sousse</option>
                        <option value="Sfax">Sfax</option>
                    </select>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Name, Email, Phone..."
                            className="pl-10 pr-4 py-3 bg-slate-50 border border-transparent focus:border-slate-900 rounded-xl font-bold text-sm w-64 transition outline-none"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    </div>

                    {/* Export CSV (Mock) */}
                    <button
                        onClick={handleExportCSV}
                        className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition"
                        title="Export CSV"
                    >
                        <i className="fa-solid fa-file-csv"></i>
                    </button>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="overflow-x-auto min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-slate-200"></i>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-8 py-4">User</th>
                                <th className="px-8 py-4">Location</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Activity</th>
                                <th className="px-8 py-4">Joined</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold">
                                        No users found matching "{debouncedSearch}"
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition bg-white group">
                                        {/* User Col */}
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-lg uppercase">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{user.fullName}</div>
                                                    <div className="text-xs font-medium text-slate-400">{user.email}</div>
                                                    {user.phone && <div className="text-[10px] font-bold text-slate-300 mt-0.5">{user.phone}</div>}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Location Col */}
                                        <td className="px-8 py-4">
                                            <span className="font-bold text-slate-600 text-sm bg-slate-100 px-3 py-1 rounded-lg">
                                                {user.city || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Status Col */}
                                        <td className="px-8 py-4">
                                            {user.isBanned ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-600 uppercase tracking-wide">
                                                    <i className="fa-solid fa-ban"></i> Banned
                                                </span>
                                            ) : user.isVerified ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-600 uppercase tracking-wide">
                                                    <i className="fa-solid fa-check"></i> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-500 uppercase tracking-wide">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>

                                        {/* Activity Col (New) */}
                                        <td className="px-8 py-4">
                                            <div className="text-xs font-bold text-slate-500 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-solid fa-ticket text-slate-300 w-4"></i>
                                                    <span>{user.activity?.tickets || 0} Claims</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-solid fa-check-double text-emerald-400 w-4"></i>
                                                    <span className="text-slate-700">{user.activity?.redemptions || 0} Redeemed</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Joined Col */}
                                        <td className="px-8 py-4 text-sm font-bold text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>

                                        {/* Actions Col */}
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setModalMode('VIEW'); }}
                                                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
                                                    title="View Profile"
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                                {/* History Placeholder */}
                                                <button
                                                    onClick={() => { setSelectedUser(user); setModalMode('HISTORY'); fetchHistory(user.id); }}
                                                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
                                                    title="View History"
                                                >
                                                    <i className="fa-solid fa-history"></i>
                                                </button>
                                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                                <button
                                                    onClick={() => { setSelectedUser(user); setModalMode('BAN'); }}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${user.isBanned ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                                    title={user.isBanned ? "Unban User" : "Ban User"}
                                                >
                                                    <i className={`fa-solid ${user.isBanned ? 'fa-unlock' : 'fa-ban'}`}></i>
                                                </button>

                                                <button
                                                    onClick={() => { setSelectedUser(user); setModalMode('DELETE'); }}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition ml-1"
                                                    title="Delete User"
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- PAGINATION FOOTER --- */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                <p className="text-xs font-bold text-slate-400">
                    Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => handlePageChange(page - 1)}
                        className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition"
                    >
                        Previous
                    </button>
                    <button
                        disabled={page === totalPages}
                        onClick={() => handlePageChange(page + 1)}
                        className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
