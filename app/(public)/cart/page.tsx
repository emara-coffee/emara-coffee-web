'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { RootState } from '@/store/store';
import { getCart, removeFromCart } from '@/api/cart';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart();
      setCart(data);
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
    fetchCart();
  }, [isAuthenticated, router, fetchCart]);

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      await removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error(error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E67E22]" />
      </div>
    );
  }

  const items = cart?.items || [];
  
  const subtotal = items.reduce((acc: number, item: any) => {
    return acc + (parseFloat(item.product.price) * item.quantity);
  }, 0);
  
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + (items.length > 0 ? shipping : 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-[#E67E22] mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-[#2B160A] mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like you haven't added any premium Kenyan beans to your cart yet.
        </p>
        <Link href="/shop">
          <button className="bg-[#E67E22] text-white px-8 py-4 rounded-full font-bold hover:bg-[#c96d1c] transition-colors">
            Start Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-[#2B160A] mb-10">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 bg-gray-50 py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <div className="sm:col-span-6">Product</div>
              <div className="sm:col-span-2 text-center">Quantity</div>
              <div className="sm:col-span-2 text-right">Price</div>
              <div className="sm:col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item: any) => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={item.id} 
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-6 px-6"
                >
                  <div className="sm:col-span-6 flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.product.images[0] || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2B160A] line-clamp-1">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{item.product.category}</p>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removingId === item.id}
                        className="text-red-500 text-sm font-medium flex items-center gap-1 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {removingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Remove
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex justify-between sm:justify-center items-center">
                    <span className="sm:hidden text-sm text-gray-500">Qty:</span>
                    <span className="font-bold text-[#2B160A] bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-200">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="sm:col-span-2 flex justify-between sm:justify-end items-center">
                    <span className="sm:hidden text-sm text-gray-500">Price:</span>
                    <span className="font-semibold text-gray-700">
                      ${parseFloat(item.product.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="sm:col-span-2 flex justify-between sm:justify-end items-center">
                    <span className="sm:hidden text-sm text-gray-500">Total:</span>
                    <span className="font-bold text-[#2B160A]">
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-28">
            <h2 className="text-2xl font-bold text-[#2B160A] mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-gray-600 mb-8">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-[#2B160A]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-[#2B160A]">
                  {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-[#2B160A]">Total</span>
                <span className="text-3xl font-bold text-[#E67E22]">${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">Including VAT</p>
            </div>

            <Link href="/checkout">
              <button className="w-full bg-[#2B160A] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#E67E22] transition-colors">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </Link>

            <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
              <Image src="/file.svg" alt="Secure Payment" width={40} height={24} className="opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}