"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getArticleBySlug } from '@/api/public/articles';
import { castArticleVote, addArticleComment } from '@/api/user/articleInteractions';
import { Loader2, Calendar, Eye, ThumbsUp, ThumbsDown, MessageSquare, Send, User, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [interacting, setInteracting] = useState(false);

  const fetchArticle = async () => {
    try {
      const res = await getArticleBySlug(slug as string);
      setData(res.data);
    } catch (error) {
      console.error("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchArticle();
  }, [slug]);

  const handleVote = async (voteType: 'LIKE' | 'DISLIKE') => {
    if (!isAuthenticated) return router.push('/login');
    setInteracting(true);
    try {
      await castArticleVote({ articleId: data.article.id, voteType });
      await fetchArticle();
    } catch (err) {
      console.error("Vote failed");
    } finally {
      setInteracting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return router.push('/login');
    if (!commentText.trim()) return;

    setInteracting(true);
    try {
      await addArticleComment({ articleId: data.article.id, comment: commentText });
      setCommentText('');
      await fetchArticle();
    } catch (err) {
      console.error("Comment failed");
    } finally {
      setInteracting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div>;
  if (!data?.article) return <div className="min-h-screen flex items-center justify-center bg-white text-xl font-bold text-slate-700">Article not found.</div>;

  const { article, comments } = data;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="relative h-[45vh] w-full bg-slate-900 overflow-hidden">
        <img
          src={article.thumbnailUrl || '/logo.svg'}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/80 to-slate-50/50" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-4xl mx-auto px-6 w-full mb-12">
            <Link href="/blogs" className="inline-flex items-center text-green-400 text-sm font-bold mb-6 hover:text-green-300 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> BACK TO BLOGS
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-200 text-sm font-semibold">
                <span className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg">
                  <Calendar className="h-4 w-4 text-green-400" />
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg">
                  <Eye className="h-4 w-4 text-green-400" /> {article.viewsCount?.toLocaleString()} views
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 -mt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-14 mb-10"
        >
          <article className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </article>

          <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Published By</p>
                <p className="text-sm font-bold text-slate-900">{article.authorEmail?.split('@')[0]}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button
                onClick={() => handleVote('LIKE')}
                disabled={interacting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-white hover:text-green-600 text-slate-500 font-bold text-sm transition-all hover:shadow-sm disabled:opacity-50"
              >
                <ThumbsUp className={`h-4 w-4 ${interacting ? 'animate-pulse' : ''}`} /> {article.likesCount || 0}
              </button>
              <div className="w-[1px] h-6 bg-slate-200" />
              <button
                onClick={() => handleVote('DISLIKE')}
                disabled={interacting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-white hover:text-rose-600 text-slate-500 font-bold text-sm transition-all hover:shadow-sm disabled:opacity-50"
              >
                <ThumbsDown className="h-4 w-4" /> {article.dislikesCount || 0}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8 px-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            <h3 className="text-xl font-black text-slate-900">Community Discussion</h3>
            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
              {comments?.length || 0}
            </span>
          </div>

          <form onSubmit={handleCommentSubmit} className="mb-12 group">
            <div className="relative bg-white rounded-2xl border border-slate-200 p-2 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 transition-all shadow-sm">
              <textarea
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isAuthenticated ? "Share a professional insight..." : "Sign in to join the conversation"}
                disabled={!isAuthenticated || interacting}
                className="w-full px-4 py-3 bg-transparent outline-none resize-none text-sm text-slate-700 min-h-[80px]"
              />
              <div className="flex justify-end p-2 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={!isAuthenticated || interacting || !commentText.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-md shadow-green-600/20"
                >
                  {interacting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  POST COMMENT
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((c: any) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  key={c.id}
                  className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {c.userEmail?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{c.userEmail?.split('@')[0]}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pl-9">{c.comment}</p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-sm font-bold text-slate-400 italic">No comments yet. Start the conversation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}