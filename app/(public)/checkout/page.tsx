'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MapPin, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { RootState } from '@/store/store';
import { getUserAddresses, addAddress } from '@/api/addresses';
import { getCart } from '@/api/cart';
import { placeOrder } from '@/api/orders';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [cart, setCart] = useState<any>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });

  const fetchData = useCallback(async () => {
    try {
      const [addrData, cartData] = await Promise.all([
        getUserAddresses(),
        getCart(),
      ]);
      setAddresses(addrData);
      setCart(cartData);
      
      const defaultAddr = addrData.find((a: any) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrData.length > 0) {
        setSelectedAddressId(addrData[0].id);
      }
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
    fetchData();
  }, [isAuthenticated, router, fetchData]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      setIsAddingAddress(false);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '', isDefault: false });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return;
    setPlacingOrder(true);
    try {
      await placeOrder({ addressId: selectedAddressId });
      setOrderSuccess(true);
      setTimeout(() => {
        router.push('/track-order');
      }, 3000);
    } catch (error) {
      console.error(error);
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E67E22]" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h1 className="text-4xl font-bold text-[#2B160A] mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Thank you for your purchase. We are preparing your freshly roasted beans. You will be redirected to your tracking page shortly.
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-[#E67E22]" />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + (parseFloat(item.product.price) * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + (items.length > 0 ? shipping : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-[#2B160A] mb-10">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-[#2B160A] mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#E67E22]" /> Shipping Address
            </h2>

            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {addresses.map((address) => (
                  <label 
                    key={address.id} 
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === address.id ? 'border-[#E67E22] bg-orange-50/50' : 'border-gray-200 hover:border-[#E67E22]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="absolute top-4 right-4 text-[#E67E22] focus:ring-[#E67E22] border-gray-300 w-4 h-4"
                    />
                    <div className="pr-8">
                      {address.isDefault && <span className="inline-block bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2">Default</span>}
                      <p className="font-semibold text-[#2B160A]">{address.street}</p>
                      <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-6 italic">No addresses saved yet.</p>
            )}

            {!isAddingAddress ? (
              <button 
                onClick={() => setIsAddingAddress(true)}
                className="flex items-center gap-2 text-[#E67E22] font-semibold hover:text-[#c96d1c] transition-colors"
              >
                <Plus className="w-5 h-5" /> Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-4">
                <h3 className="font-bold text-[#2B160A] mb-4">New Address Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <input type="text" required placeholder="Street Address" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]" />
                  </div>
                  <div>
                    <input type="text" required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]" />
                  </div>
                  <div>
                    <input type="text" required placeholder="State / Province" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]" />
                  </div>
                  <div>
                    <input type="text" required placeholder="ZIP / Postal Code" value={newAddress.zipCode} onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]" />
                  </div>
                  <div>
                    <input type="text" required placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]" />
                  </div>
                </div>
                <label className="flex items-center gap-2 mb-6 cursor-pointer">
                  <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})} className="text-[#E67E22] rounded border-gray-300 focus:ring-[#E67E22]" />
                  <span className="text-sm text-gray-700 font-medium">Set as default address</span>
                </label>
                <div className="flex gap-3">
                  <button type="submit" className="bg-[#2B160A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#E67E22] transition-colors">Save Address</button>
                  <button type="button" onClick={() => setIsAddingAddress(false)} className="px-6 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-[#2B160A] mb-6">Payment Method</h2>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
              <p className="text-gray-600 font-medium">Payment gateway integration placeholder.</p>
              <p className="text-sm text-gray-500 mt-2">Orders will be placed securely.</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-28">
            <h2 className="text-2xl font-bold text-[#2B160A] mb-6">Order Details</h2>
            
            <div className="space-y-4 mb-6 border-b border-gray-100 pb-6 max-h-[300px] overflow-y-auto pr-2">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#2B160A] text-sm line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-700 text-sm">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#2B160A]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-[#2B160A]">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-[#2B160A]">Total</span>
                <span className="text-3xl font-bold text-[#E67E22]">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddressId || items.length === 0}
              className="w-full bg-[#E67E22] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#c96d1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placingOrder ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}