"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import DealerSidebar from '@/components/layout/DealerSidebar';
import { getVerificationRequirements } from '@/api/dealer/verification';
import { Loader2 } from 'lucide-react';

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'DEALER') {
      router.push('/login');
      return;
    }

    const checkStatus = async () => {
      try {
        const { data } = await getVerificationRequirements();
        setStatus(data.dealerStatus);

        const isApproved = data.dealerStatus === 'APPROVED' || data.dealerStatus === 'SUSPENDED_PURCHASES';

        if (!isApproved && pathname !== '/dealer/verification') {
          router.replace('/dealer/verification');
        } else if (isApproved && pathname === '/dealer/verification') {
          // router.replace('/dealer/dashboard');
          router.replace('/dealer/products');
        }
      } catch (error) {
        console.error('Failed to fetch dealer status');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, user, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'DEALER') return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {status === 'APPROVED' || status === 'SUSPENDED_PURCHASES' ? <DealerSidebar /> : null}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}