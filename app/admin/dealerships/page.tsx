"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Search, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import {
  getAllDealershipRequests,
  updateDealershipStatus
} from '@/api/admin/dealershipApprovals';

export default function AdminDealershipRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);

  const fetchRequests = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await getAllDealershipRequests(params);
      setRequests(res.data?.data || []);
      setMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage, limit: 10 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchRequests(page), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, page]);

  const handleUpdateStatus = async (dealerId: string, productId: string, status: string) => {
    try {
      await updateDealershipStatus(dealerId, productId, { status });
      fetchRequests(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update request status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
          <Building2 className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Product Dealership Requests</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage dealer requests to sell specific products</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by dealer or product name..."
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
            <option value="REJECTED">Rejected</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-6">Dealer Info</th>
                <th className="p-6">Product Details</th>
                <th className="p-6">Request Date</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-6"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="p-6"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg text-slate-900 mb-1">No requests found</p>
                    <p>No dealership requests match the current filters.</p>
                  </td>
                </tr>
              ) : (
                requests.map((req, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={`${req.dealerId}-${req.productId}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-6">
                      {/* Fixed: Mapping businessName directly as provided by backend */}
                      <p className="font-bold text-slate-900">{req.businessName || 'Unknown Dealer'}</p>
                    </td>
                    <td className="p-6">
                      {/* Fixed: Mapping productName and sku correctly */}
                      <p className="text-sm font-bold text-slate-900">{req.productName || 'Unknown Product'}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">{req.sku}</p>
                    </td>
                    <td className="p-6 text-sm font-medium text-slate-600">
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                          req.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                        }`}>
                        {req.status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> :
                          req.status === 'PENDING' ? <Clock className="w-3 h-3" /> :
                            <XCircle className="w-3 h-3" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(req.dealerId, req.productId, 'APPROVED')}
                              className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.dealerId, req.productId, 'REJECTED')}
                              className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : req.status === 'APPROVED' ? (
                          <button
                            onClick={() => handleUpdateStatus(req.dealerId, req.productId, 'REVOKED')}
                            className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            Revoke Access
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(req.dealerId, req.productId, 'APPROVED')}
                            className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            Re-Approve
                          </button>
                        )}
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
              Showing page {meta.currentPage} of {meta.totalPages}
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
    </div>
  );
}