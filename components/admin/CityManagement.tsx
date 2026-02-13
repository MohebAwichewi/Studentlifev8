'use client'

import React, { useState, useEffect } from 'react'

interface City {
    id: number
    name: string
    nameAr: string | null
    region: string | null
    latitude: number | null
    longitude: number | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export default function CityManagement() {
    const [cities, setCities] = useState<City[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCity, setEditingCity] = useState<City | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        nameAr: '',
        region: '',
        latitude: '',
        longitude: ''
    })

    useEffect(() => {
        fetchCities()
    }, [])

    const fetchCities = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/auth/admin/cities')
            if (res.ok) {
                const data = await res.json()
                setCities(data)
            }
        } catch (error) {
            console.error('Failed to fetch cities:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingCity
                ? `/api/auth/admin/cities/${editingCity.id}`
                : '/api/auth/admin/cities'

            const method = editingCity ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    isActive: editingCity ? editingCity.isActive : true
                })
            })

            if (res.ok) {
                await fetchCities()
                handleCloseModal()
            } else {
                const error = await res.json()
                alert(error.error || 'Failed to save city')
            }
        } catch (error) {
            console.error('Failed to save city:', error)
            alert('Failed to save city')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this city?')) return

        try {
            const res = await fetch(`/api/auth/admin/cities/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                await fetchCities()
            } else {
                alert('Failed to delete city')
            }
        } catch (error) {
            console.error('Failed to delete city:', error)
            alert('Failed to delete city')
        }
    }

    const handleToggleActive = async (city: City) => {
        try {
            const res = await fetch(`/api/auth/admin/cities/${city.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...city,
                    isActive: !city.isActive
                })
            })

            if (res.ok) {
                await fetchCities()
            }
        } catch (error) {
            console.error('Failed to toggle city status:', error)
        }
    }

    const handleEdit = (city: City) => {
        setEditingCity(city)
        setFormData({
            name: city.name,
            nameAr: city.nameAr || '',
            region: city.region || '',
            latitude: city.latitude?.toString() || '',
            longitude: city.longitude?.toString() || ''
        })
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingCity(null)
        setFormData({
            name: '',
            nameAr: '',
            region: '',
            latitude: '',
            longitude: ''
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Cities</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage active cities and regions</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add City
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-2xl font-black text-slate-900">{cities.length}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Cities</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-2xl font-black text-green-700">{cities.filter(c => c.isActive).length}</div>
                    <div className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1">Active</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="text-2xl font-black text-red-700">{cities.filter(c => !c.isActive).length}</div>
                    <div className="text-xs font-bold text-red-600 uppercase tracking-wider mt-1">Inactive</div>
                </div>
            </div>

            {/* Cities Table */}
            {cities.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">
                        <i className="fa-solid fa-city"></i>
                    </div>
                    <h3 className="font-bold text-slate-400">No Cities Yet</h3>
                    <p className="text-xs text-slate-300 mt-2">Add your first city to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">City</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Arabic Name</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Coordinates</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cities.map((city) => (
                                <tr key={city.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{city.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">{city.nameAr || '—'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">{city.region || '—'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-slate-500">
                                            {city.latitude && city.longitude
                                                ? `${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)}`
                                                : '—'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleActive(city)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border ${city.isActive
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-red-100 text-red-700 border-red-200'
                                                }`}
                                        >
                                            {city.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(city)}
                                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition"
                                            >
                                                <i className="fa-solid fa-pen mr-1"></i>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(city.id)}
                                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition"
                                            >
                                                <i className="fa-solid fa-trash mr-1"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900">
                                {editingCity ? 'Edit City' : 'Add New City'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    City Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                                    placeholder="e.g., Tunis"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Arabic Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameAr}
                                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                                    placeholder="e.g., تونس"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Region
                                </label>
                                <select
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                                >
                                    <option value="">Select Region</option>
                                    <option value="North">North</option>
                                    <option value="South">South</option>
                                    <option value="Central">Central</option>
                                    <option value="East">East</option>
                                    <option value="West">West</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                                        placeholder="36.8065"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                                        placeholder="10.1815"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition"
                                >
                                    {editingCity ? 'Update' : 'Add'} City
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
