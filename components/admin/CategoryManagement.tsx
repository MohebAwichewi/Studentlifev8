'use client'

import React, { useState, useEffect } from 'react'

interface Category {
    id: number
    name: string
    type: string
    parentId: number | null
    children?: Category[]
    createdAt: string
}

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        parentId: null as number | null
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/auth/admin/categories')
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingCategory
                ? `/api/auth/admin/categories/${editingCategory.id}`
                : '/api/auth/admin/categories'

            const method = editingCategory ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                await fetchCategories()
                handleCloseModal()
            } else {
                alert('Failed to save category')
            }
        } catch (error) {
            console.error('Failed to save category:', error)
            alert('Failed to save category')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) return

        try {
            const res = await fetch(`/api/auth/admin/categories/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                await fetchCategories()
            } else {
                alert('Failed to delete category')
            }
        } catch (error) {
            console.error('Failed to delete category:', error)
            alert('Failed to delete category')
        }
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            parentId: category.parentId
        })
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingCategory(null)
        setFormData({
            name: '',
            parentId: null
        })
    }

    const getTotalSubcategories = () => {
        return categories.reduce((acc, cat) => acc + (cat.children?.length || 0), 0)
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
                    <h3 className="text-xl font-black text-slate-900">Categories</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage main categories and subcategories</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Category
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-2xl font-black text-slate-900">{categories.length + getTotalSubcategories()}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Categories</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-2xl font-black text-blue-700">{categories.length}</div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">Main Categories</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-2xl font-black text-purple-700">{getTotalSubcategories()}</div>
                    <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mt-1">Subcategories</div>
                </div>
            </div>

            {/* Categories Tree */}
            {categories.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <h3 className="font-bold text-slate-400">No Categories Yet</h3>
                    <p className="text-xs text-slate-300 mt-2">Add your first category to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {categories.map((mainCategory) => (
                        <div key={mainCategory.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                            {/* Main Category */}
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                        <i className="fa-solid fa-folder"></i>
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-900">{mainCategory.name}</div>
                                        <div className="text-xs text-slate-400">
                                            {mainCategory.children?.length || 0} subcategories
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setFormData({ name: '', parentId: mainCategory.id })
                                            setShowModal(true)
                                        }}
                                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition"
                                    >
                                        <i className="fa-solid fa-plus mr-1"></i>
                                        Add Sub
                                    </button>
                                    <button
                                        onClick={() => handleEdit(mainCategory)}
                                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition"
                                    >
                                        <i className="fa-solid fa-pen mr-1"></i>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(mainCategory.id)}
                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition"
                                    >
                                        <i className="fa-solid fa-trash mr-1"></i>
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Subcategories */}
                            {mainCategory.children && mainCategory.children.length > 0 && (
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {mainCategory.children.map((subCategory) => (
                                            <div
                                                key={subCategory.id}
                                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-solid fa-tag text-purple-500"></i>
                                                    <span className="text-sm font-bold text-slate-700">{subCategory.name}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(subCategory)}
                                                        className="w-7 h-7 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition flex items-center justify-center"
                                                    >
                                                        <i className="fa-solid fa-pen text-xs"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subCategory.id)}
                                                        className="w-7 h-7 bg-red-100 text-red-600 rounded hover:bg-red-200 transition flex items-center justify-center"
                                                    >
                                                        <i className="fa-solid fa-trash text-xs"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900">
                                {editingCategory
                                    ? 'Edit Category'
                                    : formData.parentId
                                        ? 'Add Subcategory'
                                        : 'Add Main Category'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {formData.parentId && !editingCategory && (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Parent Category</div>
                                    <div className="font-bold text-blue-900">
                                        {categories.find(c => c.id === formData.parentId)?.name}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                                    placeholder="e.g., Food & Dining"
                                />
                            </div>

                            {!formData.parentId && !editingCategory && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Parent Category (Optional)
                                    </label>
                                    <select
                                        value={formData.parentId || ''}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                                    >
                                        <option value="">None (Main Category)</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

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
                                    {editingCategory ? 'Update' : 'Add'} Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
