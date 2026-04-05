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
      case 'placed': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'packaged': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'dispatched': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'delivered': return 'text-green-600 bg-green-50 border-green-100';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const statusSteps = ['placed', 'packaged', 'dispatched', 'delivered'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center pt-20">
        <Loader2 className="w-12 h-12 animate-spin text-[#4A7C59]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3E200C] mb-4">Track Orders</h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Monitor the journey of your premium beans from our roastery to your doorstep.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <Package className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <p className="text-2xl font-bold text-[#3E200C] mb-3">No orders found</p>
            <p className="text-gray-500 mb-8 text-lg">You haven't placed any orders with us yet.</p>
            <button 
              onClick={() => router.push('/shop')} 
              className="bg-[#4A7C59] text-white px-10 py-4 rounded-full font-bold hover:bg-[#3A5A40] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
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
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50/80 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-bold text-[#3E200C]">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Date Placed</p>
                    <p className="font-bold text-[#3E200C]">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="font-bold text-[#4A7C59] text-xl">${parseFloat(order.totalAmount).toFixed(2)}</p>
                  </div>
                  <div className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 capitalize border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </div>
                </div>

                <div className="p-8">
                  {order.status !== 'cancelled' && (
                    <div className="mb-14 relative px-4 md:px-12 mt-6">
                      <div className="absolute left-4 right-4 md:left-12 md:right-12 top-1/2 -translate-y-1/2 h-1.5 bg-gray-100 rounded-full" />
                      <div 
                        className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 h-1.5 bg-[#4A7C59] rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `calc(${(statusSteps.indexOf(order.status) / (statusSteps.length - 1)) * 100}% - ${statusSteps.indexOf(order.status) === 0 ? '0px' : '2rem'})` 
                        }}
                      />
                      <div className="relative flex justify-between">
                        {statusSteps.map((step, index) => {
                          const isCompleted = statusSteps.indexOf(order.status) >= index;
                          return (
                            <div key={step} className="flex flex-col items-center gap-3 bg-white px-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10 transition-colors duration-500 ${
                                isCompleted ? 'bg-[#4A7C59] text-white' : 'bg-gray-200 text-gray-400'
                              }`}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                              </div>
                              <span className={`text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-[#3E200C]' : 'text-gray-400'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-lg font-bold text-[#3E200C] mb-6 border-b border-gray-100 pb-3">Items Ordered</h3>
                      <div className="space-y-5">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100">
                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <div>
                                <p className="font-bold text-[#3E200C] mb-1 line-clamp-1 group-hover:text-[#4A7C59] transition-colors">{item.product.name}</p>
                                <p className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold text-[#3E200C] text-lg">
                              ${(parseFloat(item.priceAtTime) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#3E200C] mb-6 border-b border-gray-100 pb-3">Shipping Details</h3>
                      <div className="flex items-start gap-4 bg-[#FAF8F5] p-6 rounded-2xl border border-gray-100">
                        <MapPin className="w-6 h-6 text-[#4A7C59] mt-0.5" />
                        <div>
                          <p className="font-bold text-[#3E200C] text-base mb-1">{order.address.street}</p>
                          <p className="text-sm text-gray-600 mb-1">{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                          <p className="text-sm text-gray-600">{order.address.country}</p>
                        </div>
                      </div>

                      {order.status === 'cancelled' && (
                        <div className="mt-6 bg-red-50 p-6 rounded-2xl border border-red-100">
                          <p className="text-base text-red-700 font-bold flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5" /> Order Cancelled
                          </p>
                          <p className="text-sm text-red-600 mb-3">Penalty applied: <span className="font-bold">${parseFloat(order.penaltyAmount).toFixed(2)}</span></p>
                          <p className="text-sm font-semibold text-red-700">Refund Status: <span className="uppercase bg-red-100 px-2 py-1 rounded ml-2">{order.refundStatus}</span></p>
                        </div>
                      )}

                      {(order.status === 'placed' || order.status === 'packaged') && (
                        <div className="mt-8 flex justify-end">
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="text-red-600 text-sm font-bold flex items-center gap-2 hover:bg-red-50 px-6 py-3 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-red-100"
                          >
                            {cancellingId === order.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
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
    </div>
  );
}