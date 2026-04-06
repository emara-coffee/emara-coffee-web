"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getMyInventory, getMySalesHistory, logManualSale } from '@/api/dealer/inventory';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, FileText, Plus, ChevronLeft, ChevronRight, X, Package, Calendar, User, DollarSign, Loader2, CheckCircle2 } from 'lucide-react';

export default function DealerInventoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'SALES'>('INVENTORY');

  const [inventory, setInventory] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    quantitySold: 1,
    salePrice: '',
    customerName: '',
    customerPhone: '',
    invoiceReference: ''
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'DEALER') {
      router.push('/login?redirect=/dealer/inventory');
      return;
    }

    if (activeTab === 'INVENTORY') {
      fetchInventory();
    } else {
      fetchSales();
    }
  }, [isAuthenticated, activeTab, page]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await getMyInventory({ page, limit: 10 });
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
      const res = await getMySalesHistory({ page, limit: 10 });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await logManualSale({
        ...formData,
        quantitySold: Number(formData.quantitySold),
        salePrice: Number(formData.salePrice)
      });

      setSuccessMsg('Sale logged successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setFormData({ productId: '', quantitySold: 1, salePrice: '', customerName: '', customerPhone: '', invoiceReference: '' });
        if (activeTab === 'INVENTORY') fetchInventory();
        else fetchSales();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to log sale. Check inventory limits.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableProducts = inventory.filter(item => item.quantity > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <Boxes className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Inventory Management</h1>
            <p className="text-slate-500 text-sm mt-1">Track your stock levels and log offline manual sales</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> Log Manual Sale
        </button>
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
                <tr><td colSpan={3} className="p-12 text-center text-slate-500 font-medium">No inventory records found. Order products to stock up.</td></tr>
              ) : activeTab === 'SALES' && sales.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-500 font-medium">No manual sales logged yet.</td></tr>
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
                      <p className="font-black text-slate-900 flex items-center justify-end gap-1"><DollarSign className="w-4 h-4 text-slate-400" /> ₹{sale.salePrice.toLocaleString()}</p>
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900">Log Manual Sale</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmitSale} className="p-6 space-y-6">
                {successMsg && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {successMsg}</div>}
                {errorMsg && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold">{errorMsg}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Product from Inventory</label>
                    <select required name="productId" value={formData.productId} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium">
                      <option value="">-- Choose a product --</option>
                      {availableProducts.map(item => (
                        <option key={item.productId} value={item.productId}>
                          {item.productName || item.productId.slice(0, 8)} (In Stock: {item.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Quantity Sold</label>
                    <input required type="number" min="1" name="quantitySold" value={formData.quantitySold} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Total Sale Price (₹)</label>
                    <input required type="number" min="0" name="salePrice" value={formData.salePrice} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>

                  <div className="md:col-span-2 border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider">Customer Details (Optional)</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Customer Name</label>
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <input type="text" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Invoice Reference Number</label>
                    <input type="text" name="invoiceReference" value={formData.invoiceReference} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. INV-2026-001" />
                  </div>
                </div>

                <div className="pt-6 flex gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting || !formData.productId} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex justify-center items-center disabled:opacity-50 hover:bg-green-600 transition-colors">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log Sale'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}