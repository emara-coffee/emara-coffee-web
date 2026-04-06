"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setTargetChatUser } from '@/store/slices/chatSlice';
import {
  Building2, Search, FileCheck, ShieldAlert, Plus, X,
  CheckCircle, XCircle, FileText, AlertCircle, RefreshCw,
  Edit2, Trash2, Link as LinkIcon, ChevronLeft, ChevronRight, MessageSquare, Boxes
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getPaginatedDealers,
  getDealerComplianceDetails,
  reviewDealerSubmission,
  updateDealerSuspensionStatus,
  getVerificationBlueprints,
  createVerificationBlueprint,
  updateVerificationBlueprint,
  toggleBlueprintStatus,
  hardDeleteBlueprint
} from '@/api/admin/dealerManagement';
import { initializeChat } from '@/api/shared/chat';

export default function AdminDealersPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'dealers' | 'blueprints'>('dealers');

  const [dealers, setDealers] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [blueprintsLoading, setBlueprintsLoading] = useState(false);

  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [complianceLoading, setComplianceLoading] = useState(false);

  // NEW: State to handle document previews
  const [previewSubmission, setPreviewSubmission] = useState<{ url: string, type: 'IMAGE' | 'PDF' | 'OTHER', reqName: string } | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusFormData, setStatusFormData] = useState({ status: 'APPROVED', reason: '' });
  const [statusLoading, setStatusLoading] = useState(false);

  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [blueprintModalMode, setBlueprintModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedBlueprint, setSelectedBlueprint] = useState<any>(null);
  const [blueprintFormData, setBlueprintFormData] = useState({
    name: '', description: '', type: 'FILE', isRequired: true
  });
  const [blueprintFormLoading, setBlueprintFormLoading] = useState(false);

  const [error, setError] = useState('');

  const fetchDealers = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await getPaginatedDealers(params);
      setDealers(res.data?.data || []);
      setMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage, limit: 10 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlueprints = async () => {
    try {
      setBlueprintsLoading(true);
      const res = await getVerificationBlueprints();
      setBlueprints(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBlueprintsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dealers') {
      const timer = setTimeout(() => fetchDealers(page), 500);
      return () => clearTimeout(timer);
    } else {
      fetchBlueprints();
    }
  }, [activeTab, searchQuery, statusFilter, page]);

  const handleOpenCompliance = async (dealer: any) => {
    setSelectedDealer(dealer);
    setIsComplianceModalOpen(true);
    setPreviewSubmission(null); // Reset preview on open
    setComplianceLoading(true);
    setError('');
    try {
      const res = await getDealerComplianceDetails(dealer.id);
      setComplianceData(res.data?.complianceRequirements || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch compliance details');
    } finally {
      setComplianceLoading(false);
    }
  };

  const handleCloseCompliance = () => {
    setIsComplianceModalOpen(false);
    setTimeout(() => setPreviewSubmission(null), 300); // Wait for animation
  };

  const handleOpenPreview = (url: string, name: string) => {
    const lowerUrl = url.toLowerCase();
    // Basic heuristic to guess file type from URL
    const isPdf = lowerUrl.includes('.pdf');
    const isImage = lowerUrl.match(/\.(jpeg|jpg|gif|png|webp)/);
    setPreviewSubmission({
      url,
      type: isPdf ? 'PDF' : isImage ? 'IMAGE' : 'OTHER',
      reqName: name
    });
  };

  const handleReviewSubmission = async (submissionId: string, status: string, adminRemarks: string) => {
    try {
      await reviewDealerSubmission(submissionId, { status, adminRemarks });
      const res = await getDealerComplianceDetails(selectedDealer.id);
      setComplianceData(res.data?.complianceRequirements || []);
      fetchDealers(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to review submission');
    }
  };

  const handleOpenStatus = (dealer: any) => {
    setSelectedDealer(dealer);
    setStatusFormData({ status: dealer.status === 'APPROVED' ? 'SUSPENDED_FULL' : 'APPROVED', reason: '' });
    setIsStatusModalOpen(true);
    setError('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusLoading(true);
    setError('');
    try {
      await updateDealerSuspensionStatus(selectedDealer.id, statusFormData);
      setIsStatusModalOpen(false);
      fetchDealers(meta.currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenBlueprintModal = (mode: 'CREATE' | 'EDIT', blueprint?: any) => {
    setBlueprintModalMode(mode);
    setError('');
    if (blueprint) {
      setSelectedBlueprint(blueprint);
      setBlueprintFormData({
        name: blueprint.name,
        description: blueprint.description || '',
        type: blueprint.type,
        isRequired: blueprint.isRequired
      });
    } else {
      setSelectedBlueprint(null);
      setBlueprintFormData({ name: '', description: '', type: 'FILE', isRequired: true });
    }
    setIsBlueprintModalOpen(true);
  };

  const handleSubmitBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlueprintFormLoading(true);
    setError('');
    try {
      if (blueprintModalMode === 'CREATE') {
        await createVerificationBlueprint(blueprintFormData);
      } else {
        await updateVerificationBlueprint(selectedBlueprint.id, blueprintFormData);
      }
      setIsBlueprintModalOpen(false);
      fetchBlueprints();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save blueprint');
    } finally {
      setBlueprintFormLoading(false);
    }
  };

  const handleToggleBlueprintStatus = async (id: string, status: string) => {
    try {
      await toggleBlueprintStatus(id, { status });
      fetchBlueprints();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteBlueprint = async (id: string) => {
    if (!confirm('Hard delete this blueprint? Fails if data exists.')) return;
    try {
      await hardDeleteBlueprint(id);
      fetchBlueprints();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete blueprint');
    }
  };

  const handleStartChat = async (dealer: any) => {
    try {
      const res = await initializeChat({ targetUserId: dealer.userId });
      dispatch(setTargetChatUser(res.data));
      router.push('/admin/chat');
    } catch (err) {
      alert('Failed to initialize conversation');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('dealers')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'dealers' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Building2 className="w-4 h-4" /> Dealers
          </button>
          <button
            onClick={() => setActiveTab('blueprints')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'blueprints' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <FileCheck className="w-4 h-4" /> Verification Blueprints
          </button>
        </div>

        {activeTab === 'blueprints' && (
          <button
            onClick={() => handleOpenBlueprintModal('CREATE')}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
          >
            <Plus className="w-5 h-5" /> New Blueprint
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dealers' && (
          <motion.div
            key="dealers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dealers by name..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="SUSPENDED_FULL">Suspended (Full)</option>
                <option value="SUSPENDED_PURCHASES">Suspended (Purchases)</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-6">Business Info</th>
                    <th className="p-6">Contact</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-400">Loading...</td></tr>
                  ) : dealers.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-400">No dealers found.</td></tr>
                  ) : (
                    dealers.map((dealer) => (
                      <tr key={dealer.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-6">
                          <p className="font-bold text-slate-900">{dealer.businessName}</p>
                          <p className="text-xs text-slate-500 mt-1">Joined: {new Date(dealer.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-6">
                          <p className="text-sm font-bold text-slate-700">{dealer.contactPerson}</p>
                          <p className="text-xs text-slate-500 mt-1">{dealer.email}</p>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${dealer.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                              dealer.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                                'bg-rose-50 text-rose-700'
                            }`}>
                            {dealer.status}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => router.push(`/admin/dealers/inventory?dealerId=${dealer.id}&dealerName=${encodeURIComponent(dealer.businessName)}`)}
                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors mr-2"
                            title="Check Inventory"
                          >
                            <Boxes className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleStartChat(dealer)}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors mr-2"
                            title="Message Dealer"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenCompliance(dealer)}
                            className="p-2 text-slate-400 hover:text-green-600 transition-colors mr-2"
                            title="Review Compliance"
                          >
                            <FileCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenStatus(dealer)}
                            className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                            title="Manage Suspension/Status"
                          >
                            <ShieldAlert className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {meta.totalPages > 1 && (
              <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <p className="text-sm font-medium text-slate-500">
                  Showing page {meta.currentPage} of {meta.totalPages}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.currentPage === meta.totalPages} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'blueprints' && (
          <motion.div
            key="blueprints"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-6">Requirement Name</th>
                    <th className="p-6">Type</th>
                    <th className="p-6">Necessity</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {blueprintsLoading ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">Loading...</td></tr>
                  ) : blueprints.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">No blueprints configured.</td></tr>
                  ) : (
                    blueprints.map((bp) => (
                      <tr key={bp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-6">
                          <p className="font-bold text-slate-900">{bp.name}</p>
                          <p className="text-xs text-slate-500 mt-1 truncate max-w-sm">{bp.description}</p>
                        </td>
                        <td className="p-6 text-sm font-bold text-slate-700">{bp.type}</td>
                        <td className="p-6">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${bp.isRequired ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                            {bp.isRequired ? 'REQUIRED' : 'OPTIONAL'}
                          </span>
                        </td>
                        <td className="p-6">
                          <select
                            value={bp.status}
                            onChange={(e) => handleToggleBlueprintStatus(bp.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer border ${bp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DISABLED">DISABLED</option>
                          </select>
                        </td>
                        <td className="p-6 text-right">
                          <button onClick={() => handleOpenBlueprintModal('EDIT', bp)} className="p-2 text-slate-400 hover:text-green-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteBlueprint(bp.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComplianceModalOpen && selectedDealer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0 z-20">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Dealer Compliance Review</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">{selectedDealer.businessName}</p>
                </div>
                <button onClick={handleCloseCompliance} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full shadow-sm border border-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-0 flex-1 relative overflow-hidden flex">
                <AnimatePresence mode="wait">
                  {previewSubmission ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="absolute inset-0 bg-white p-6 flex flex-col z-10"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <button
                          onClick={() => setPreviewSubmission(null)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> Back to Submissions
                        </button>
                        <h3 className="font-black text-slate-900">{previewSubmission.reqName} Document</h3>
                      </div>

                      <div className="flex-1 bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden relative flex items-center justify-center p-4">
                        {previewSubmission.type === 'IMAGE' ? (
                          <img src={previewSubmission.url} alt="Document Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                        ) : previewSubmission.type === 'PDF' ? (
                          <iframe src={previewSubmission.url} className="w-full h-full rounded-lg bg-white" title="PDF Document" />
                        ) : (
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600 font-medium mb-4">Preview not available for this file format.</p>
                            <a
                              href={previewSubmission.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-600 transition-colors"
                            >
                              <LinkIcon className="w-4 h-4" /> Open File Externally
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="absolute inset-0 overflow-y-auto bg-white"
                    >
                      {error && <div className="m-6 p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium">{error}</div>}

                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white shadow-sm z-10">
                          <tr className="bg-slate-50/90 backdrop-blur border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                            <th className="p-5 pl-8">Requirement</th>
                            <th className="p-5">Submission</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 pr-8">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {complianceLoading ? (
                            <tr><td colSpan={4} className="p-12 text-center text-slate-400">Loading compliance data...</td></tr>
                          ) : complianceData.length === 0 ? (
                            <tr><td colSpan={4} className="p-12 text-center text-slate-400">No active blueprints required.</td></tr>
                          ) : (
                            complianceData.map((req, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-5 pl-8 align-top">
                                  <p className="text-sm font-bold text-slate-900">{req.name}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{req.type}</span>
                                    {req.isRequired && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">REQUIRED</span>}
                                  </div>
                                </td>
                                <td className="p-5 align-top">
                                  {!req.submissionId ? (
                                    <span className="text-sm text-slate-400 italic">Not submitted yet</span>
                                  ) : req.type === 'FILE' || req.type === 'URL' ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (req.type === 'URL') {
                                          window.open(req.submittedValue, '_blank');
                                        } else {
                                          handleOpenPreview(req.submittedValue, req.name);
                                        }
                                      }}
                                      className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1.5 p-2 -ml-2 rounded-lg hover:bg-green-50 transition-colors"
                                    >
                                      {req.type === 'FILE' ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                                      {req.type === 'FILE' ? 'Preview Document' : 'Visit Link'}
                                    </button>
                                  ) : (
                                    <span className="text-sm text-slate-700 font-medium">{req.submittedValue}</span>
                                  )}
                                </td>
                                <td className="p-5 align-top">
                                  {!req.submissionId ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">PENDING</span>
                                  ) : (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                          'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}>
                                      {req.status}
                                    </span>
                                  )}
                                  {req.adminRemarks && <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">Remarks: {req.adminRemarks}</p>}
                                </td>
                                <td className="p-5 pr-8 align-top">
                                  {req.submissionId && (
                                    <form onSubmit={(e) => {
                                      e.preventDefault();
                                      const formData = new FormData(e.currentTarget);
                                      handleReviewSubmission(req.submissionId, formData.get('status') as string, formData.get('remarks') as string);
                                    }} className="flex flex-col gap-2 min-w-[200px]">
                                      <div className="flex gap-2">
                                        <select name="status" defaultValue={req.status} className="flex-1 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 outline-none bg-slate-50 hover:bg-white focus:ring-2 focus:ring-green-500/20 transition-all">
                                          <option value="PENDING">PENDING</option>
                                          <option value="APPROVED">APPROVED</option>
                                          <option value="REJECTED">REJECTED</option>
                                        </select>
                                        <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm">
                                          Save
                                        </button>
                                      </div>
                                      <input name="remarks" type="text" placeholder="Remarks (optional)" defaultValue={req.adminRemarks || ''} className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none bg-slate-50 hover:bg-white focus:ring-2 focus:ring-green-500/20 transition-all" />
                                    </form>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStatusModalOpen && selectedDealer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900">Manage Dealer Status</h2>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateStatus} className="p-6 space-y-5">
                {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium">{error}</div>}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">New Status</label>
                  <select value={statusFormData.status} onChange={e => setStatusFormData({ ...statusFormData, status: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="APPROVED">APPROVED (Reactivate)</option>
                    <option value="SUSPENDED_PURCHASES">SUSPEND PURCHASES</option>
                    <option value="SUSPENDED_FULL">FULL SUSPENSION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Reason (Sent to dealer)</label>
                  <textarea required rows={4} value={statusFormData.reason} onChange={e => setStatusFormData({ ...statusFormData, reason: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none" placeholder="Provide a reason for this status change..." />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsStatusModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                  <button type="submit" disabled={statusLoading} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex justify-center items-center disabled:opacity-50">
                    {statusLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBlueprintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900">{blueprintModalMode === 'CREATE' ? 'New Blueprint' : 'Edit Blueprint'}</h2>
                <button onClick={() => setIsBlueprintModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmitBlueprint} className="p-6 space-y-5">
                {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium">{error}</div>}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Requirement Name</label>
                  <input required type="text" value={blueprintFormData.name} onChange={e => setBlueprintFormData({ ...blueprintFormData, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                  <textarea rows={3} value={blueprintFormData.description} onChange={e => setBlueprintFormData({ ...blueprintFormData, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Data Type</label>
                    <select value={blueprintFormData.type} onChange={e => setBlueprintFormData({ ...blueprintFormData, type: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="FILE">FILE</option>
                      <option value="TEXT">TEXT</option>
                      <option value="NUMBER">NUMBER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Necessity</label>
                    <select value={blueprintFormData.isRequired ? 'true' : 'false'} onChange={e => setBlueprintFormData({ ...blueprintFormData, isRequired: e.target.value === 'true' })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="true">REQUIRED</option>
                      <option value="false">OPTIONAL</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsBlueprintModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                  <button type="submit" disabled={blueprintFormLoading} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex justify-center items-center disabled:opacity-50">
                    {blueprintFormLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}