'use client';

import { useState, useEffect, useCallback, use } from 'react'; // Added 'use'
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ShoppingCart, Loader2, MessageCircle, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { getProductById } from '@/api/products';
import { addToCart } from '@/api/cart';
import { getProductReviews, addReview, addReviewComment } from '@/api/reviews';

// Changed type to Promise<{ id: string }>
export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapped params using React.use()
  const { id } = use(params);
  
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [activeCommentReviewId, setActiveCommentReviewId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

const fetchData = useCallback(async () => {
    try {
      // Fetch product first
      const productData = await getProductById(id);
      setProduct(productData);
      if (productData.images?.length > 0) {
        setActiveImage(productData.images[0]);
      }

      // Fetch reviews separately so if they fail, the product still shows
      try {
        const reviewsData = await getProductReviews(id);
        setReviews(reviewsData);
      } catch (revError) {
        console.error("Reviews failed to load", revError);
        setReviews([]); // Default to empty array if API fails
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

  const handleCommentSubmit = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSubmittingComment(true);
    try {
      await addReviewComment({ reviewId, text: commentText });
      setCommentText('');
      setActiveCommentReviewId(null);
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#E67E22]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h2 className="text-3xl font-bold text-[#2B160A] mb-4">Product not found</h2>
        <button onClick={() => router.push('/shop')} className="text-[#E67E22] hover:underline font-semibold">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20">
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-sm"
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
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === img ? 'border-[#E67E22] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-orange-50 text-[#E67E22] px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                {product.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2B160A] mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-[#E67E22]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-500">
                ({reviews.length} reviews)
              </span>
            </div>
            <p className="text-4xl font-bold text-[#2B160A] mb-8">
              ${parseFloat(product.price).toFixed(2)}
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-10">
              {product.description}
            </p>

            <div className="flex items-center gap-6 mb-10">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all"
                  disabled={product.stock === 0}
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="w-12 text-center font-bold text-[#2B160A]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all"
                  disabled={product.stock === 0}
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="flex-1 bg-[#E67E22] text-white py-4 px-8 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#c96d1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="border-t border-gray-200 pt-16 mt-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2B160A] mb-12 text-center">Customer Reviews</h2>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-8 rounded-2xl mb-12 border border-gray-100">
              <h3 className="text-xl font-bold text-[#2B160A] mb-6">Write a Review</h3>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star className={`w-8 h-8 ${reviewRating >= star ? 'fill-[#E67E22] text-[#E67E22]' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Experience</label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                  placeholder="Share your thoughts about this coffee..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="bg-[#2B160A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#E67E22] transition-colors disabled:opacity-50"
              >
                {submittingReview ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="text-center mb-12">
              <p className="text-gray-600 mb-4">Please log in to share your thoughts.</p>
              <button onClick={() => router.push('/login')} className="bg-[#E67E22] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#c96d1c]">
                Log In
              </button>
            </div>
          )}

          <div className="space-y-8">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 italic">No reviews yet. Be the first to review this coffee!</p>
            ) : (
              reviews.map((review: any) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-[#E67E22]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#2B160A]">{review.user.firstName} {review.user.lastName}</p>
                        <div className="flex text-[#E67E22]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">{review.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}