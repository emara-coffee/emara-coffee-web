"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getProductDetails } from '@/api/public/catalog';
import { addToCart } from '@/api/shared/cart';
import { requestDealership } from '@/api/dealer/requests';
import { Loader2, Star, ShoppingCart, ShieldCheck, MessageSquareText, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DealerProductDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState('');

  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [dealershipMsg, setDealershipMsg] = useState('');

  const fetchProduct = async () => {
    try {
      const { data } = await getProductDetails(id as string);
      setProduct(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) return;
    setAddingToCart(true);
    setCartMsg('');
    try {
      await addToCart({ productId: product.id, quantity });
      setCartMsg('Added to cart successfully!');
      setTimeout(() => setCartMsg(''), 3000);
    } catch (err: any) {
      setCartMsg(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRequestDealership = async () => {
    try {
      setRequestingId(product.id);
      setDealershipMsg('');
      await requestDealership({ productId: product.id });
      setDealershipMsg('Dealership request submitted!');
      setTimeout(() => setDealershipMsg(''), 3000);
    } catch (err: any) {
      setDealershipMsg(err.response?.data?.message || 'Failed to request');
      setTimeout(() => setDealershipMsg(''), 4000);
    } finally {
      setRequestingId(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-transparent text-xl font-bold text-slate-700">Product not found.</div>;

  return (
    <div className="min-h-screen bg-transparent relative pb-20">
      <div className="relative z-10">
        <Link href="/dealer/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="bg-slate-50 aspect-square p-12 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-slate-100">
              <img src={product.images?.[0] || '/logo.svg'} alt={product.name} className="max-w-full max-h-full object-contain drop-shadow-2xl mix-blend-multiply" />
            </div>

            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <div className="mb-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full tracking-wider uppercase border border-green-100">{product.categoryName}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKU: {product.sku}</span>
                </div>
              </div>

              <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-8">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-5 w-5 ${star <= Math.round(product.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                  ))}
                </div>
                <span className="text-lg font-bold text-slate-800 ml-1">{product.averageRating.toFixed(1)}</span>
                <span className="text-sm font-medium text-slate-400">({product.reviewCount} verified reviews)</span>
              </div>

              <div className="mb-8">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Wholesale Base Price</p>
                <p className="text-5xl font-black text-slate-900">₹{product.basePrice.toLocaleString()}</p>
              </div>

              <p className="text-slate-600 text-base leading-relaxed mb-10">{product.description}</p>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex items-center border border-slate-200 rounded-2xl bg-white w-full sm:w-32 shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-slate-400 hover:text-slate-900 font-bold text-xl transition-colors">-</button>
                  <input type="text" value={quantity} readOnly className="w-full text-center bg-transparent font-bold text-slate-900 outline-none" />
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-slate-400 hover:text-slate-900 font-bold text-xl transition-colors">+</button>
                </div>
                <button
                  onClick={handleAddToCart} disabled={addingToCart}
                  className="flex-1 flex justify-center items-center gap-2 py-4 px-8 rounded-2xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {addingToCart ? <Loader2 className="animate-spin h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                  Add to Cart
                </button>
                <button
                  onClick={handleRequestDealership} disabled={requestingId === product.id}
                  className="flex-1 flex justify-center items-center gap-2 py-4 px-8 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {requestingId === product.id ? <Loader2 className="animate-spin h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                  Request Dealership
                </button>
              </div>

              {cartMsg && <p className={`text-sm font-bold mt-2 ${cartMsg.includes('success') ? 'text-emerald-600' : 'text-rose-600'}`}>{cartMsg}</p>}
              {dealershipMsg && <p className={`text-sm font-bold mt-2 ${dealershipMsg.includes('success') ? 'text-emerald-600' : 'text-rose-600'}`}>{dealershipMsg}</p>}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Technical Specifications</h3>
            {product.compatibilities ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(product.compatibilities).map(([key, value]) => (
                  <div key={key} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{key}</p>
                    <p className="font-bold text-slate-900">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 font-medium">No specific compatibilities listed.</p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Customer Reviews</h3>
            {/* Dealer cannot write review, only read */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review: any) => (
                  <div key={review.id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{review.userEmail?.split('@')[0] || 'Verified Buyer'}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm mt-3">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquareText className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No reviews yet for this product.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}