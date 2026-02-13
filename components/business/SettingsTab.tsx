'use client'

import React, { useState, useEffect } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { useRouter } from 'next/navigation' // Added router for logout/delete

interface SettingsTabProps {
    businessId: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SettingsTab({ businessId }: SettingsTabProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
    const [initialData, setInitialData] = useState<any>(null);

    // --- NEW SETTINGS STATE ---
    const [settings, setSettings] = useState({
        language: 'en',
        timezone: 'Africa/Tunis',
        emailNotifications: true,
        pushNotifications: true,
        email: '' // Read-only
    })
    const [deleteConfirm, setDeleteConfirm] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Form States
    const [formData, setFormData] = useState({
        businessName: '', phone: '', address: '', city: 'Tunis', website: '',
        googleMapsUrl: '', googleMapEmbed: '', description: '', logo: '', coverImage: '', openingHours: '{}'
    })

    const [schedule, setSchedule] = useState<any>({});

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '', newPassword: '', confirmPassword: ''
    })

    // Fetch Profile Data
    useEffect(() => {
        if (businessId) fetchProfile();
    }, [businessId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // Fetch Profile
            const res = await fetch(`/api/auth/business/profile?businessId=${businessId}`);
            const data = await res.json();

            // Fetch Settings
            const settingsRes = await fetch(`/api/auth/business/settings?businessId=${businessId}`);
            const settingsData = await settingsRes.json();

            if (data.success) {
                const fetchedData = {
                    businessName: data.business.businessName || '',
                    phone: data.business.phone || '',
                    address: data.business.address || '',
                    city: data.business.city || 'Tunis',
                    website: data.business.website || '',
                    googleMapsUrl: data.business.googleMapsUrl || '',
                    googleMapEmbed: data.business.googleMapEmbed || '',
                    description: data.business.description || '',
                    logo: data.business.logo || '',
                    coverImage: data.business.coverImage || '',
                    openingHours: data.business.openingHours || '{}'
                };
                setFormData(fetchedData);
                setInitialData(fetchedData);

                // Parse Schedule
                try {
                    const parsed = JSON.parse(data.business.openingHours || '{}');
                    const fullSchedule: any = {};
                    DAYS.forEach(day => {
                        fullSchedule[day] = parsed[day] || { open: '09:00', close: '17:00', isClosed: false };
                    });
                    setSchedule(fullSchedule);
                } catch (e) {
                    const fallback: any = {};
                    DAYS.forEach(day => fallback[day] = { open: '09:00', close: '17:00', isClosed: false });
                    setSchedule(fallback);
                }
            }

            if (settingsData.success && settingsData.settings) {
                setSettings(settingsData.settings);
            }

        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(initialData);
        try {
            const parsed = JSON.parse(initialData.openingHours || '{}');
            const fullSchedule: any = {};
            DAYS.forEach(day => {
                fullSchedule[day] = parsed[day] || { open: '09:00', close: '17:00', isClosed: false };
            });
            setSchedule(fullSchedule);
        } catch (e) { }
        setIsEditing(false);
        setMessage(null);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const payload = { ...formData, businessId, openingHours: JSON.stringify(schedule) };
            const res = await fetch('/api/auth/business/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ text: 'Profile Updated!', type: 'success' });
                if (formData.businessName) localStorage.setItem('businessName', formData.businessName);
                setInitialData(formData);
                setTimeout(() => { setIsEditing(false); setMessage(null); }, 1500);
            } else {
                setMessage({ text: data.error || 'Failed to update profile', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network error updating profile', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSettingsUpdate = async (newSettings: any) => {
        setSettings(newSettings); // Optimistic UI
        try {
            await fetch('/api/auth/business/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId, ...newSettings })
            });
        } catch (e) { console.error(e) }
    }

    const handleScheduleChange = (day: string, field: string, value: any) => {
        setSchedule((prev: any) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ text: "New passwords do not match", type: 'error' });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/auth/business/update-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId,
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ text: 'Password changed successfully!', type: 'success' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ text: data.error || 'Failed to change password', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network error changing password', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') return;
        setSaving(true);
        try {
            const res = await fetch(`/api/auth/business/settings?businessId=${businessId}`, { method: 'DELETE' });
            if (res.ok) {
                localStorage.clear();
                router.push('/business/login');
            } else {
                alert("Failed to delete account");
            }
        } catch (e) { console.error(e) }
    }

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading profile...</div>;

    // --- VIEW MODE (DEFAULT) ---
    if (!isEditing) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                {/* PROFILE CARD */}
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                    {/* Header Image */}
                    <div className="h-48 bg-slate-200 relative group">
                        {formData.coverImage ? (
                            <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100">No Cover Image</div>
                        )}
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute top-4 right-4 bg-white/90 text-slate-900 px-4 py-2 rounded-full text-xs font-black hover:bg-white transition shadow-lg backdrop-blur-md flex items-center gap-2"
                        >
                            <i className="fa-solid fa-pen"></i> Edit Profile
                        </button>
                        {/* Logo Overlay */}
                        <div className="absolute -bottom-10 left-8">
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white overflow-hidden flex items-center justify-center">
                                {formData.logo ? (
                                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fa-solid fa-store text-slate-300 text-3xl"></i>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-12 px-8 pb-8">
                        <h1 className="text-3xl font-black text-slate-900 leading-tight mb-1">{formData.businessName || "Your Business Name"}</h1>
                        <p className="text-slate-500 font-bold text-sm mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-location-dot text-[#FF3B30]"></i> {formData.city} • <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md text-xs">Open Now</span>
                        </p>

                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-widest mb-3">About Us</h3>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">{formData.description || "Add a description to tell your story."}</p>
                        </div>

                        {/* Quick Contact Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <a href={`tel:${formData.phone}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-center text-sm hover:bg-blue-100 transition">
                                <i className="fa-solid fa-phone mr-2"></i> Call
                            </a>
                            <a href={formData.website} target="_blank" className="p-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-center text-sm hover:bg-slate-200 transition">
                                <i className="fa-solid fa-globe mr-2"></i> Website
                            </a>
                        </div>
                    </div>
                </div>

                {/* ACCOUNT SECURITY & PREFERENCES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Security */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-shield-halved text-blue-500"></i> Account Security
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email Address</label>
                                <input disabled value={settings.email} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-500 cursor-not-allowed" />
                            </div>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-4 border-t border-slate-100">
                                <h4 className="font-bold text-slate-900 text-sm">Change Password</h4>
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={passwordForm.currentPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={saving || !passwordForm.newPassword} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition">
                                    Update Password
                                </button>
                            </form>
                            {/* 2FA Placeholder */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-60">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Two-Factor Authentication</h4>
                                    <p className="text-xs text-slate-500">Add an extra layer of security.</p>
                                </div>
                                <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-2 py-1 rounded uppercase">Coming Soon</span>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full flex flex-col">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-sliders text-purple-500"></i> Preferences
                        </h3>
                        <div className="space-y-6 flex-1">
                            {/* Notifications */}
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-4">Notifications</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600">Email Alerts</span>
                                        <button
                                            onClick={() => handleSettingsUpdate({ ...settings, emailNotifications: !settings.emailNotifications })}
                                            className={`w-12 h-6 rounded-full transition relative ${settings.emailNotifications ? 'bg-green-500' : 'bg-slate-200'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.emailNotifications ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600">Push Notifications</span>
                                        <button
                                            onClick={() => handleSettingsUpdate({ ...settings, pushNotifications: !settings.pushNotifications })}
                                            className={`w-12 h-6 rounded-full transition relative ${settings.pushNotifications ? 'bg-green-500' : 'bg-slate-200'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.pushNotifications ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Localization */}
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-4">Localization</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Language</label>
                                        <select
                                            value={settings.language}
                                            onChange={e => handleSettingsUpdate({ ...settings, language: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none"
                                        >
                                            <option value="en">English (US)</option>
                                            <option value="fr">Français</option>
                                            <option value="ar">العربية</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Timezone</label>
                                        <select
                                            value={settings.timezone}
                                            onChange={e => handleSettingsUpdate({ ...settings, timezone: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none"
                                        >
                                            <option value="Africa/Tunis">Tunis (GMT+1)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="Europe/Paris">Paris (CET)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DANGER ZONE */}
                <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
                    <h3 className="text-xl font-black text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-red-800/70 font-medium text-sm mb-6">Permanently remove your account and all associated data. This action cannot be undone.</p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition"
                    >
                        Delete Account
                    </button>
                </div>

                {/* LOGOUT & LEGAL */}
                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 font-bold pt-8 pb-12">
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-600 transition">Terms of Service</a>
                        <a href="#" className="hover:text-slate-600 transition">Privacy Policy</a>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); router.push('/business/login') }}
                        className="text-slate-500 hover:text-red-500 transition mt-4 md:mt-0"
                    >
                        Sign Out
                    </button>
                </div>

                {/* DELETE MODAL */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center relative shadow-2xl">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h3>
                            <p className="text-slate-500 font-bold text-sm mb-6">Type <span className="text-slate-900 font-mono bg-slate-100 px-1 rounded">DELETE</span> below to confirm account deletion.</p>

                            <input
                                type="text"
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-center text-slate-900 mb-6 uppercase"
                                placeholder="Type DELETE"
                                value={deleteConfirm}
                                onChange={e => setDeleteConfirm(e.target.value)}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirm !== 'DELETE'}
                                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    }

    // --- EDIT MODE REMAINS SAME (Just returning the form logic from before) ---
    // For brevity, I'm reusing the exact form logic from the previous file for the edit mode section, 
    // but ensuring navigation back to view mode works correctly.
    // ... (EDIT MODE CODE BLOCK)
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* ... EDIT MODE HEADER ... */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-4 z-40">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <i className="fa-solid fa-pen-to-square text-[#FF3B30]"></i> Edit Profile
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="bg-white border-2 border-slate-200 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-slate-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleProfileUpdate}
                        disabled={saving}
                        className="bg-[#FF3B30] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/30 flex items-center gap-2"
                    >
                        {saving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                        Save
                    </button>
                </div>
            </div>

            {/* ... FORM CONTENT REMAINS UNCHANGED FROM PREVIOUS VERSION ... */}
            <form onSubmit={handleProfileUpdate} className="space-y-6">

                {/* BRANDING */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><i className="fa-solid fa-paintbrush text-orange-500"></i> Branding & Visuals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative group">
                                {formData.logo ? (<img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />) : (<i className="fa-solid fa-store text-slate-300 text-4xl"></i>)}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                    <CldUploadWidget uploadPreset="win_app_uploads" onSuccess={(res: any) => setFormData(p => ({ ...p, logo: res.info.secure_url }))}>
                                        {({ open }) => (<button type="button" onClick={() => open()} className="opacity-0 group-hover:opacity-100 bg-white text-slate-900 px-3 py-1 rounded-full text-xs font-bold">Change</button>)}
                                    </CldUploadWidget>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Square Logo</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="w-full h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center relative group">
                                {formData.coverImage ? (<img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />) : (<div className="text-center text-slate-400"><i className="fa-solid fa-image text-2xl mb-1"></i><p className="text-xs">Upload Cover Image</p></div>)}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                    <CldUploadWidget uploadPreset="win_app_uploads" onSuccess={(res: any) => setFormData(p => ({ ...p, coverImage: res.info.secure_url }))}>
                                        {({ open }) => (<button type="button" onClick={() => open()} className="opacity-0 group-hover:opacity-100 bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">Upload Cover</button>)}
                                    </CldUploadWidget>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BASIC INFO */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><i className="fa-solid fa-circle-info text-blue-500"></i> Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Shop Name</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Phone</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</label>
                            <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 h-24 resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* LOCATION */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><i className="fa-solid fa-map-location-dot text-red-500"></i> Location & Map</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Full Address</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Google Maps Embed Code</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-600" value={formData.googleMapEmbed} onChange={e => setFormData({ ...formData, googleMapEmbed: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* HOURS */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><i className="fa-regular fa-clock text-purple-500"></i> Business Hours</h3>
                    <div className="space-y-3">
                        {DAYS.map(day => (
                            <div key={day} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-4">
                                <div className="flex items-center gap-3 w-32"><div className={`w-2 h-2 rounded-full ${schedule[day]?.isClosed ? 'bg-red-500' : 'bg-green-500'}`}></div><span className="font-bold text-slate-700">{day}</span></div>
                                <div className="flex items-center gap-2 flex-1">
                                    {!schedule[day]?.isClosed ? (
                                        <>
                                            <input type="time" value={schedule[day]?.open} onChange={e => handleScheduleChange(day, 'open', e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-900" />
                                            <span className="text-slate-400 font-bold">-</span>
                                            <input type="time" value={schedule[day]?.close} onChange={e => handleScheduleChange(day, 'close', e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-900" />
                                        </>
                                    ) : (<span className="text-slate-400 font-bold text-sm italic py-1">Closed</span>)}
                                </div>
                                <button type="button" onClick={() => handleScheduleChange(day, 'isClosed', !schedule[day]?.isClosed)} className={`px-3 py-1 rounded-lg text-xs font-bold transition ${schedule[day]?.isClosed ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>{schedule[day]?.isClosed ? 'Closed' : 'Open'}</button>
                            </div>
                        ))}
                    </div>
                </div>

            </form>
        </div>
    )
}
