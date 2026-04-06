"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getDetailedOrders, cancelOrder } from '@/api/shared/orders';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const StatusConfig: Record<string, { icon: any, color: string, bg: string }> = {
  PENDING: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  PROCESSING: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  SHIPPED: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  DELIVERED: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  CANCELLED: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' }
};

export default function DealerOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [orders, setOrders] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'DEALER') {
      router.push('/login?redirect=/dealer/orders');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, user, router, page]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = { page, limit: 10, search: searchQuery || undefined };
      const res = await getDetailedOrders(params);
      setOrders(res.data?.data || []);
      setMeta(res.data?.meta || { currentPage: 1, totalPages: 1, totalCount: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(orderId, { reason: 'Dealer requested cancellation' });
      await fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <Package className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Wholesale Orders</h1>
            <p className="text-slate-500 text-sm mt-1">Track, manage, and view your wholesale order history.</p>
          </div>
        </div>
        <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
          />
          <button type="submit" className="absolute left-4 top-3">
            <Search className="w-5 h-5 text-slate-400 hover:text-green-500 transition-colors" />
          </button>
        </form>
      </div>

      {orders.length === 0 && !isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No orders found</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            You haven't placed any wholesale orders matching this criteria yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = StatusConfig[order.status]?.icon || Package;
            const statusColor = StatusConfig[order.status]?.color || 'text-slate-600';
            const statusBg = StatusConfig[order.status]?.bg || 'bg-slate-50';
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-green-200">
                <div
                  onClick={() => toggleOrder(order.id)}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                >
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Order ID</p>
                      <p className="text-sm font-bold text-slate-900">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Date</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Total</p>
                      <p className="text-sm font-bold text-slate-900">₹{(order.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Status</p>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusBg} ${statusColor}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {order.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-green-600 transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Items Included</h4>
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 rounded-lg p-2 relative flex-shrink-0 border border-slate-100">
                                  {item.images?.[0] ? (
                                    <Image src={item.images[0]} alt={item.productName} fill className="object-contain" />
                                  ) : (
                                    <Package className="w-full h-full text-slate-300" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate">{item.productName}</p>
                                  <p className="text-xs text-slate-500 mb-1">SKU: {item.productSku}</p>
                                  <p className="text-xs font-medium text-slate-600">Qty: {item.quantity} × ₹{(item.price || 0).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-slate-900">₹{(item.quantity * (item.price || 0)).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Shipping Details</h4>
                              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm text-slate-600 leading-relaxed">
                                <p>{order.shippingStreet}</p>
                                <p>{order.shippingCity}, {order.shippingState}</p>
                                <p>{order.shippingPincode}</p>
                                <p className="font-medium text-slate-900 mt-2">Method: {order.paymentMethod?.toUpperCase()}</p>
                              </div>
                            </div>

                            {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-rose-100 text-rose-600 px-4 py-3 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-sm"
                              >
                                <AlertCircle className="w-4 h-4" /> Cancel Order
                              </button>
                            )}
                            {order.status === 'CANCELLED' && order.cancellationReason && (
                              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-sm text-rose-700">
                                <span className="font-bold block mb-1">Cancellation Reason:</span>
                                {order.cancellationReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {meta.totalPages > 1 && (
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Showing page {meta.currentPage} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={meta.currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors text-slate-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={meta.currentPage === meta.totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors text-slate-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}