"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Code, Package, Image as ImageIcon, ChevronLeft, ChevronRight, X, AlertCircle, RefreshCw, ArrowUp, ArrowDown, PlusCircle } from 'lucide-react';
import {
  getPaginatedCategories,
  createCategory,
  updateCategoryDetails,
  updateSearchBlueprint,
  updateCategoryStatus,
  hardDeleteCategory
} from '@/api/admin/categories';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'BLUEPRINT'>('CREATE');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [formData, setFormData] = useState({ name: '', slug: '', description: '', imageUrl: '' });

  const [blueprintFilters, setBlueprintFilters] = useState<{ id: string; label: string; options: string }[]>([]);

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await getPaginatedCategories(params);
      setCategories(res.data?.data || []);
      setMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchCategories(1), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const handleOpenModal = (mode: 'CREATE' | 'EDIT' | 'BLUEPRINT', category?: any) => {
    setModalMode(mode);
    setError('');
    if (category) {
      setSelectedCategory(category);
      if (mode === 'EDIT') {
        setFormData({
          name: category.name || '',
          slug: category.slug || '',
          description: category.description || '',
          imageUrl: category.imageUrl || ''
        });
      } else if (mode === 'BLUEPRINT') {
        const existingFilters = category.searchBlueprint?.filters || [];
        setBlueprintFilters(existingFilters.map((f: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          label: f.label || '',
          options: Array.isArray(f.options) ? f.options.join(', ') : ''
        })));
      }
    } else {
      setSelectedCategory(null);
      setFormData({ name: '', slug: '', description: '', imageUrl: '' });
      setBlueprintFilters([]);
    }
    setIsModalOpen(true);
  };

  const addBlueprintFilter = () => {
    setBlueprintFilters([...blueprintFilters, {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      options: ''
    }]);
  };

  const removeBlueprintFilter = (id: string) => {
    setBlueprintFilters(blueprintFilters.filter(f => f.id !== id));
  };

  const updateBlueprintFilter = (id: string, field: string, value: string) => {
    setBlueprintFilters(blueprintFilters.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const moveFilter = (index: number, direction: number) => {
    const newFilters = [...blueprintFilters];
    if (index + direction >= 0 && index + direction < newFilters.length) {
      const temp = newFilters[index];
      newFilters[index] = newFilters[index + direction];
      newFilters[index + direction] = temp;
      setBlueprintFilters(newFilters);
    }
  };

  const formatSearchBlueprint = () => {
    return {
      filters: blueprintFilters.map(f => ({
        label: f.label.trim(),
        options: f.options.split(',').map(o => o.trim()).filter(o => o)
      })).filter(f => f.label)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (modalMode === 'CREATE') {
        await createCategory({ ...formData, searchBlueprint: formatSearchBlueprint() });
      } else if (modalMode === 'EDIT') {
        await updateCategoryDetails(selectedCategory.id, formData);
      } else if (modalMode === 'BLUEPRINT') {
        await updateSearchBlueprint(selectedCategory.id, { searchBlueprint: formatSearchBlueprint() });
      }
      setIsModalOpen(false);
      fetchCategories(meta.currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateCategoryStatus(id, { status });
      fetchCategories(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this category?')) return;
    try {
      await hardDeleteCategory(id);
      fetchCategories(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Categories Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage product categories and search blueprints</p>
        </div>
        <button
          onClick={() => handleOpenModal('CREATE')}
          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
        >
          <Plus className="w-5 h-5" /> New Category
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-6">Category Details</th>
                <th className="p-6">Stats</th>
                <th className="p-6">Status</th>
                <th className="p-6">Created At</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-48 mb-2"></div><div className="h-3 bg-slate-100 rounded w-32"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="p-6"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-6"><div className="h-8 bg-slate-200 rounded w-full"></div></td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg text-slate-900 mb-1">No categories found</p>
                    <p>Try adjusting your search filters</p>
                  </td>
                </tr>
              ) : (
                categories.map((category, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={category.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden relative">
                          {category.imageUrl ? (
                            <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{category.name}</p>
                          <p className="text-xs font-medium text-slate-500">/{category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Package className="w-4 h-4 text-green-500" />
                        {category.productCount || 0} Products
                      </div>
                    </td>
                    <td className="p-6">
                      <select
                        value={category.status}
                        onChange={(e) => handleStatusChange(category.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer border ${category.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            category.status === 'DISABLED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              category.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DISABLED">DISABLED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                        <option value="DELETED">DELETED</option>
                      </select>
                    </td>
                    <td className="p-6 text-sm font-medium text-slate-600">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal('EDIT', category)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal('BLUEPRINT', category)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Configure Filters"
                        >
                          <Code className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hard Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm font-medium text-slate-500">
            Showing page {meta.currentPage} of {meta.totalPages} ({meta.totalCount} total categories)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchCategories(meta.currentPage - 1)}
              disabled={meta.currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => fetchCategories(meta.currentPage + 1)}
              disabled={meta.currentPage === meta.totalPages || meta.totalPages === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-8"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
                <h2 className="text-xl font-black text-slate-900">
                  {modalMode === 'CREATE' ? 'Create New Category' :
                    modalMode === 'EDIT' ? 'Edit Category Details' :
                      'Configure Search Blueprint'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm font-medium flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form id="categoryForm" onSubmit={handleSubmit} className="space-y-8">
                  {(modalMode === 'CREATE' || modalMode === 'EDIT') && (
                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Category Details</h3>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                          <input
                            required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Slug</label>
                          <input
                            required type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                        <input
                          type="url" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea
                          rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {(modalMode === 'CREATE' || modalMode === 'BLUEPRINT') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="text-sm font-bold text-slate-900">Search Filters Pipeline</h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Sequential Order</span>
                      </div>

                      <div className="space-y-3">
                        {blueprintFilters.length === 0 ? (
                          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                            <p className="text-sm font-medium text-slate-500">No search filters defined.</p>
                          </div>
                        ) : (
                          blueprintFilters.map((filter, index) => (
                            <motion.div
                              key={filter.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex gap-5 relative group"
                            >
                              <div className="flex flex-col items-center justify-center gap-2 border-r border-slate-100 pr-5">
                                <button type="button" onClick={() => moveFilter(index, -1)} disabled={index === 0} className="text-slate-300 hover:text-green-500 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors">
                                  <ArrowUp className="w-5 h-5" />
                                </button>
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <button type="button" onClick={() => moveFilter(index, 1)} disabled={index === blueprintFilters.length - 1} className="text-slate-300 hover:text-green-500 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors">
                                  <ArrowDown className="w-5 h-5" />
                                </button>
                              </div>

                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Filter Label</label>
                                  <input
                                    required type="text" value={filter.label} onChange={(e) => updateBlueprintFilter(filter.id, 'label', e.target.value)}
                                    placeholder="e.g., Vehicle Type"
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Options</label>
                                  <input
                                    required type="text" value={filter.options} onChange={(e) => updateBlueprintFilter(filter.id, 'options', e.target.value)}
                                    placeholder="Comma separated (e.g., Car, SUV)"
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                  />
                                </div>
                              </div>

                              <button type="button" onClick={() => removeBlueprintFilter(filter.id)} className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>

                      <button type="button" onClick={addBlueprintFilter} className="w-full py-4 border-2 border-dashed border-green-200 text-green-600 rounded-2xl font-bold hover:bg-green-50 hover:border-green-300 transition-colors flex items-center justify-center gap-2">
                        <PlusCircle className="w-5 h-5" /> Add New Filter Layer
                      </button>
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 sticky bottom-0 z-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Cancel
                </button>
                <button type="submit" form="categoryForm" disabled={formLoading} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50">
                  {formLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}