'use client';

import { Settings, User as UserIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { usePathname } from 'next/navigation';

export default function AdminHeader() {
  const { user } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === '/admin') return 'SYSTEM SETTINGS';
    const pathParts = pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart.replace('-', ' ').toUpperCase();
  };

  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
          <Settings className="w-5 h-5" />
        </div>
        <h2 className="font-bold text-gray-800 tracking-wider text-sm">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-[#2B160A]">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs font-semibold text-green-600 flex items-center justify-end gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
            Live Server • Active
          </p>
        </div>
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-[#E67E22]">
          <UserIcon className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
}