"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDealerInventory, getDealerSalesHistory } from '@/api/admin/dealerManagement';
import { motion } from 'framer-motion';
import { Boxes, FileText, ChevronLeft, ChevronRight, Package, Calendar, User, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDealerInventoryViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dealerId = searchParams.get('dealerId');
  const dealerName = searchParams.get('dealerName') || 'Dealer';

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'SALES'>('INVENTORY');

  const [inventory, setInventory] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dealerId) {
      router.push('/admin/dealers');
      return;
    }

    if (activeTab === 'INVENTORY') {
      fetchInventory();
    } else {
      fetchSales();
    }
  }, [dealerId, activeTab, page, router]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await getDealerInventory(dealerId as string, { page, limit: 10 });
      setInventory(res.data?.data || []);
      setMeta(res.data?.meta || { currentPage: 1, totalPages: 1, totalCount: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await getDealerSalesHistory(dealerId as string, { page, limit: 10 });
      setSales(res.data?.data || []);
      setMeta(res.data?.meta || { currentPage: 1, totalPages: 1, totalCount: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'INVENTORY' | 'SALES') => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <Link href="/admin/dealers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to Dealers
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <Boxes className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{dealerName}</h1>
            <p className="text-slate-500 text-sm mt-1">Inventory and Sales Overview</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-2 bg-slate-50 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => handleTabChange('INVENTORY')}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-white text-green-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            <Package className="w-4 h-4" /> Current Stock
          </button>
          <button
            onClick={() => handleTabChange('SALES')}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'SALES' ? 'bg-white text-green-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            <FileText className="w-4 h-4" /> Sales History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                {activeTab === 'INVENTORY' ? (
                  <>
                    <th className="p-6">Product Details</th>
                    <th className="p-6">Current Stock</th>
                    <th className="p-6 text-right">Last Restocked</th>
                  </>
                ) : (
                  <>
                    <th className="p-6">Date</th>
                    <th className="p-6">Product Details</th>
                    <th className="p-6">Customer Details</th>
                    <th className="p-6 text-right">Sale Info</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={activeTab === 'INVENTORY' ? 3 : 4} className="p-12 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></td></tr>
              ) : activeTab === 'INVENTORY' && inventory.length === 0 ? (
                <tr><td colSpan={3} className="p-12 text-center text-slate-500 font-medium">No inventory records found for this dealer.</td></tr>
              ) : activeTab === 'SALES' && sales.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-500 font-medium">No manual sales logged by this dealer yet.</td></tr>
              ) : activeTab === 'INVENTORY' ? (
                inventory.map((item) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex-shrink-0 flex items-center justify-center p-1 shadow-sm">
                          {item.productImages?.[0] ? (
                            <img src={item.productImages[0]} alt={item.productName} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <Package className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.productName || 'Unknown Product'}</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">SKU: {item.productSku || item.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${item.quantity > 10 ? 'bg-emerald-50 text-emerald-700' :
                        item.quantity > 0 ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                        {item.quantity} Units
                      </span>
                    </td>
                    <td className="p-6 text-right text-sm font-medium text-slate-600 flex items-center justify-end gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(item.lastRestockedAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))
              ) : (
                sales.map((sale) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 text-sm font-medium text-slate-600">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex-shrink-0 flex items-center justify-center p-1 shadow-sm">
                          {sale.productImages?.[0] ? (
                            <img src={sale.productImages[0]} alt={sale.productName} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <Package className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{sale.productName || 'Unknown Product'}</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">SKU: {sale.productSku || sale.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-900 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> {sale.customerName || 'N/A'}</p>
                      <p className="text-xs text-slate-500 mt-1">{sale.customerPhone || 'No Phone'}</p>
                      {sale.invoiceReference && <p className="text-[10px] font-bold text-green-600 mt-1 uppercase tracking-wider">Ref: {sale.invoiceReference}</p>}
                    </td>
                    <td className="p-6 text-right">
                      <p className="font-black text-slate-900 flex items-center justify-end gap-1"><DollarSign className="w-4 h-4 text-slate-400" /> ${sale.salePrice.toLocaleString()}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">Qty: {sale.quantitySold}</p>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm font-medium text-slate-500">Showing page {meta.currentPage} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.currentPage === meta.totalPages} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors text-slate-600"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}