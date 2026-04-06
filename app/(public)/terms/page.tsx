"use client";

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Shield } from 'lucide-react';
import { getActiveTerm } from '@/api/public/terms';

export default function PublicTermsPage() {
  const [term, setTerm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const res = await getActiveTerm();
        setTerm(res.data);
      } catch (error) {
        console.error('Failed to load terms');
      } finally {
        setLoading(false);
      }
    };
    fetchTerm();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-24 flex justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-3xl px-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!term) {
    return (
      <div className="min-h-screen bg-slate-50 py-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-slate-300 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-900">Document Unavailable</h1>
          <p className="text-slate-500">The Terms and Conditions are currently being updated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-100 pb-8 mb-8 text-center">
          <Shield className="w-12 h-12 text-slate-900 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">{term.title}</h1>
          <p className="text-sm font-bold text-slate-500 font-mono">
            Version: {term.version} • Last Updated: {new Date(term.updatedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="prose prose-slate prose-a:text-blue-600 hover:prose-a:text-blue-500 max-w-none">
          <ReactMarkdown>{term.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}