'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, LogOut, Ticket, Package } from 'lucide-react';
import Link from 'next/link';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-[#2B160A] mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full mx-auto flex items-center justify-center text-[#E67E22] mb-4">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-[#2B160A] mb-1">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
            <div className="border-t border-gray-100 pt-6">
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#2B160A] mb-6">Account Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input type="text" readOnly value={user.firstName} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input type="text" readOnly value={user.lastName} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input type="email" readOnly value={user.email} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/track-order" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#E67E22] transition-colors group">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#E67E22] mb-4 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#2B160A] mb-1">My Orders</h4>
              <p className="text-sm text-gray-500">Track and manage your recent purchases.</p>
            </Link>

            <Link href="/tickets" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#E67E22] transition-colors group">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#E67E22] mb-4 group-hover:scale-110 transition-transform">
                <Ticket className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#2B160A] mb-1">Support Tickets</h4>
              <p className="text-sm text-gray-500">View your active and closed support requests.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}