"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Shield, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { getPaginatedTerms, createTerm, updateTerm, activateTerm, deleteTerm } from '@/api/admin/terms';

export default function AdminTermsPage() {
  const [terms, setTerms] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedTerm, setSelectedTerm] = useState<any>(null);

  const [formData, setFormData] = useState({ version: '', title: '', content: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTerms = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;

      const res = await getPaginatedTerms(params);
      setTerms(res.data?.data || []);
      setMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage, limit: 10 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchTerms(page), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, page]);

  const handleOpenModal = (mode: 'CREATE' | 'EDIT', term?: any) => {
    setModalMode(mode);
    setError('');
    if (term) {
      setSelectedTerm(term);
      setFormData({ version: term.version, title: term.title, content: term.content });
    } else {
      setSelectedTerm(null);
      setFormData({ version: '', title: '', content: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (modalMode === 'CREATE') {
        await createTerm(formData);
      } else {
        await updateTerm(selectedTerm.id, formData);
      }
      setIsModalOpen(false);
      fetchTerms(meta.currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving terms');
    } finally {
      setFormLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm('Set this version as active? It will replace the currently active terms.')) return;
    try {
      await activateTerm(id);
      fetchTerms(meta.currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, isActive: boolean) => {
    if (isActive) {
      alert("You cannot delete the active terms version. Set another version active first.");
      return;
    }
    if (!confirm('Permanently delete this terms version?')) return;
    try {
      await deleteTerm(id);
      fetchTerms(meta.currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Terms & Conditions</h1>
            <p className="text-slate-500 text-sm mt-1">Manage legal document versions</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal('CREATE')}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-5 h-5" /> New Version
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by version or title..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-6">Version</th>
                <th className="p-6">Title</th>
                <th className="p-6">Status</th>
                <th className="p-6">Created</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="p-6"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-6"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : terms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg text-slate-900 mb-1">No versions found</p>
                  </td>
                </tr>
              ) : (
                terms.map((term, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={term.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-6 font-mono font-bold text-slate-900">{term.version}</td>
                    <td className="p-6 font-bold text-slate-700">{term.title}</td>
                    <td className="p-6">
                      {term.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-bold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-sm font-medium text-slate-500">
                      {new Date(term.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2">
                        {!term.isActive && (
                          <button
                            onClick={() => handleActivate(term.id)}
                            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal('EDIT', term)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(term.id, term.isActive)}
                          disabled={term.isActive}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
              Page {meta.currentPage} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={meta.currentPage === meta.totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <h2 className="text-xl font-black text-slate-900">
                  {modalMode === 'CREATE' ? 'Create New Version' : 'Edit Version'}
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

                <form id="termForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Version Number</label>
                      <input
                        required
                        type="text"
                        placeholder="v1.0.0"
                        value={formData.version}
                        onChange={e => setFormData({ ...formData, version: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Document Title</label>
                      <input
                        required
                        type="text"
                        placeholder="Terms of Service"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Markdown Content</label>
                    <textarea
                      required
                      rows={15}
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none resize-none font-mono text-sm leading-relaxed"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="termForm"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {formLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Save Version'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}