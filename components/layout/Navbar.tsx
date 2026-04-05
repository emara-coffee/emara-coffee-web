'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/logo.png" 
                alt="Emara Coffee Logo" 
                width={48} 
                height={48}
                className="object-contain transition-transform group-hover:scale-105"
                priority
              />
              <span className="font-extrabold text-xl tracking-tighter text-[#3E200C] uppercase">
                Emara Coffee
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {[
              { name: 'Home', path: '/' },
              { name: 'Shop', path: '/shop' },
              ...(isAuthenticated ? [{ name: 'Track Order', path: '/track-order' }] : [])
            ].map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-200 ${
                  isActive(link.path) 
                    ? 'text-[#4A7C59] border-b-2 border-[#4A7C59] pb-1' 
                    : 'text-gray-500 hover:text-[#4A7C59]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-500 hover:text-[#4A7C59] transition-colors">
              <SearchIcon />
            </button>
            
            <div className="relative group h-20 flex items-center">
              <Link href={isAuthenticated ? "/profile" : "/login"}>
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#4A7C59] transition-colors">
                  <PersonOutlineIcon />
                  <span className="text-sm font-medium hidden lg:block">Account</span>
                </button>
              </Link>

              {isAuthenticated && user?.role === 'admin' && (
                <div className="absolute top-16 right-0 w-48 bg-white border border-gray-100 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden py-2">
                  <Link href="/profile" className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#4A7C59] hover:bg-green-50/50 transition-colors">
                    My Account
                  </Link>
                  <Link href="/admin" className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#4A7C59] hover:bg-green-50/50 transition-colors">
                    Admin Panel
                  </Link>
                </div>
              )}
            </div>

            <Link href="/cart">
              <button className="text-gray-500 hover:text-[#4A7C59] transition-colors relative">
                <ShoppingBagOutlinedIcon />
                <span className="absolute -top-1.5 -right-2 bg-[#4A7C59] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  0
                </span>
              </button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-[#4A7C59] transition-colors"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-64 border-t' : 'max-h-0'}`}>
        <div className="px-4 pt-2 pb-4 space-y-1 bg-white sm:px-6">
          <Link href="/" className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#4A7C59] hover:bg-green-50">Home</Link>
          <Link href="/shop" className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#4A7C59] hover:bg-green-50">Shop</Link>
          {isAuthenticated && (
            <Link href="/track-order" className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#4A7C59] hover:bg-green-50">Track Order</Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link href="/admin" className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#4A7C59] hover:bg-green-50">Admin Panel</Link>
          )}
        </div>
      </div>
    </nav>
  );
}