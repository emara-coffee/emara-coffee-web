'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingBag, Menu } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed w-full z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8B4513] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">EC</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-[#3E200C]">
                EMARA COFFEE
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-[#E67E22]' : 'text-gray-600 hover:text-[#E67E22]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`text-sm font-medium transition-colors ${
                isActive('/shop') ? 'text-[#E67E22]' : 'text-gray-600 hover:text-[#E67E22]'
              }`}
            >
              Shop
            </Link>
            {isAuthenticated && (
              <Link
                href="/track-order"
                className={`text-sm font-medium transition-colors ${
                  isActive('/track-order') ? 'text-[#E67E22]' : 'text-gray-600 hover:text-[#E67E22]'
                }`}
              >
                Track Order
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-600 hover:text-[#E67E22] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href={isAuthenticated ? "/profile" : "/login"}>
              <button className="flex items-center gap-2 text-gray-600 hover:text-[#E67E22] transition-colors">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Account</span>
              </button>
            </Link>
            <Link href="/cart">
              <button className="text-gray-600 hover:text-[#E67E22] transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#E67E22] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-[#E67E22]"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#E67E22] hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#E67E22] hover:bg-gray-50"
            >
              Shop
            </Link>
            {isAuthenticated && (
              <Link
                href="/track-order"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#E67E22] hover:bg-gray-50"
              >
                Track Order
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}