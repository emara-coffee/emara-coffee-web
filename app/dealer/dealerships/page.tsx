"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getMyProductRequests, cancelDealershipRequest } from '@/api/dealer/requests';
import { Building2, Search, XCircle, CheckCircle, Clock, ShieldAlert, Trash2, ChevronLeft, ChevronRight, PackageSearch, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DealerDealershipsPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [requests, setRequests] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dealer/dealerships');
      return;
    }
    fetchRequests();
  }, [isAuthenticated, router, page, searchQuery, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await getMyProductRequests(params);
      setRequests(res.data?.data || []);
      setMeta(res.data?.meta || { currentPage: 1, totalPages: 1, totalCount: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (productId: string) => {
    if (!confirm('Are you sure you want to cancel this dealership request?')) return;
    try {
      await cancelDealershipRequest(productId);
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
            <Building2 className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Dealerships</h1>
            <p className="text-slate-500 text-sm mt-1">Track the status of your product dealership requests</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium text-slate-700"
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
                <th className="p-6">Product Details</th>
                <th className="p-6">Requested Date</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400">Loading requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500">
                    <PackageSearch className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-slate-900">No requests found</p>
                    <p className="text-sm">Browse the products catalog to request dealerships.</p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={req.productId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-6">
                      <p className="font-bold text-slate-900">{req.name}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">SKU: {req.sku}</p>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                          req.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                            req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' :
                              'bg-slate-100 text-slate-700'
                        }`}>
                        {req.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                        {req.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {req.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {req.status === 'REVOKED' && <ShieldAlert className="w-3 h-3" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      {req.status === 'PENDING' ? (
                        <button
                          onClick={() => handleCancelRequest(req.productId)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors border border-rose-100 hover:border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Cancel Request
                        </button>
                      ) : req.status === 'APPROVED' ? (
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-xs font-bold text-emerald-600">Active Dealer</span>
                          <Link
                            href={`/dealer/products/${req.productId}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold transition-colors border border-green-100 hover:border-green-200"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Shop
                          </Link>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">Locked</span>
                      )}
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.currentPage === meta.totalPages} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}