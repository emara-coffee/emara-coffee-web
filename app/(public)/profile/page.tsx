'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, LogOut, Ticket, Package, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isMounted]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center pt-20">
        <Loader2 className="w-12 h-12 animate-spin text-[#4A7C59]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[#3E200C] mb-12">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-green-50 to-white" />
              
              <div className="relative z-10 w-28 h-28 bg-white border-4 border-white shadow-md rounded-full mx-auto flex items-center justify-center text-[#4A7C59] mb-5">
                <User className="w-12 h-12" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-2xl font-bold text-[#3E200C] mb-1 flex items-center gap-2">
                  {user.firstName} {user.lastName}
                </h2>
                {user.role === 'admin' && (
                  <span className="bg-[#3E200C] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-sm">
                    Admin
                  </span>
                )}
                
                <p className="text-base text-gray-500 mb-8 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" /> {user.email}
                </p>
                
                <div className="w-full border-t border-gray-100 pt-8">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 text-red-600 font-bold rounded-2xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold text-[#3E200C] mb-8 border-b border-gray-100 pb-4">Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={user.firstName} 
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-600 font-medium focus:outline-none cursor-default" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={user.lastName} 
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-600 font-medium focus:outline-none cursor-default" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    readOnly 
                    value={user.email} 
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-600 font-medium focus:outline-none cursor-default" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link href="/track-order" className="block bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#4A7C59]/30 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#4A7C59] mb-6 group-hover:scale-110 group-hover:bg-[#4A7C59] group-hover:text-white transition-all duration-300">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-[#3E200C] mb-2">My Orders</h4>
                <p className="text-gray-500 leading-relaxed">Track your shipments and view your complete purchase history.</p>
              </Link>

              <Link href="/tickets" className="block bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#4A7C59]/30 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#4A7C59] mb-6 group-hover:scale-110 group-hover:bg-[#4A7C59] group-hover:text-white transition-all duration-300">
                  <Ticket className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-[#3E200C] mb-2">Support Tickets</h4>
                <p className="text-gray-500 leading-relaxed">View your active requests or contact our customer support team.</p>
              </Link>

              {user.role === 'admin' && (
                <Link href="/admin" className="block sm:col-span-2 bg-[#3E200C] p-8 rounded-3xl border border-transparent shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/10">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">Admin Dashboard</h4>
                      <p className="text-gray-300">Access store management, inventory, and administrative controls.</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}