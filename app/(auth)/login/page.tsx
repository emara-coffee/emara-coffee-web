"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { login, verifyOTP, resendOTP } from '@/api/auth/auth';
import { setCredentials } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';
import { Loader2, Mail, Lock, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(60);

  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') router.replace('/admin/categories');
      else if (user.role === 'DEALER') router.replace('/dealer/products');
      else router.replace('/shop');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await login({ email, password });

      if (data.token && data.user) {
        dispatch(setCredentials({ user: data.user, token: data.token }));

        if (data.user.role === 'ADMIN') router.push('/admin/categories');
        else if (data.user.role === 'DEALER') router.push('/dealer/products');
        else router.push('/shop');
      } else {
        setStep('otp');
        setCountdown(60);

        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');

      setLoading(false);
    }

  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await verifyOTP({ email, otp, type: 'LOGIN' });

      dispatch(setCredentials({ user: data.user, token: data.token }));


      if (data.user.role === 'ADMIN') router.push('/admin/dashboard');
      else if (data.user.role === 'DEALER') router.push('/dealer/dashboard');
      else router.push('/shop');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
      setLoading(false);
    }

  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      await resendOTP({ email, type: 'LOGIN' });
      setMessage('A new OTP has been sent to your email.');
      setCountdown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 h-[60vh] w-full bg-[linear-gradient(to_right,#0ea5e915_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e915_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Image src="/logo.svg" alt="Emara Coffee" width={64} height={64} className="h-16 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
        <p className="mt-2 text-center text-sm text-slate-500">Sign in to manage your account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-green-900/5 sm:rounded-3xl sm:px-10 border border-slate-100">

          {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">{error}</div>}
          {message && <div className="mb-4 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm border border-emerald-100">{message}</div>}

          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.form key="credentials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email address</label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors sm:text-sm outline-none"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors sm:text-sm outline-none"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-green-600 hover:text-green-500 transition-colors">Forgot your password?</a>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
                </button>
              </motion.form>
            ) : (
              <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6" onSubmit={handleVerifyOTP}>
                <div className="text-center">
                  <label className="block text-sm font-semibold text-slate-900">Security Check</label>
                  <p className="text-sm text-slate-500 mt-1 mb-4">We sent a verification code to <br /><span className="font-medium text-slate-700">{email}</span></p>
                  <input
                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6}
                    className="block w-full px-4 py-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-center tracking-[0.75em] font-bold text-2xl text-slate-900 outline-none transition-colors"
                    placeholder="------"
                  />
                </div>

                <button type="submit" disabled={loading || otp.length < 6} className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify & Secure Login'}
                </button>

                <div className="flex flex-col items-center justify-center pt-2 space-y-3">
                  {countdown > 0 ? (
                    <p className="text-sm text-slate-500">Resend code in <span className="font-semibold text-slate-900">{countdown}s</span></p>
                  ) : (
                    <button type="button" onClick={handleResendOTP} disabled={resendLoading} className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-2 transition-colors">
                      {resendLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />} Resend Code
                    </button>
                  )}

                  <button type="button" onClick={() => { setStep('credentials'); setPassword(''); setOtp(''); }} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                    &larr; Back to login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              New to Emara Coffee?{' '}
              <Link href="/register" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}