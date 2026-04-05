'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Filter, Star, ChevronLeft, ChevronRight, Loader2, ShoppingCart } from 'lucide-react';
import { getProducts } from '@/api/products';
import { addToCart } from '@/api/cart';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const data = await getProducts(params);
      setProducts(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setAddingToCart(productId);
    try {
      await addToCart({ productId, quantity: 1 });
    } catch (error) {
      console.error(error);
    } finally {
      setAddingToCart(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-200 pb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#3E200C] mb-4">Our Coffees</h1>
            <p className="text-gray-600 max-w-xl text-lg">
              Explore our curated selection of premium African beans. Use the filters to find the perfect roast and flavor profile for your daily cup.
            </p>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="w-full md:w-auto relative flex items-center shadow-sm rounded-full">
            <input
              type="text"
              placeholder="Search beans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
            />
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
            <button type="submit" className="hidden" />
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-28">
              <div className="flex items-center gap-2 mb-6 text-[#3E200C] font-bold">
                <Filter className="w-5 h-5" />
                <h3 className="text-lg">Filters</h3>
              </div>

              <div className="mb-8">
                <h4 className="font-semibold text-[#3E200C] mb-4 text-sm uppercase tracking-wider">Category</h4>
                <div className="space-y-3">
                  {['', 'Light Roast', 'Medium Roast', 'Dark Roast', 'Special Reserve'].map((cat) => (
                    <label key={cat || 'all'} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={category === cat}
                        onChange={() => { setCategory(cat); setPage(1); }}
                        className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59] border-gray-300 cursor-pointer"
                      />
                      <span className={`text-sm transition-colors ${category === cat ? 'font-bold text-[#4A7C59]' : 'text-gray-600 group-hover:text-[#4A7C59]'}`}>
                        {cat || 'All Coffees'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#3E200C] mb-4 text-sm uppercase tracking-wider">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] transition-all bg-gray-50 hover:bg-white"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="w-10 h-10 animate-spin text-[#4A7C59] mb-4" />
                <p className="text-gray-500 font-medium">Brewing up results...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                <p className="text-2xl font-bold text-[#3E200C] mb-3">No coffees found</p>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms to find what you're looking for.</p>
                <button
                  onClick={() => { setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setPage(1); }}
                  className="px-6 py-2 bg-[#4A7C59] text-white rounded-full font-semibold hover:bg-[#3A5A40] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {products.map((product) => (
                    <motion.div key={product.id} variants={fadeInUp} className="group flex flex-col h-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                      <Link href={`/shop/${product.id}`} className="block relative h-64 w-full rounded-xl overflow-hidden mb-5 bg-gray-50">
                        <Image
                          src={product.images[0] || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#4A7C59] shadow-sm">
                          {product.category}
                        </div>
                      </Link>
                      <div className="flex flex-col flex-1 px-2 pb-2">
                        <Link href={`/shop/${product.id}`} className="hover:text-[#4A7C59] transition-colors">
                          <h3 className="text-xl font-bold text-[#3E200C] mb-2 line-clamp-1">{product.name}</h3>
                        </Link>
                        <div className="flex items-center gap-1 mb-3 text-[#4A7C59]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                          <span className="text-sm font-semibold text-gray-700 ml-1">4.8</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                          <span className="text-2xl font-bold text-[#3E200C]">${parseFloat(product.price).toFixed(2)}</span>
                          <button 
                            onClick={() => handleAddToCart(product.id)}
                            disabled={addingToCart === product.id || product.stock === 0}
                            className="flex items-center justify-center w-12 h-12 bg-green-50 text-[#4A7C59] rounded-full hover:bg-[#4A7C59] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            aria-label="Add to cart"
                          >
                            {addingToCart === product.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-16">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-full font-semibold transition-colors ${
                          page === i + 1
                            ? 'bg-[#4A7C59] text-white shadow-md'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
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