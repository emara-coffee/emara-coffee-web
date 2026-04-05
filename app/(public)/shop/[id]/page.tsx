'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ShoppingCart, Loader2, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { getProductById } from '@/api/products';
import { addToCart } from '@/api/cart';
import { getProductReviews, addReview, addReviewComment } from '@/api/reviews';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const productData = await getProductById(id);
      setProduct(productData);
      if (productData.images?.length > 0) {
        setActiveImage(productData.images[0]);
      }

      try {
        const reviewsData = await getProductReviews(id);
        setReviews(reviewsData);
      } catch (revError) {
        console.error("Reviews failed to load", revError);
        setReviews([]); 
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart({ productId: id, quantity });
      router.push('/cart');
    } catch (error) {
      console.error(error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await addReview({ productId: id, rating: reviewRating, text: reviewText });
      setReviewText('');
      setReviewRating(5);
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="w-12 h-12 animate-spin text-[#4A7C59]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center flex-col bg-[#FAF8F5]">
        <h2 className="text-3xl font-bold text-[#3E200C] mb-4">Product not found</h2>
        <button onClick={() => router.push('/shop')} className="text-[#4A7C59] hover:underline font-semibold">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
          {/* Image Gallery */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50"
            >
              <Image
                src={activeImage || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </motion.div>
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === img ? 'border-[#4A7C59] opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill sizes="96px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-green-50 text-[#4A7C59] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-green-100">
                  {product.category}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#3E200C] mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-8">
                <div className="flex text-[#4A7C59]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-500 hover:text-[#4A7C59] cursor-pointer transition-colors">
                  ({reviews.length} customer reviews)
                </span>
              </div>
              <p className="text-4xl font-bold text-[#3E200C] mb-8">
                ${parseFloat(product.price).toFixed(2)}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-10">
                {product.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pt-8 border-t border-gray-100">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-[#3E200C]"
                    disabled={product.stock === 0}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-16 text-center font-bold text-xl text-[#3E200C]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-[#3E200C]"
                    disabled={product.stock === 0}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1 w-full bg-[#4A7C59] text-white py-4 px-8 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#3A5A40] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {addingToCart ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6" /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[#3E200C] mb-12 text-center">Customer Reviews</h2>

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="bg-white p-8 md:p-10 rounded-3xl mb-12 border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-bold text-[#3E200C] mb-8">Write a Review</h3>
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-10 h-10 ${reviewRating >= star ? 'fill-[#4A7C59] text-[#4A7C59]' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Your Experience</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] transition-all resize-none"
                    placeholder="Share your thoughts about this coffee..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-[#3E200C] text-white px-10 py-4 rounded-full font-bold hover:bg-[#4A7C59] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[200px]"
                >
                  {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Review'}
                </button>
              </form>
            ) : (
              <div className="text-center bg-white p-10 rounded-3xl border border-gray-100 shadow-sm mb-12">
                <p className="text-gray-600 mb-6 text-lg">Please log in to share your thoughts about this blend.</p>
                <button onClick={() => router.push('/login')} className="bg-[#4A7C59] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3A5A40] transition-colors">
                  Log In to Review
                </button>
              </div>
            )}

            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-12 bg-white rounded-3xl border border-gray-100">No reviews yet. Be the first to review this coffee!</p>
              ) : (
                reviews.map((review: any) => (
                  <div key={review.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#4A7C59]">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-[#3E200C] text-lg">{review.user.firstName} {review.user.lastName}</p>
                          <div className="flex gap-1 mt-1 text-[#4A7C59]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">{review.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}