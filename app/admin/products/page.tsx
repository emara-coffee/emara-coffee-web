"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, X, Package, AlertCircle,
  RefreshCw, ChevronLeft, ChevronRight, Image as ImageIcon,
  MessageSquare, Star, Code, Shield, PlusCircle, Settings2
} from 'lucide-react';
import {
  getPaginatedProducts,
  createProduct,
  updateProductBaseDetails,
  updateProductCompatibilities,
  updateProductStatus,
  hardDeleteProduct,
  getProductReviews,
  toggleProductReviewStatus
} from '@/api/admin/products';
import { getPaginatedCategories } from '@/api/admin/categories';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT_BASE' | 'COMPATIBILITY'>('CREATE');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', sku: '', hsnCode: '', categoryId: '', description: '',
    basePrice: '', moq: '1', stock: '0', warrantyInfo: ''
  });

  const [certificationsList, setCertificationsList] = useState<{ id: string; value: string }[]>([]);
  const [specsList, setSpecsList] = useState<{ id: string; key: string; value: string }[]>([]);
  const [bulkPricingList, setBulkPricingList] = useState<{ id: string; qty: string; discount: string }[]>([]);
  const [compatibilities, setCompatibilities] = useState<Record<string, string>>({});

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsMeta, setReviewsMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getPaginatedCategories({ limit: 100, status: 'ACTIVE' });
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.categoryId = categoryFilter;

      const res = await getPaginatedProducts(params);
      setProducts(res.data?.data || []);
      setMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage, limit: 10 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(page), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, categoryFilter, page]);

  const handleOpenModal = (mode: 'CREATE' | 'EDIT_BASE' | 'COMPATIBILITY', product?: any) => {
    setModalMode(mode);
    setError('');
    setImageFiles([]);

    if (product) {
      setSelectedProduct(product);
      if (mode === 'EDIT_BASE') {
        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          hsnCode: product.hsnCode || '',
          categoryId: product.categoryId || '',
          description: product.description || '',
          basePrice: product.basePrice?.toString() || '',
          moq: product.moq?.toString() || '1',
          stock: product.stock?.toString() || '0',
          warrantyInfo: product.warrantyInfo || ''
        });

        const certs = product.certifications || [];
        setCertificationsList(certs.map((c: string) => ({ id: Math.random().toString(), value: c })));

        const specs = product.specifications || {};
        setSpecsList(Object.entries(specs).map(([k, v]) => ({ id: Math.random().toString(), key: k, value: v as string })));

        const bulk = product.bulkPricing || {};
        setBulkPricingList(Object.entries(bulk).map(([k, v]) => ({ id: Math.random().toString(), qty: k, discount: v as string })));
      } else if (mode === 'COMPATIBILITY') {
        setCompatibilities(product.compatibilities || {});
      }
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '', sku: '', hsnCode: '', categoryId: '', description: '',
        basePrice: '', moq: '1', stock: '0', warrantyInfo: ''
      });
      setCertificationsList([]);
      setSpecsList([]);
      setBulkPricingList([]);
      setCompatibilities({});
    }
    setIsModalOpen(true);
  };

  const formatListToObject = (list: { key: string; value: string }[]) => {
    return list.reduce((acc, curr) => {
      if (curr.key.trim() && curr.value.trim()) {
        acc[curr.key.trim()] = curr.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);
  };

  const formatBulkPricing = (list: { qty: string; discount: string }[]) => {
    return list.reduce((acc, curr) => {
      if (curr.qty.trim() && curr.discount.trim()) {
        acc[curr.qty.trim()] = parseFloat(curr.discount.trim()) || 0;
      }
      return acc;
    }, {} as Record<string, number>);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const certifications = certificationsList.map(c => c.value.trim()).filter(Boolean);
      const specifications = formatListToObject(specsList);
      const bulkPricing = formatBulkPricing(bulkPricingList);

      if (modalMode === 'CREATE') {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        data.append('certifications', JSON.stringify(certifications));
        data.append('specifications', JSON.stringify(specifications));
        data.append('bulkPricing', JSON.stringify(bulkPricing));
        data.append('compatibilities', JSON.stringify(compatibilities));
        imageFiles.forEach(file => data.append('images', file));
        await createProduct(data);
      } else if (modalMode === 'EDIT_BASE') {
        await updateProductBaseDetails(selectedProduct.id, {
          name: formData.name,
          sku: formData.sku,
          hsnCode: formData.hsnCode,
          categoryId: formData.categoryId,
          description: formData.description,
          basePrice: parseFloat(formData.basePrice),
          moq: parseInt(formData.moq),
          stock: parseInt(formData.stock),
          warrantyInfo: formData.warrantyInfo,
          certifications,
          specifications,
          bulkPricing
        });
      } else if (modalMode === 'COMPATIBILITY') {
        await updateProductCompatibilities(selectedProduct.id, {
          compatibilities
        });
      }
      setIsModalOpen(false);
      fetchProducts(meta.currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while saving');
    } finally {
      setFormLoading(false);
    }
  };

  const handleProductStatusChange = async (id: string, status: string) => {
    try {
      await updateProductStatus(id, { status });
      fetchProducts(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product? This action cannot be undone and will fail if the product has order history.')) return;
    try {
      await hardDeleteProduct(id);
      fetchProducts(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setImageFiles(files);
    }
  };

  const fetchReviews = async (productId: string, currentPage = 1) => {
    try {
      setReviewsLoading(true);
      const res = await getProductReviews(productId, { page: currentPage, limit: 10 });
      setReviews(res.data?.data || []);
      setReviewsMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage, limit: 10 });
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleOpenReviews = (product: any) => {
    setSelectedProduct(product);
    setIsReviewsModalOpen(true);
    fetchReviews(product.id, 1);
  };

  const handleReviewStatusToggle = async (reviewId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      await toggleProductReviewStatus(reviewId, { status: newStatus });
      fetchReviews(selectedProduct.id, reviewsMeta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update review status');
    }
  };

  const activeCategoryId = modalMode === 'CREATE' || modalMode === 'EDIT_BASE' ? formData.categoryId : selectedProduct?.categoryId;
  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeBlueprintFilters = activeCategory?.searchBlueprint?.filters || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <Package className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Inventory Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage catalog, pricing, and product configurations</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal('CREATE')}
          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
        >
          <Plus className="w-5 h-5" /> New Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or HSN Code..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-slate-700 min-w-[200px]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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
                <th className="p-6">Product Details</th>
                <th className="p-6">Pricing & Stock</th>
                <th className="p-6">Category</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                        <div><div className="h-4 bg-slate-200 rounded w-48 mb-2"></div><div className="h-3 bg-slate-100 rounded w-32"></div></div>
                      </div>
                    </td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-24 mb-2"></div><div className="h-3 bg-slate-100 rounded w-16"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-6"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="p-6"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg text-slate-900 mb-1">No products found</p>
                    <p>Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden relative p-2">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs" title={product.name}>{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">SKU: {product.sku}</span>
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                              <Star className="w-3 h-3 fill-current" /> {product.averageRating?.toFixed(1) || '0.0'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-slate-900">${(product.basePrice || 0).toLocaleString()}</span>
                        <span className={`text-xs font-bold ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {product.stock} in stock
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-medium text-slate-700">
                      {product.categoryName || '—'}
                    </td>
                    <td className="p-6">
                      <select
                        value={product.status}
                        onChange={(e) => handleProductStatusChange(product.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer border ${product.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          product.status === 'DISABLED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            product.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DISABLED">DISABLED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                        <option value="DELETED">DELETED</option>
                      </select>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenReviews(product)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
                          title="View Reviews"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {product.reviewCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                              {product.reviewCount}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenModal('COMPATIBILITY', product)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Compatibility Matrix"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal('EDIT_BASE', product)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Base Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleHardDelete(product.id)}
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

        {meta.totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm font-medium text-slate-500">
              Showing page {meta.currentPage} of {meta.totalPages} ({meta.totalCount} total products)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={meta.currentPage === meta.totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-white rounded-3xl shadow-2xl w-full ${modalMode === 'CREATE' ? 'max-w-5xl' : 'max-w-4xl'} overflow-hidden max-h-[95vh] flex flex-col my-4`}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0 sticky top-0 z-20">
                <h2 className="text-xl font-black text-slate-900">
                  {modalMode === 'CREATE' ? 'Create New Product' :
                    modalMode === 'EDIT_BASE' ? 'Edit Product Details' :
                      'Configure Compatibility Matrix'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {error && (
                  <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm font-medium flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form id="productForm" onSubmit={handleSubmit} className="space-y-10">
                  {(modalMode === 'CREATE' || modalMode === 'EDIT_BASE') && (
                    <>
                      <div className="space-y-5">
                        <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                          <Package className="w-5 h-5 text-green-500" /> Basic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">SKU</label>
                            <input required type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                            <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                              <option value="">Select Category</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Base Price ($)</label>
                            <input required type="number" step="0.01" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Stock</label>
                            <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">MOQ</label>
                            <input required type="number" min="1" value={formData.moq} onChange={e => setFormData({ ...formData, moq: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">HSN Code</label>
                            <input required type="text" value={formData.hsnCode} onChange={e => setFormData({ ...formData, hsnCode: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                          <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none" />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Warranty Info</label>
                          <input type="text" value={formData.warrantyInfo} onChange={e => setFormData({ ...formData, warrantyInfo: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-2">Specifications & Details</h3>

                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-slate-700">Product Specifications</label>
                          {specsList.map((spec) => (
                            <div key={spec.id} className="flex items-center gap-3">
                              <input type="text" placeholder="Feature (e.g. Weight)" value={spec.key} onChange={e => setSpecsList(specsList.map(s => s.id === spec.id ? { ...s, key: e.target.value } : s))} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
                              <input type="text" placeholder="Value (e.g. 10kg)" value={spec.value} onChange={e => setSpecsList(specsList.map(s => s.id === spec.id ? { ...s, value: e.target.value } : s))} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
                              <button type="button" onClick={() => setSpecsList(specsList.filter(s => s.id !== spec.id))} className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => setSpecsList([...specsList, { id: Math.random().toString(), key: '', value: '' }])} className="text-sm font-bold text-green-600 flex items-center gap-1 hover:text-green-700"><PlusCircle className="w-4 h-4" /> Add Specification</button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                          <label className="block text-sm font-bold text-slate-700">Certifications</label>
                          {certificationsList.map((cert) => (
                            <div key={cert.id} className="flex items-center gap-3">
                              <input type="text" placeholder="Certification Standard (e.g. ISO 9001)" value={cert.value} onChange={e => setCertificationsList(certificationsList.map(c => c.id === cert.id ? { ...c, value: e.target.value } : c))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
                              <button type="button" onClick={() => setCertificationsList(certificationsList.filter(c => c.id !== cert.id))} className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => setCertificationsList([...certificationsList, { id: Math.random().toString(), value: '' }])} className="text-sm font-bold text-green-600 flex items-center gap-1 hover:text-green-700"><PlusCircle className="w-4 h-4" /> Add Certification</button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                          <label className="block text-sm font-bold text-slate-700">Bulk Pricing Discounts</label>
                          {bulkPricingList.map((bp) => (
                            <div key={bp.id} className="flex items-center gap-3">
                              <input type="number" placeholder="Min Quantity (e.g. 50)" value={bp.qty} onChange={e => setBulkPricingList(bulkPricingList.map(b => b.id === bp.id ? { ...b, qty: e.target.value } : b))} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
                              <input type="number" step="0.1" placeholder="Discount % (e.g. 10.5)" value={bp.discount} onChange={e => setBulkPricingList(bulkPricingList.map(b => b.id === bp.id ? { ...b, discount: e.target.value } : b))} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
                              <button type="button" onClick={() => setBulkPricingList(bulkPricingList.filter(b => b.id !== bp.id))} className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => setBulkPricingList([...bulkPricingList, { id: Math.random().toString(), qty: '', discount: '' }])} className="text-sm font-bold text-green-600 flex items-center gap-1 hover:text-green-700"><PlusCircle className="w-4 h-4" /> Add Bulk Pricing Tier</button>
                        </div>
                      </div>

                      {modalMode === 'CREATE' && (
                        <div className="pt-6 border-t border-slate-100">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Product Images (Max 5)</label>
                          <input multiple type="file" accept="image/*" onChange={handleImageFiles} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 transition-colors cursor-pointer" />
                        </div>
                      )}
                    </>
                  )}

                  {(modalMode === 'CREATE' || modalMode === 'COMPATIBILITY') && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                          <Settings2 className="w-5 h-5 text-emerald-500" /> Compatibility Matrix
                        </h3>
                      </div>

                      {!activeCategoryId ? (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                          <p className="text-sm font-medium text-slate-500">Please select a category first to view its compatibility blueprint.</p>
                        </div>
                      ) : activeBlueprintFilters.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                          <p className="text-sm font-medium text-slate-500">The selected category does not have a search blueprint defined.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          {activeBlueprintFilters.map((filter: any, idx: number) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {filter.label}
                              </label>
                              <select
                                value={compatibilities[filter.label] || ''}
                                onChange={(e) => setCompatibilities({ ...compatibilities, [filter.label]: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-800 cursor-pointer"
                              >
                                <option value="">Select Option</option>
                                {filter.options?.map((opt: string, optIdx: number) => (
                                  <option key={optIdx} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0 sticky bottom-0 z-20">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Cancel
                </button>
                <button type="submit" form="productForm" disabled={formLoading} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50">
                  {formLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReviewsModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-500" /> Product Reviews
                  </h2>
                  <p className="text-sm text-slate-500 font-medium truncate max-w-md mt-1">{selectedProduct.name}</p>
                </div>
                <button onClick={() => setIsReviewsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-0 overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="bg-slate-50/90 backdrop-blur border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                      <th className="p-4 pl-6">Reviewer</th>
                      <th className="p-4">Rating & Comment</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reviewsLoading ? (
                      <tr><td colSpan={3} className="p-12 text-center text-slate-400">Loading reviews...</td></tr>
                    ) : reviews.length === 0 ? (
                      <tr><td colSpan={3} className="p-12 text-center text-slate-400">No reviews found.</td></tr>
                    ) : (
                      reviews.map(review => (
                        <tr key={review.id} className="hover:bg-slate-50/50">
                          <td className="p-4 pl-6">
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{review.userEmail}</p>
                            <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-amber-500 mb-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap max-w-md">{review.comment || '—'}</p>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleReviewStatusToggle(review.id, review.status)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${review.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                            >
                              {review.status}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {reviewsMeta.totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                  <p className="text-xs font-medium text-slate-500">
                    Page {reviewsMeta.currentPage} of {reviewsMeta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchReviews(selectedProduct.id, Math.max(1, reviewsMeta.currentPage - 1))}
                      disabled={reviewsMeta.currentPage === 1}
                      className="p-1.5 border border-slate-200 rounded-md hover:bg-white disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => fetchReviews(selectedProduct.id, Math.min(reviewsMeta.totalPages, reviewsMeta.currentPage + 1))}
                      disabled={reviewsMeta.currentPage === reviewsMeta.totalPages}
                      className="p-1.5 border border-slate-200 rounded-md hover:bg-white disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}