'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { requestOtp, loginUser } from '@/api/auth';
import { setCredentials } from '@/store/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await requestOtp({ email: formData.email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await loginUser(formData);
      dispatch(setCredentials({
        user: response.user,
        token: response.token,
      }));
      
      if (response.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/shop');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Link href="/" className="flex justify-center items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#E67E22] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">EC</span>
          </div>
          <span className="font-bold text-3xl text-white tracking-tight">
            EMARA
          </span>
        </Link>
        
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <h2 className="text-center text-2xl font-bold text-[#2B160A] mb-8">
            {step === 1 ? 'Welcome back' : 'Verify your identity'}
          </h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={step === 1 ? handleRequestOtp : handleLogin} className="space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#E67E22] focus:border-[#E67E22] sm:text-sm transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#E67E22] focus:border-[#E67E22] sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  One-Time Password (OTP)
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  We've sent a 6-digit code to <span className="font-semibold text-[#E67E22]">{formData.email}</span>
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#E67E22] focus:border-[#E67E22] sm:text-sm transition-colors text-center tracking-widest font-bold text-lg"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-4 text-sm text-gray-500 hover:text-[#E67E22] font-medium transition-colors"
                >
                  ← Back to login details
                </button>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#E67E22] hover:bg-[#c96d1c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E67E22] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : step === 1 ? (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              ) : (
                'Sign In securely'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Emara?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/signup" className="font-bold text-[#E67E22] hover:text-[#c96d1c] transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}