'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart2, 
  LogOut 
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Inventory', icon: Package, path: '/admin/inventory' },
  { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { name: 'Customers', icon: Users, path: '/admin/customers' },
  { name: 'Reports', icon: BarChart2, path: '/admin/reports' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <aside className="w-64 h-screen bg-[#2B160A] flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#E67E22] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">EC</span>
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-tight">EMARA</h1>
            <p className="text-[#E67E22] text-xs font-semibold tracking-widest uppercase">Admin Central</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#3E200C] border-l-4 border-[#E67E22] text-white' 
                    : 'text-gray-400 hover:bg-[#3E200C] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-[#3E200C] hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Exit Admin Mode</span>
        </button>
      </div>
    </aside>
  );
}