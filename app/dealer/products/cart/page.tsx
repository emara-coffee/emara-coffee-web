"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCart, clearCart } from '@/store/slices/cartSlice';
import { getMyCart, removeFromCart, clearMyCart, updateCartItemQuantity } from '@/api/shared/cart';
import { Trash2, ArrowRight, ShoppingBag, Package, Minus, Plus, ChevronLeft } from 'lucide-react';

export default function DealerCartPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, router]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res = await getMyCart();
      const cartItems = Array.isArray(res.data) ? res.data : res.data?.items || [];
      dispatch(setCart(cartItems));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove(itemId);
      return;
    }
    try {
      setUpdatingId(itemId);
      await updateCartItemQuantity(itemId, newQuantity);
      const res = await getMyCart();
      const cartItems = Array.isArray(res.data) ? res.data : res.data?.items || [];
      dispatch(setCart(cartItems));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      setUpdatingId(itemId);
      await removeFromCart(itemId);
      const res = await getMyCart();
      const cartItems = Array.isArray(res.data) ? res.data : res.data?.items || [];
      dispatch(setCart(cartItems));
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = async () => {
    try {
      await clearMyCart();
      dispatch(clearCart());
    } catch (error) {
      console.error(error);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);

  if (isLoading && items.length === 0) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center"><div className="w-16 h-16 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <Link href="/dealer/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-green-500" /> Dealer Cart
        </h1>
        {items.length > 0 && (
          <button onClick={handleClear} className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your wholesale cart is empty</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Explore our catalog to add products and place your order.</p>
          <Link href="/dealer/products" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div key={item.id} className={`bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6 shadow-sm transition-opacity ${updatingId === item.id ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="w-32 h-32 bg-slate-50 rounded-2xl p-4 relative flex-shrink-0 border border-slate-100">
                  {item.images?.[0] ? <Image src={item.images[0]} alt={item.name} fill className="object-contain p-2" /> : <Package className="w-full h-full text-slate-300 p-4" />}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="text-xs font-bold text-slate-400 mb-1 uppercase">SKU: {item.sku}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.name}</h3>
                  <div className="text-green-600 font-black">₹{(item.price || 0).toLocaleString()}</div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-4 sm:border-l border-slate-100 sm:pl-6">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-green-500 hover:bg-white rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="text-sm font-bold text-slate-700 w-6 text-center">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-green-500 hover:bg-white rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="text-lg font-black text-slate-900">₹{((item.price || 0) * item.quantity).toLocaleString()}</div>
                  <button onClick={() => handleRemove(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 text-sm font-bold"><Trash2 className="w-4 h-4" /> Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Subtotal ({items.length} items)</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Tax (GST 18%)</span>
                  <span className="font-bold text-slate-900">₹{(subtotal * 0.18).toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">Estimated Total</span>
                  <span className="text-2xl font-black text-green-600">₹{(subtotal * 1.18).toLocaleString()}</span>
                </div>
              </div>
              <Link href="/dealer/products/checkout" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}