"use client";

import { useState, useEffect } from 'react';
import { browseProducts, getCategories } from '@/api/public/catalog';
import { requestDealership } from '@/api/dealer/requests';
import { addToCart } from '@/api/shared/cart';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Search, SlidersHorizontal, Loader2, Star, PackageX, ShoppingCart, ShieldCheck, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DealerShopPage() {
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minRating, setMinRating] = useState<number>(0);

  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await getCategories();
        setCategories(data);
      } catch (error) { }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (categoryId) params.categoryId = categoryId;
      if (minRating > 0) params.minRating = minRating;

      const { data } = await browseProducts(params);
      setProducts(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch, minPrice, maxPrice, categoryId, minRating]);

  const handleAddToCart = async (product: any) => {
    try {
      setAddingId(product.id);
      setErrorMsg('');
      setSuccessMsg('');
      await addToCart({ productId: product.id, quantity: 1 });
      setSuccessMsg('Added to cart successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to add to cart');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setAddingId(null);
    }
  };

  const handleRequestDealership = async (productId: string) => {
    try {
      setRequestingId(productId);
      setErrorMsg('');
      setSuccessMsg('');
      await requestDealership({ productId });
      setSuccessMsg('Dealership request submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to request dealership');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden pb-20">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dealer Catalog</h1>
            <p className="text-slate-500 mt-2">Browse inventory, request dealerships, and place wholesale orders.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-full md:w-80 relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors outline-none"
              />
            </div>
            <Link
              href="/dealer/products/cart"
              className="relative flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 flex-shrink-0"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-black border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {(successMsg || errorMsg) && (
          <div className={`mb-8 p-4 rounded-2xl border font-bold flex items-center gap-3 ${successMsg ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {successMsg ? <Check className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            {successMsg || errorMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-slate-900">Filters</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Price Range ($)</label>
                  <div className="flex gap-2">
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none text-sm" />
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none text-sm text-slate-700">
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Minimum Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setMinRating(minRating === star ? 0 : star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`h-6 w-6 ${star <= minRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
                <PackageX className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group flex flex-col"
                    >
                      <Link href={`/dealer/products/${product.id}`} className="block relative aspect-square bg-slate-50 overflow-hidden p-6 border-b border-slate-100">
                        <img
                          src={product.images?.[0] || '/logo.svg'}
                          alt={product.name}
                          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-500 border border-slate-200 uppercase tracking-wide shadow-sm">
                          {product.categoryName}
                        </div>
                      </Link>
                      <div className="p-6 flex flex-col flex-1 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">SKU: {product.sku}</p>
                        <Link href={`/dealer/products/${product.id}`}>
                          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 hover:text-green-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 mb-4">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-slate-700">{product.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="mt-auto space-y-4">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Base Price</p>
                              <p className="text-2xl font-black text-green-600">${product.basePrice.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={addingId === product.id}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {addingId === product.id ? (
                                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <><Plus className="w-4 h-4" /> Cart</>
                              )}
                            </button>
                            <button
                              onClick={() => handleRequestDealership(product.id)}
                              disabled={requestingId === product.id}
                              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {requestingId === product.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <><ShieldCheck className="w-4 h-4" /> Request</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-6 py-3 rounded-xl font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="font-semibold text-slate-700">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-6 py-3 rounded-xl font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}