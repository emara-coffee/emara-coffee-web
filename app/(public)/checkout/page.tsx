"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { clearCart } from '@/store/slices/cartSlice';
import { processCheckout, captureCheckout } from '@/api/shared/checkout';
import { CreditCard, ShieldCheck, Truck, Package, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [error, setError] = useState('');

  const formDataRef = useRef(formData);
  const agreedToTermsRef = useRef(agreedToTerms);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    agreedToTermsRef.current = agreedToTerms;
  }, [agreedToTerms]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    } else if (items.length === 0) {
      router.push('/cart');
    }
  }, [isAuthenticated, items, router]);

  const subtotal = items.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createOrder = async () => {
    setError('');
    
    const currentFormData = formDataRef.current;
    const currentAgreedToTerms = agreedToTermsRef.current;

    if (!currentFormData.street || !currentFormData.city || !currentFormData.state || !currentFormData.pincode) {
      setError('Please fill in all address fields before proceeding.');
      return Promise.reject(new Error("Validation failed"));
    }

    if (!currentAgreedToTerms) {
      setError('Please agree to the Terms and Conditions before proceeding.');
      return Promise.reject(new Error("Validation failed"));
    }

    try {
      setIsLoading(true);
      const res = await processCheckout({
        shippingAddress: currentFormData,
        paymentMethod: 'paypal'
      });

      if (!res.data.paypalOrderId) {
        throw new Error('Invalid response from server');
      }

      return res.data.paypalOrderId;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong during checkout.');
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await captureCheckout({ orderId: data.orderID });

      if (response.data.success) {
        dispatch(clearCart());
        router.push('/orders?success=true');
      } else {
        setError('Payment capture failed. Please contact support.');
      }
    } catch (err) {
      setError('An error occurred during payment capture.');
    }
  };

  if (items.length === 0) return null;

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '', currency: "USD", intent: "capture" }}>
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Cart
          </Link>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500" /> Secure Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-500" /> Shipping Information
                </h2>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="123 Main St, Apt 4B"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" /> Payment Method
                </h2>
                <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50 flex items-center gap-4 cursor-pointer">
                  <div className="w-6 h-6 rounded-full border-4 border-blue-500 bg-white"></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">Pay with PayPal</h3>
                    <p className="text-sm text-slate-500">Credit Card, Debit Card, PayPal Wallet</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm sticky top-28">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl p-2 relative flex-shrink-0 border border-slate-100">
                        {item.images?.[0] ? (
                          <Image src={item.images[0]} alt={item.name} fill className="object-contain p-1" />
                        ) : (
                          <Package className="w-full h-full text-slate-300 p-2" />
                        )}
                        <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.sku}</p>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        ${((item.price || 0) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6 border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Tax (18%)</span>
                    <span className="font-semibold text-slate-900">${tax.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-blue-600">Free</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">Total to Pay</span>
                    <span className="text-2xl font-black text-blue-600">${total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={agreedToTerms} 
                    onChange={(e) => setAgreedToTerms(e.target.checked)} 
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" 
                  />
                  <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer select-none font-medium">
                    I agree to the <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">Terms and Conditions</Link>
                  </label>
                </div>

                <div className="w-full relative z-0">
                  <PayPalButtons 
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={() => setError('PayPal encountered an error. Please try again.')}
                    style={{ layout: "vertical", shape: "rect" }}
                  />
                </div>
                
                <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Secure 256-bit SSL encryption
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}