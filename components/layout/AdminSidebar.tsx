"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  LogOut,
  Tags,
  FileText,
  UserCircle,
  LifeBuoy,
  Menu,
  ChevronLeft,
  ChevronRight,
  Building2,
  Store,
  MessageSquare
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  // { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Tags, label: 'Categories', href: '/admin/categories' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: FileText, label: 'Article Categories', href: '/admin/article-categories' },
  { icon: FileText, label: 'Articles', href: '/admin/articles' },
  { icon: Users, label: 'Dealers', href: '/admin/dealers' },
  { icon: Store, label: 'Dealerships', href: '/admin/dealerships' },
  { icon: UserCircle, label: 'Customers', href: '/admin/customers' },
  { icon: ClipboardList, label: 'Orders', href: '/admin/orders' },
  { icon: LifeBuoy, label: 'Support Tickets', href: '/admin/support' },
  { icon: MessageSquare, label: 'Chats', href: '/admin/chat' },
  { icon: UserCircle, label: 'Profile', href: '/admin/profile' },
  { icon: FileText, label: 'Terms', href: '/admin/terms' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-[#3E200C] h-screen sticky top-0 flex flex-col z-50 flex-shrink-0 border-r border-[#4A7C59]/30"
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#4A7C59]/30">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-black text-xl tracking-tight text-white whitespace-nowrap overflow-hidden"
            >
              Admin<span className="text-[#4A7C59]">Panel</span>
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-[#4A7C59]/20 transition-colors"
        >
          {isCollapsed ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center rounded-xl transition-all overflow-hidden ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'
                } ${isActive
                  ? 'bg-[#4A7C59] text-white shadow-lg shadow-[#4A7C59]/30'
                  : 'text-slate-300 hover:bg-[#4A7C59]/20 hover:text-white'
                }`}
            >
              <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isActive ? 'text-white' : 'text-[#4A7C59]'}`} />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3 font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#4A7C59]/30">
        <button
          onClick={() => dispatch(logout())}
          title={isCollapsed ? "Logout" : undefined}
          className={`flex items-center w-full rounded-xl text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 transition-all overflow-hidden ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'
            }`}
        >
          <LogOut className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}