"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard, ChevronDown, Package, LifeBuoy, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { setCart } from '@/store/slices/cartSlice';
import { getMyCart } from '@/api/shared/cart';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { totalQuantity } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getMyCart()
        .then((res) => {
          const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
          dispatch(setCart(items));
        })
        .catch(() => { });
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    router.push('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin/categories';
    if (user?.role === 'DEALER') return '/dealer/products';
    return '/profile';
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Emara Coffee Logo" width={50} height={40} className="object-contain" priority />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-2xl tracking-tight text-slate-900">
                Emara<span className="text-green-500">Coffee</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-sm font-medium text-slate-700 hover:text-green-500 transition-colors">
              Products
            </Link>
            <Link href="/find-product" className="text-sm font-medium text-slate-700 hover:text-green-500 transition-colors">
              Find Your Product
            </Link>
            <Link href="/dealer-locator" className="text-sm font-medium text-slate-700 hover:text-green-500 transition-colors">
              Dealer Locator
            </Link>
            <Link href="/blogs" className="text-sm font-medium text-slate-700 hover:text-green-500 transition-colors">
              Blogs
            </Link>

            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">

              {/* CART ICON - ONLY SHOWS IF LOGGED IN */}
              {mounted && isAuthenticated && (
                <Link href="/cart" className="text-slate-500 hover:text-green-500 transition-colors relative">
                  <ShoppingCart className="h-5 w-5" />
                  <AnimatePresence>
                    {totalQuantity > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center"
                      >
                        {totalQuantity}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )}

              {/* USER MENU */}
              {mounted ? (
                isAuthenticated ? (
                  user?.role === 'USER' ? (
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition-colors"
                      >
                        <User className="h-4 w-4 text-green-600" />
                        Account
                        <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isUserMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2"
                          >
                            <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 transition-colors">
                              <User className="h-4 w-4" /> My Account
                            </Link>
                            <Link href="/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 transition-colors">
                              <Package className="h-4 w-4" /> My Orders
                            </Link>
                            <Link href="/support" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 transition-colors">
                              <LifeBuoy className="h-4 w-4" /> Support
                            </Link>
                            <Link href="/chat" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 transition-colors">
                              <MessageSquare className="h-4 w-4" /> Chat
                            </Link>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                              <LogOut className="h-4 w-4" /> Logout
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link href={getDashboardLink()} className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <button onClick={handleLogout} className="text-slate-500 hover:text-rose-500 transition-colors">
                        <LogOut className="h-5 w-5" />
                      </button>
                    </div>
                  )
                ) : (
                  <Link href="/login" className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition-colors">
                    <User className="h-4 w-4" /> Login
                  </Link>
                )
              ) : (
                <div className="w-24 h-9 bg-slate-100 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}