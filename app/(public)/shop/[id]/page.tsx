"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setCart } from '@/store/slices/cartSlice';
import { getProductDetails } from '@/api/public/catalog';
import { addToCart, getMyCart } from '@/api/shared/cart';
import { submitProductReview } from '@/api/user/productReviews';
import { Loader2, Star, ShoppingCart, ShieldCheck, MapPin, MessageSquareText, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState('');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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
    if (!isAuthenticated) {
      setCartMsg('Please login to add items to cart.');
      return;
    }
    setAddingToCart(true);
    setCartMsg('');
    try {
      await addToCart({ productId: product.id, quantity });

      const cartRes = await getMyCart();
      const items = Array.isArray(cartRes.data) ? cartRes.data : cartRes.data?.items || [];
      dispatch(setCart(items));

      setCartMsg('Added to cart successfully!');
      setTimeout(() => setCartMsg(''), 3000);
    } catch (err: any) {
      setCartMsg(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return router.push('/login');
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      await submitProductReview({ productId: product.id, rating: reviewRating, comment: reviewText });
      setReviewText('');
      setReviewRating(5);
      await fetchProduct();
      alert('Review submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><Loader2 className="h-8 w-8 animate-spin text-[#4A7C59]" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-xl font-bold text-stone-700">Product not found.</div>;

  return (
    <div className="min-h-screen bg-stone-50 relative pb-20">
      <div className="absolute inset-0 z-0 h-[40vh] w-full bg-[linear-gradient(to_right,#8B451315_1px,transparent_1px),linear-gradient(to_bottom,#8B451315_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="bg-white aspect-square p-12 flex items-center justify-center relative">
              <img src={product.images?.[0] || '/logo.svg'} alt={product.name} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
            </div>

            <div className="p-10 lg:p-14 flex flex-col justify-center border-l border-stone-50">
              <div className="mb-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#4A7C59]/10 text-[#4A7C59] text-[10px] font-black rounded-full tracking-wider uppercase">{product.categoryName}</span>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">SKU: {product.sku}</span>
                </div>
              </div>

              <h1 className="text-4xl font-black text-stone-900 leading-tight mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-8">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-5 w-5 ${star <= Math.round(product.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200 fill-stone-200'}`} />
                  ))}
                </div>
                <span className="text-lg font-bold text-stone-800 ml-1">{product.averageRating.toFixed(1)}</span>
                <span className="text-sm font-medium text-stone-400">({product.reviewCount} verified reviews)</span>
              </div>

              <div className="mb-8">
                <p className="text-[10px] uppercase font-bold text-stone-400 mb-2 tracking-wider">Wholesale Base Price</p>
                <p className="text-5xl font-black text-stone-900">₹{product.basePrice.toLocaleString()}</p>
              </div>

              <p className="text-stone-600 text-base leading-relaxed mb-10">{product.description}</p>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex items-center border border-stone-200 rounded-2xl bg-white w-full sm:w-32 shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-stone-400 hover:text-stone-900 font-bold text-xl transition-colors">-</button>
                  <input type="text" value={quantity} readOnly className="w-full text-center bg-transparent font-bold text-stone-900 outline-none" />
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-stone-400 hover:text-stone-900 font-bold text-xl transition-colors">+</button>
                </div>
                <button
                  onClick={handleAddToCart} disabled={addingToCart}
                  className="flex-1 flex justify-center items-center gap-2 py-4 px-8 rounded-2xl font-bold text-white bg-[#4A7C59] hover:bg-[#3d664a] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {addingToCart ? <Loader2 className="animate-spin h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                  Add to Cart
                </button>
              </div>
              {cartMsg && <p className={`text-sm font-medium ${cartMsg.includes('success') ? 'text-emerald-600' : 'text-rose-600'}`}>{cartMsg}</p>}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-10 border border-stone-100 shadow-sm">
              <h3 className="text-2xl font-bold text-stone-900 mb-6">Technical Specifications</h3>
              {product.compatibilities ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(product.compatibilities).map(([key, value]) => (
                    <div key={key} className="p-5 rounded-2xl bg-stone-50 border border-stone-100">
                      <p className="text-xs font-bold text-stone-400 mb-1 uppercase tracking-wider">{key}</p>
                      <p className="font-bold text-stone-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 font-medium">No specific compatibilities listed.</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-10 border border-stone-100 shadow-sm">
              <h3 className="text-2xl font-bold text-stone-900 mb-8">Customer Reviews</h3>

              {(!user || user.role === 'USER') && (
                <form onSubmit={handleReviewSubmit} className="mb-12 bg-stone-50 p-6 rounded-2xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-4">Write a Review</h4>
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                        <Star className={`h-8 w-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <textarea
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder={isAuthenticated ? "Share your experience with this product..." : "Please log in to write a review"}
                      disabled={!isAuthenticated || submittingReview}
                      className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] outline-none resize-none min-h-[120px] transition-colors disabled:bg-stone-50 text-sm"
                    />
                    <button type="submit" disabled={!isAuthenticated || submittingReview || !reviewText.trim()} className="absolute bottom-4 right-4 p-3 bg-[#4A7C59] text-white rounded-xl hover:bg-[#3d664a] disabled:opacity-50 transition-colors shadow-sm">
                      {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review: any) => (
                    <div key={review.id} className="pb-6 border-b border-stone-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-stone-900">{review.userEmail?.split('@')[0] || 'Verified Buyer'}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-stone-600 leading-relaxed text-sm mt-3">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquareText className="h-12 w-12 text-stone-200 mx-auto mb-3" />
                    <p className="text-stone-500 font-medium">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#3E200C] rounded-3xl p-8 shadow-sm text-white h-fit sticky top-28">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-8 w-8 text-[#4A7C59]" />
              <h3 className="text-xl font-bold">Authorized Dealers</h3>
            </div>
            <p className="text-stone-300 text-sm mb-6 leading-relaxed">Purchase directly or get support from our certified partners in your region.</p>

            <div className="space-y-4">
              {product.authorizedDealers && product.authorizedDealers.length > 0 ? (
                product.authorizedDealers.map((dealer: any) => (
                  <div key={dealer.id} className="p-5 rounded-2xl bg-[#4F2D18]/50 border border-[#5A351D] hover:border-[#4A7C59] transition-colors">
                    <h4 className="font-bold text-white mb-2">{dealer.businessName}</h4>
                    <div className="flex items-center gap-2 text-stone-300 text-sm mb-4">
                      <MapPin className="h-4 w-4 text-[#4A7C59]" /> {dealer.city}, {dealer.state}
                    </div>
                    <Link href={`/dealer-profile/${dealer.id}`} className="w-full py-2.5 bg-white/10 hover:bg-[#4A7C59] text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                      <MessageSquareText className="h-4 w-4" /> View Profile & Contact
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 bg-[#4F2D18]/50 rounded-2xl border border-[#5A351D]">
                  <p className="text-stone-300 text-sm font-medium leading-relaxed">No localized dealers available for this product yet. Please purchase directly.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}