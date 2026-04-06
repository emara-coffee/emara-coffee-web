"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, PackageSearch, Building2, UserCircle,
  ChevronLeft, ChevronRight, Edit2, RotateCcw,
  Clock, Package, Truck, CheckCircle, XCircle, CreditCard
} from 'lucide-react';
import {
  getAllOrders,
  updateOrderStatus,
  updateRefundStatus
} from '@/api/admin/orderManagement';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [refundFilter, setRefundFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusData, setStatusData] = useState({ status: 'PENDING' });
  const [statusLoading, setStatusLoading] = useState(false);

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundData, setRefundData] = useState({ refundStatus: 'NONE' });
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchOrders = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (refundFilter) params.refundStatus = refundFilter;

      const res = await getAllOrders(params);
      setOrders(res.data?.data || []);
      setMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage, limit: 10 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(page), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, paymentFilter, refundFilter, page]);

  const handleOpenStatusModal = (order: any) => {
    setSelectedOrder(order);
    setStatusData({ status: order.status });
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusLoading(true);
    try {
      await updateOrderStatus(selectedOrder.id, statusData);
      setIsStatusModalOpen(false);
      fetchOrders(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenRefundModal = (order: any) => {
    setSelectedOrder(order);
    setRefundData({ refundStatus: order.refundStatus });
    setIsRefundModalOpen(true);
  };

  const handleUpdateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefundLoading(true);
    try {
      await updateRefundStatus(selectedOrder.id, refundData);
      setIsRefundModalOpen(false);
      fetchOrders(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update refund status');
    } finally {
      setRefundLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-3.5 h-3.5" />;
      case 'PROCESSING': return <Package className="w-3.5 h-3.5" />;
      case 'SHIPPED': return <Truck className="w-3.5 h-3.5" />;
      case 'DELIVERED': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'CANCELLED': return <XCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-slate-100 text-slate-700';
      case 'PROCESSING': return 'bg-indigo-50 text-indigo-700';
      case 'SHIPPED': return 'bg-green-50 text-green-700';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-700';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <PackageSearch className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Order Management</h1>
            <p className="text-slate-500 text-sm mt-1">Track and update customer and dealer orders</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, email, or business..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-slate-700"
          >
            <option value="">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-slate-700"
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select
            value={refundFilter}
            onChange={(e) => { setRefundFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-slate-700"
          >
            <option value="">All Refund Statuses</option>
            <option value="NONE">None</option>
            <option value="INITIATED">Initiated</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-6">Order Details</th>
                <th className="p-6">Customer / Dealer</th>
                <th className="p-6">Amount & Payment</th>
                <th className="p-6">Order Status</th>
                <th className="p-6">Refund Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-32 mb-2"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-40 mb-2"></div><div className="h-3 bg-slate-100 rounded w-20"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-24 mb-2"></div><div className="h-4 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="p-6"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="p-6"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="p-6"><div className="h-8 bg-slate-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <PackageSearch className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg text-slate-900 mb-1">No orders found</p>
                    <p>Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={order.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-6">
                      <p className="font-bold text-slate-900 text-sm font-mono truncate max-w-[120px]" title={order.id}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-6">
                      {order.businessName ? (
                        <div>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-green-500" />
                            {order.businessName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{order.userEmail}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <UserCircle className="w-3.5 h-3.5 text-indigo-500" />
                            {order.userEmail}
                          </p>
                          <p className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-wider">Direct Customer</p>
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      <p className="font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</p>
                      <span className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${order.paymentStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' :
                          order.paymentStatus === 'FAILED' ? 'bg-rose-50 text-rose-700' :
                            order.paymentStatus === 'REFUNDED' ? 'bg-amber-50 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                        }`}>
                        <CreditCard className="w-3 h-3" />
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${order.refundStatus === 'NONE' ? 'bg-slate-100 text-slate-500' :
                          order.refundStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                            order.refundStatus === 'FAILED' ? 'bg-rose-50 text-rose-700' :
                              'bg-amber-50 text-amber-700'
                        }`}>
                        {order.refundStatus !== 'NONE' && <RotateCcw className="w-3.5 h-3.5" />}
                        {order.refundStatus}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Update Order Status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenRefundModal(order)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Manage Refunds"
                        >
                          <RotateCcw className="w-4 h-4" />
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
              Showing page {meta.currentPage} of {meta.totalPages} ({meta.totalCount} total orders)
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
        {isStatusModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Update Order Status</h2>
                  <p className="text-xs text-slate-500 font-mono mt-1">#{selectedOrder.id}</p>
                </div>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateStatus} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select New Status</label>
                  <select
                    value={statusData.status}
                    onChange={e => setStatusData({ status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsStatusModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={statusLoading} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex justify-center items-center disabled:opacity-50 hover:bg-green-600 transition-colors">
                    {statusLoading ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRefundModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Manage Refund</h2>
                  <p className="text-xs text-slate-500 font-mono mt-1">#{selectedOrder.id}</p>
                </div>
                <button onClick={() => setIsRefundModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateRefund} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Refund Status</label>
                  <select
                    value={refundData.refundStatus}
                    onChange={e => setRefundData({ refundStatus: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="NONE">NONE</option>
                    <option value="INITIATED">INITIATED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsRefundModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={refundLoading} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold flex justify-center items-center disabled:opacity-50 hover:bg-amber-600 transition-colors">
                    {refundLoading ? 'Updating...' : 'Update Refund'}
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