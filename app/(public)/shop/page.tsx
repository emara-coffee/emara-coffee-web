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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-200 pb-8 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[#2B160A] mb-4">Our Coffees</h1>
          <p className="text-gray-600 max-w-xl">
            Explore our curated selection of premium Kenyan beans. Use the filters to find the perfect roast and flavor profile for your daily cup.
          </p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto relative flex items-center">
          <input
            type="text"
            placeholder="Search beans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
          />
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <button type="submit" className="hidden" />
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-28">
            <div className="flex items-center gap-2 mb-6 text-[#2B160A] font-bold">
              <Filter className="w-5 h-5" />
              <h3>Filters</h3>
            </div>

            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Category</h4>
              <div className="space-y-3">
                {['', 'Light Roast', 'Medium Roast', 'Dark Roast', 'Special Reserve'].map((cat) => (
                  <label key={cat || 'all'} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={category === cat}
                      onChange={() => { setCategory(cat); setPage(1); }}
                      className="w-4 h-4 text-[#E67E22] focus:ring-[#E67E22] border-gray-300"
                    />
                    <span className={`text-sm ${category === cat ? 'font-semibold text-[#E67E22]' : 'text-gray-600'}`}>
                      {cat || 'All Coffees'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E67E22]"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E67E22]"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-10 h-10 animate-spin text-[#E67E22] mb-4" />
              <p className="text-gray-500 font-medium">Brewing up results...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
              <p className="text-xl font-semibold text-gray-700 mb-2">No coffees found</p>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
              <button
                onClick={() => { setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setPage(1); }}
                className="mt-6 text-[#E67E22] font-semibold hover:underline"
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
                  <motion.div key={product.id} variants={fadeInUp} className="group flex flex-col h-full">
                    <Link href={`/shop/${product.id}`} className="block relative h-72 w-full rounded-2xl overflow-hidden mb-5 bg-gray-100">
                      <Image
                        src={product.images[0] || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#E67E22] shadow-sm">
                        {product.category}
                      </div>
                    </Link>
                    <div className="flex flex-col flex-1">
                      <Link href={`/shop/${product.id}`} className="hover:text-[#E67E22] transition-colors">
                        <h3 className="text-lg font-bold text-[#2B160A] mb-2 line-clamp-1">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-1 mb-3 text-[#E67E22]">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold text-gray-700 ml-1">4.8</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">{product.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-bold text-[#2B160A]">${parseFloat(product.price).toFixed(2)}</span>
                        <button 
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingToCart === product.id || product.stock === 0}
                          className="flex items-center justify-center w-10 h-10 bg-gray-100 text-[#2B160A] rounded-full hover:bg-[#E67E22] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          ? 'bg-[#E67E22] text-white'
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
  );
}