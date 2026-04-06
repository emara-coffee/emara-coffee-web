"use client";

import { useState, useEffect } from 'react';
import { browseProducts, getCategories } from '@/api/public/catalog';
import { Search, SlidersHorizontal, Loader2, Star, PackageX } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ShopPage() {
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

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden pb-20">
      <div className="absolute inset-0 z-0 h-[60vh] w-full bg-[linear-gradient(to_right,#8B451315_1px,transparent_1px),linear-gradient(to_bottom,#8B451315_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight">Product Catalog</h1>
            <p className="text-stone-500 mt-2">Browse premium green beans and roasted coffee.</p>
          </div>
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] transition-colors outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="h-5 w-5 text-[#4A7C59]" />
                <h3 className="font-bold text-stone-900">Filters</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-2">Price Range ($)</label>
                  <div className="flex gap-2">
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59]/20 outline-none text-sm" />
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59]/20 outline-none text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-2">Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59]/20 outline-none text-sm text-stone-700">
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-2">Minimum Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setMinRating(minRating === star ? 0 : star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`h-6 w-6 ${star <= minRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
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
                <Loader2 className="h-8 w-8 animate-spin text-[#4A7C59]" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-100 p-12 text-center flex flex-col items-center shadow-sm">
                <PackageX className="h-16 w-16 text-stone-300 mb-4" />
                <h3 className="text-xl font-bold text-stone-900">No products found</h3>
                <p className="text-stone-500 mt-2">Try adjusting your search or filters.</p>
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
                      className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-lg transition-all group flex flex-col"
                    >
                      <Link href={`/shop/${product.id}`} className="block relative aspect-square bg-white overflow-hidden p-6">
                        <img
                          src={product.images?.[0] || '/logo.svg'}
                          alt={product.name}
                          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-[#4A7C59]/10 px-3 py-1 rounded-full text-[10px] font-bold text-[#4A7C59] uppercase tracking-wide">
                          {product.categoryName}
                        </div>
                      </Link>
                      <div className="p-6 flex flex-col flex-1 border-t border-stone-50">
                        <p className="text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-wider">SKU: {product.sku}</p>
                        <Link href={`/shop/${product.id}`}>
                          <h3 className="text-lg font-bold text-stone-900 leading-tight mb-2 hover:text-[#4A7C59] transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 mb-4">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-stone-700">{product.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-stone-400 font-medium">({product.reviewCount} verified reviews)</span>
                        </div>
                        <div className="mt-auto flex items-end justify-between">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">Wholesale Base Price</p>
                            <p className="text-2xl font-black text-stone-900">${product.basePrice.toLocaleString()}</p>
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
                      className="px-6 py-3 rounded-xl font-medium border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="font-semibold text-stone-700">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-6 py-3 rounded-xl font-medium border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors"
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