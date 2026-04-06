"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, X, FileText, AlertCircle,
  RefreshCw, ChevronLeft, ChevronRight, Image as ImageIcon,
  MessageSquare, User
} from 'lucide-react';
import {
  getPaginatedArticles,
  createArticle,
  updateArticle,
  updateArticleStatus,
  getArticleComments,
  toggleArticleCommentStatus,
  deleteArticleComment
} from '@/api/admin/articles';
import { getPaginatedArticleCategories } from '@/api/admin/articleCategories';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '', slug: '', content: '', status: 'DRAFT', categoryIds: [] as string[]
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsMeta, setCommentsMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [commentsLoading, setCommentsLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getPaginatedArticleCategories({ limit: 100 });
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchArticles = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await getPaginatedArticles(params);
      setArticles(res.data?.data || []);
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
    const timer = setTimeout(() => fetchArticles(page), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, page]);

  const handleOpenModal = (mode: 'CREATE' | 'EDIT', article?: any) => {
    setModalMode(mode);
    setError('');
    setThumbnailFile(null);
    setSupportingFiles([]);

    if (article) {
      setSelectedArticle(article);
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        content: article.content || '',
        status: article.status || 'DRAFT',
        categoryIds: article.categories?.map((c: any) => c.categoryId) || []
      });
    } else {
      setSelectedArticle(null);
      setFormData({ title: '', slug: '', content: '', status: 'DRAFT', categoryIds: [] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (modalMode === 'CREATE') {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('slug', formData.slug);
        data.append('content', formData.content);
        data.append('status', formData.status);
        data.append('categoryIds', JSON.stringify(formData.categoryIds));

        if (thumbnailFile) {
          data.append('thumbnail', thumbnailFile);
        }
        supportingFiles.forEach(file => {
          data.append('supportingImages', file);
        });

        await createArticle(data);
      } else {
        await updateArticle(selectedArticle.id, {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          status: formData.status,
          categoryIds: formData.categoryIds
        });
      }
      setIsModalOpen(false);
      fetchArticles(meta.currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while saving the article');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSupportFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setSupportingFiles(files);
    }
  };

  const handleArticleStatusChange = async (id: string, status: string) => {
    try {
      await updateArticleStatus(id, { status });
      fetchArticles(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update article status');
    }
  };

  const fetchComments = async (articleId: string, currentPage = 1) => {
    try {
      setCommentsLoading(true);
      const res = await getArticleComments(articleId, { page: currentPage, limit: 10 });
      setComments(res.data?.data || []);
      setCommentsMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage, limit: 10 });
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleOpenComments = (article: any) => {
    setSelectedArticle(article);
    setIsCommentsModalOpen(true);
    fetchComments(article.id, 1);
  };

  const handleCommentStatusToggle = async (commentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      await toggleArticleCommentStatus(commentId, { status: newStatus });
      fetchComments(selectedArticle.id, commentsMeta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update comment status');
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('Permanently delete this comment?')) return;
    try {
      await deleteArticleComment(commentId);
      fetchComments(selectedArticle.id, commentsMeta.currentPage);
      fetchArticles(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <FileText className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Articles Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage blog posts, content, and publications</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal('CREATE')}
          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
        >
          <Plus className="w-5 h-5" /> New Article
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles by title or slug..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-6">Article Details</th>
                <th className="p-6">Metrics</th>
                <th className="p-6">Status</th>
                <th className="p-6">Published Date</th>
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
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-6"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-6"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg text-slate-900 mb-1">No articles found</p>
                    <p>Try adjusting your search or create a new article.</p>
                  </td>
                </tr>
              ) : (
                articles.map((article, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={article.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden relative">
                          {article.thumbnailUrl ? (
                            <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs">{article.title}</p>
                          <p className="text-xs font-medium text-slate-500 font-mono truncate max-w-xs">/{article.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1 text-xs font-bold text-slate-600">
                        <span>👁 {article.viewsCount || 0} Views</span>
                        <span>❤️ {article.likesCount || 0} Likes</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <select
                        value={article.status}
                        onChange={(e) => handleArticleStatusChange(article.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer border ${article.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            article.status === 'DRAFT' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </td>
                    <td className="p-6 text-sm font-medium text-slate-600">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenComments(article)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
                          title="View Comments"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {article.commentCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                              {article.commentCount}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenModal('EDIT', article)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4" />
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
              Showing page {meta.currentPage} of {meta.totalPages} ({meta.totalCount} total articles)
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <h2 className="text-xl font-black text-slate-900">
                  {modalMode === 'CREATE' ? 'Create New Article' : 'Edit Article'}
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

                <form id="articleForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Slug</label>
                      <input
                        required
                        type="text"
                        value={formData.slug}
                        onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Content (Markdown Supported)</label>
                    <textarea
                      required
                      rows={12}
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none font-mono text-sm leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Categories</label>
                      <select
                        multiple
                        value={formData.categoryIds}
                        onChange={e => setFormData({ ...formData, categoryIds: Array.from(e.target.selectedOptions, option => option.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none min-h-[120px]"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id} className="py-1">{cat.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-2">Hold Ctrl/Cmd to select multiple categories.</p>
                    </div>
                  </div>

                  {modalMode === 'CREATE' && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Media Uploads</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Featured Thumbnail *</label>
                          <input
                            required
                            type="file"
                            accept="image/*"
                            onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 transition-colors cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Supporting Images (Max 3)</label>
                          <input
                            multiple
                            type="file"
                            accept="image/*"
                            onChange={handleSupportFiles}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 transition-colors cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                  form="articleForm"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {formLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Save Article'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCommentsModalOpen && selectedArticle && (
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
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    Comments
                  </h2>
                  <p className="text-sm text-slate-500 font-medium truncate max-w-md mt-1">{selectedArticle.title}</p>
                </div>
                <button onClick={() => setIsCommentsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-0 overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="bg-slate-50/90 backdrop-blur border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                      <th className="p-4 pl-6">User</th>
                      <th className="p-4">Comment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commentsLoading ? (
                      <tr><td colSpan={4} className="p-12 text-center text-slate-400">Loading comments...</td></tr>
                    ) : comments.length === 0 ? (
                      <tr><td colSpan={4} className="p-12 text-center text-slate-400">No comments found.</td></tr>
                    ) : (
                      comments.map(comment => (
                        <tr key={comment.id} className="hover:bg-slate-50/50">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{comment.userEmail}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap max-w-sm">{comment.comment}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleCommentStatusToggle(comment.id, comment.status)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${comment.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                            >
                              {comment.status}
                            </button>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => handleCommentDelete(comment.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Comment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {commentsMeta.totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                  <p className="text-xs font-medium text-slate-500">
                    Page {commentsMeta.currentPage} of {commentsMeta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchComments(selectedArticle.id, Math.max(1, commentsMeta.currentPage - 1))}
                      disabled={commentsMeta.currentPage === 1}
                      className="p-1.5 border border-slate-200 rounded-md hover:bg-white disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => fetchComments(selectedArticle.id, Math.min(commentsMeta.totalPages, commentsMeta.currentPage + 1))}
                      disabled={commentsMeta.currentPage === commentsMeta.totalPages}
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