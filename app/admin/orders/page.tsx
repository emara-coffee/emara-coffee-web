'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Package, Truck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getAllOrders, updateOrderStatus, updateRefundStatus } from '@/api/orders';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefundChange = async (orderId: string, newRefundStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateRefundStatus(orderId, newRefundStatus);
      await fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'text-blue-600 bg-blue-50';
      case 'packaged': return 'text-purple-600 bg-purple-50';
      case 'dispatched': return 'text-yellow-600 bg-yellow-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search orders by ID or email..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] w-full sm:w-80"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Refund Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mx-auto" />
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#2B160A] text-sm mb-1">{order.id.split('-')[0]}...</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-sm text-[#2B160A]">{order.user.firstName} {order.user.lastName}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </td>
                  <td className="p-4 font-bold text-[#E67E22]">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full border-none focus:ring-2 focus:ring-[#E67E22] cursor-pointer outline-none ${getStatusColor(order.status)}`}
                    >
                      <option value="placed">Placed</option>
                      <option value="packaged">Packaged</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {order.status === 'cancelled' ? (
                      <div className="flex flex-col gap-1">
                        <select
                          value={order.refundStatus}
                          onChange={(e) => handleRefundChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="text-xs font-bold uppercase px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-700 outline-none focus:ring-1 focus:ring-[#E67E22]"
                        >
                          <option value="pending">Pending</option>
                          <option value="processed">Processed</option>
                        </select>
                        <span className="text-[10px] text-red-500 font-semibold">
                          Penalty: ${parseFloat(order.penaltyAmount).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}