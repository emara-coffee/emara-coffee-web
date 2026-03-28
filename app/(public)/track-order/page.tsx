'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, XCircle, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { RootState } from '@/store/store';
import { getUserOrders, cancelOrder } from '@/api/orders';

export default function TrackOrderPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router, fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this order? A 20% penalty will be deducted from your refund amount.'
    );
    
    if (!confirmCancel) return;
    
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      await fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed': return <Package className="w-6 h-6" />;
      case 'packaged': return <Package className="w-6 h-6" />;
      case 'dispatched': return <Truck className="w-6 h-6" />;
      case 'delivered': return <CheckCircle2 className="w-6 h-6" />;
      case 'cancelled': return <XCircle className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'text-blue-500 bg-blue-50';
      case 'packaged': return 'text-purple-500 bg-purple-50';
      case 'dispatched': return 'text-yellow-600 bg-yellow-50';
      case 'delivered': return 'text-green-500 bg-green-50';
      case 'cancelled': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const statusSteps = ['placed', 'packaged', 'dispatched', 'delivered'];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E67E22]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-[#2B160A] mb-4">Track Orders</h1>
      <p className="text-gray-600 mb-10 max-w-2xl">
        Monitor the journey of your premium beans from our roastery to your doorstep.
      </p>

      {orders.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700 mb-2">No orders found</p>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <button onClick={() => router.push('/shop')} className="bg-[#E67E22] text-white px-8 py-3 rounded-full font-bold hover:bg-[#c96d1c] transition-colors">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Order ID</p>
                  <p className="font-bold text-[#2B160A] text-sm">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Date Placed</p>
                  <p className="font-bold text-[#2B160A] text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                  <p className="font-bold text-[#E67E22] text-lg">${parseFloat(order.totalAmount).toFixed(2)}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 capitalize ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)} {order.status}
                </div>
              </div>

              <div className="p-6">
                {order.status !== 'cancelled' && (
                  <div className="mb-10 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#E67E22] rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(statusSteps.indexOf(order.status) / (statusSteps.length - 1)) * 100}%` 
                      }}
                    />
                    <div className="relative flex justify-between">
                      {statusSteps.map((step, index) => {
                        const isCompleted = statusSteps.indexOf(order.status) >= index;
                        return (
                          <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors ${
                              isCompleted ? 'bg-[#E67E22] text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-[#2B160A]' : 'text-gray-400'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-[#2B160A] mb-4 border-b border-gray-100 pb-2">Items Ordered</h3>
                    <div className="space-y-4">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-[#2B160A] line-clamp-1">{item.product.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-bold text-gray-700 text-sm">
                            ${(parseFloat(item.priceAtTime) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#2B160A] mb-4 border-b border-gray-100 pb-2">Shipping Details</h3>
                    <div className="flex items-start gap-3 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                      <MapPin className="w-5 h-5 text-[#E67E22] mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#2B160A] text-sm">{order.address.street}</p>
                        <p className="text-sm text-gray-600">{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                        <p className="text-sm text-gray-600">{order.address.country}</p>
                      </div>
                    </div>

                    {order.status === 'cancelled' && (
                      <div className="mt-4 bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="text-sm text-red-700 font-semibold flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4" /> Order Cancelled
                        </p>
                        <p className="text-xs text-red-600 mb-2">Penalty applied: ${parseFloat(order.penaltyAmount).toFixed(2)}</p>
                        <p className="text-xs font-medium text-red-700">Refund Status: <span className="uppercase">{order.refundStatus}</span></p>
                      </div>
                    )}

                    {(order.status === 'placed' || order.status === 'packaged') && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="text-red-500 text-sm font-bold flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {cancellingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}