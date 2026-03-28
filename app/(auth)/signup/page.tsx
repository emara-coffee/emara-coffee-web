'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, User, ArrowRight, Loader2 } from 'lucide-react';
import { requestOtp, signupUser } from '@/api/auth';
import { setCredentials } from '@/store/slices/authSlice';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await signupUser(formData);
      dispatch(setCredentials({
        user: response.user,
        token: response.token,
      }));
      router.push('/shop');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
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
            {step === 1 ? 'Join the community' : 'Verify your email'}
          </h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={step === 1 ? handleRequestOtp : handleSignup} className="space-y-5">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-[#E67E22] focus:border-[#E67E22] sm:text-sm transition-colors"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-[#E67E22] focus:border-[#E67E22] sm:text-sm transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>

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
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-[#E67E22] focus:border-[#E67E22] sm:text-sm transition-colors"
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
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-[#E67E22] focus:border-[#E67E22] sm:text-sm transition-colors"
                      placeholder="Min. 6 characters"
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
                  ← Edit registration details
                </button>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#E67E22] hover:bg-[#c96d1c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E67E22] transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : step === 1 ? (
                <>Send Verification Code <ArrowRight className="w-4 h-4" /></>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already a member?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login" className="font-bold text-[#E67E22] hover:text-[#c96d1c] transition-colors">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}