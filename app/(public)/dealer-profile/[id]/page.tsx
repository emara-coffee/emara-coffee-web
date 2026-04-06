"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchDealerById } from '@/api/public/dealers';
import { submitDealerReview } from '@/api/user/dealerReviews';
import { initializeChat } from '@/api/shared/chat';
import { useDispatch, useSelector } from 'react-redux';
import { setTargetChatUser } from '@/store/slices/chatSlice';
import { RootState } from '@/store/store';
import { Building2, MapPin, Phone, Mail, Star, ShieldCheck, ArrowLeft, MessageSquareText, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DealerProfilePage() {
  const params = useParams();
  const dealerId = params.id as string;
  const router = useRouter();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [dealer, setDealer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (dealerId) {
      loadDealer();
    }
  }, [dealerId]);

  const loadDealer = async () => {
    try {
      setIsLoading(true);
      const res = await fetchDealerById(dealerId);
      setDealer(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) return router.push('/login');
    try {
      const res = await initializeChat({ targetUserId: dealer.userId });
      dispatch(setTargetChatUser(res.data));
      router.push('/chat');
    } catch (err) {
      alert('Failed to initialize chat connection.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return router.push('/login');
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      await submitDealerReview({ dealerId: dealer.id, rating: reviewRating, comment: reviewText });
      setReviewText('');
      setReviewRating(5);
      await loadDealer();
      alert('Review submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit review. You must have purchased from this dealer.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin mb-6"></div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
        <Building2 className="w-20 h-20 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Dealer Not Found</h1>
        <p className="text-slate-500 mb-6">The dealer profile you are looking for does not exist or is inactive.</p>
        <Link href="/dealer-locator" className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors">
          Back to Locator
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dealer-locator" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-slate-900 to-green-900 relative">
            <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <Building2 className="w-10 h-10 text-green-500" />
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8 border-b border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-900">{dealer.businessName}</h1>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Authorized Partner
                </span>
              </div>
              <p className="text-slate-500 font-medium">Managed by {dealer.contactPerson}</p>
            </div>

            <div className="flex flex-col items-start md:items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(dealer.averageRating || 0) ? 'fill-current' : 'text-slate-300'}`} />
                ))}
                <span className="text-slate-900 font-black ml-2 text-lg">{(dealer.averageRating || 0).toFixed(1)}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">Based on {dealer.reviewCount || dealer.reviews?.length || 0} reviews</p>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Address</p>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {dealer.street}<br />
                      {dealer.city}, {dealer.state}<br />
                      {dealer.pincode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Phone</p>
                    <p className="text-slate-600 text-sm">{dealer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Email</p>
                    <p className="text-slate-600 text-sm">{dealer.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden h-full flex flex-col justify-center">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">Chat with Dealer</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    Have questions about specific inventory or need localized support? Message this dealer directly.
                  </p>
                  <button onClick={handleStartChat} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 text-sm">
                    <MessageSquareText className="w-4 h-4" /> Direct Message
                  </button>
                </div>
                <ShieldCheck className="w-48 h-48 text-white/5 absolute -bottom-10 -right-10 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">Dealer Reviews</h3>

          {(!user || user.role === 'USER') && (
            <form onSubmit={handleReviewSubmit} className="mb-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4">Write a Review</h4>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                    <Star className={`h-8 w-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <div className="relative">
                <textarea
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={isAuthenticated ? "Share your experience with this dealer..." : "Please log in to write a review"}
                  disabled={!isAuthenticated || submittingReview}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none min-h-[120px] transition-colors disabled:bg-slate-50 text-sm"
                />
                <button type="submit" disabled={!isAuthenticated || submittingReview || !reviewText.trim()} className="absolute bottom-4 right-4 p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm">
                  {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-6">
            {dealer.reviews && dealer.reviews.length > 0 ? (
              dealer.reviews.map((review: any) => (
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
                <p className="text-slate-500 font-medium">No reviews yet. Be the first to review this dealer!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}