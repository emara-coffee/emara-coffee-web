// "use client";

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { useDispatch } from 'react-redux';
// import ReCAPTCHA from 'react-google-recaptcha';
// import { register, verifyOTP, resendOTP } from '@/api/auth/auth';
// import { updateMyProfile } from '@/api/shared/profile';
// import { setCredentials, updateUserMetadata } from '@/store/slices/authSlice';
// import { Loader2, Mail, Lock, RefreshCw, Eye, EyeOff, User, Store } from 'lucide-react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { motion, AnimatePresence } from 'framer-motion';

// export default function RegisterPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const recaptchaRef = useRef<ReCAPTCHA>(null);

//   const [role, setRole] = useState<'USER' | 'DEALER'>('USER');
//   const [step, setStep] = useState<'REGISTER' | 'OTP' | 'ONBOARDING'>('REGISTER');

//   const [loading, setLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [countdown, setCountdown] = useState(60);

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [captchaToken, setCaptchaToken] = useState<string | null>(null);

//   const [metadata, setMetadata] = useState({
//     firstName: '', lastName: '', mobileNumber: '', dob: '', gender: 'MALE'
//   });

//   const [settings, setSettings] = useState({
//     isTwoFactorEnabled: true
//   });

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (step === 'OTP' && countdown > 0) {
//       timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(timer);
//   }, [step, countdown]);

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (password !== confirmPassword) return setError('Passwords do not match');
//     if (!captchaToken) return setError('Captcha verification is required');

//     setLoading(true);
//     setError('');

//     try {
//       await register({ email, password, role, captchaToken });
//       setStep('OTP');
//       setCountdown(60);
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Registration failed');
//       recaptchaRef.current?.reset();
//       setCaptchaToken(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const { data } = await verifyOTP({ email, otp, type: 'REGISTER' });

//       dispatch(setCredentials({ user: data.user, token: data.token }));
//       setStep('ONBOARDING');
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Invalid or expired OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOnboarding = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const { data } = await updateMyProfile({ metadata, settings });
//       dispatch(updateUserMetadata(data.metadata));

//       if (role === 'DEALER') {
//         router.push('/dealer/products');
//       } else {
//         router.push('/shop');
//       }
//     } catch (err: any) {
//       setError('Failed to update profile. Please try again.');
//       setLoading(false);
//     }

//   };

//   const handleResendOTP = async () => {
//     setResendLoading(true);
//     setError('');
//     try {
//       await resendOTP({ email, type: 'REGISTER' });
//       setCountdown(60);
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Failed to resend OTP');
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
//       <div className="absolute inset-0 z-0 h-[60vh] w-full bg-[linear-gradient(to_right,#0ea5e915_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e915_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

//       <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
//         <div className="flex justify-center">
//           <Image src="/logo.svg" alt="Emara Coffee" width={64} height={64} className="h-16 w-auto" />
//         </div>
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
//           {step === 'ONBOARDING' ? 'Complete your profile' : 'Create an account'}
//         </h2>
//         <p className="mt-2 text-center text-sm text-slate-500">
//           {step === 'ONBOARDING' ? 'Just a few more details to get started.' : `Registering as a ${role === 'USER' ? 'Customer' : 'Dealer'}`}
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
//         <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-green-900/5 sm:rounded-3xl sm:px-10 border border-slate-100">

//           {error && <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">{error}</div>}

//           <AnimatePresence mode="wait">
//             {step === 'REGISTER' && (
//               <motion.div key="register" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
//                 <form className="space-y-5" onSubmit={handleRegister}>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700">Email address</label>
//                     <div className="mt-1 relative">
//                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                       <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" placeholder="you@company.com" />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700">Password</label>
//                     <div className="mt-1 relative">
//                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                       <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" placeholder="••••••••" />
//                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
//                         {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                       </button>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
//                     <div className="mt-1 relative">
//                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                       <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" placeholder="••••••••" />
//                     </div>
//                   </div>

//                   <div className="flex justify-center py-2">
//                     <ReCAPTCHA
//                       ref={recaptchaRef}
//                       sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
//                       onChange={(token) => setCaptchaToken(token)}
//                     />
//                   </div>

//                   <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">
//                     {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Continue'}
//                   </button>
//                 </form>

//                 <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
//                   <button onClick={() => setRole(role === 'USER' ? 'DEALER' : 'USER')} className="text-sm font-medium text-slate-600 flex items-center gap-2 hover:text-green-600 transition-colors">
//                     {role === 'USER' ? <><Store className="h-4 w-4" /> Register as a Dealer instead</> : <><User className="h-4 w-4" /> Register as a Customer instead</>}
//                   </button>
//                   <p className="text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-green-600 hover:text-green-700">Log in</Link></p>
//                 </div>
//               </motion.div>
//             )}

//             {step === 'OTP' && (
//               <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6" onSubmit={handleVerifyOTP}>
//                 <div className="text-center">
//                   <p className="text-sm text-slate-500 mb-4">Enter the verification code sent to <br /><span className="font-medium text-slate-700">{email}</span></p>
//                   <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="block w-full px-4 py-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 text-center tracking-[0.75em] font-bold text-2xl text-slate-900" placeholder="------" />
//                 </div>
//                 <button type="submit" disabled={loading || otp.length < 6} className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700">
//                   {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify Code'}
//                 </button>
//                 <div className="text-center pt-2">
//                   {countdown > 0 ? (
//                     <p className="text-sm text-slate-500">Resend code in <span className="font-semibold text-slate-900">{countdown}s</span></p>
//                   ) : (
//                     <button type="button" onClick={handleResendOTP} disabled={resendLoading} className="text-sm font-medium text-green-600 flex items-center justify-center gap-2 mx-auto">
//                       {resendLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />} Resend Code
//                     </button>
//                   )}
//                 </div>
//               </motion.form>
//             )}

//             {step === 'ONBOARDING' && (
//               <motion.form key="onboarding" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5" onSubmit={handleOnboarding}>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
//                     <input type="text" required value={metadata.firstName} onChange={(e) => setMetadata({ ...metadata, firstName: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
//                     <input type="text" required value={metadata.lastName} onChange={(e) => setMetadata({ ...metadata, lastName: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
//                   <input type="tel" required value={metadata.mobileNumber} onChange={(e) => setMetadata({ ...metadata, mobileNumber: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
//                     <input type="date" required value={metadata.dob} onChange={(e) => setMetadata({ ...metadata, dob: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
//                     <select required value={metadata.gender} onChange={(e) => setMetadata({ ...metadata, gender: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm">
//                       <option value="MALE">Male</option>
//                       <option value="FEMALE">Female</option>
//                       <option value="OTHER">Other</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 mt-4">
//                   <div>
//                     <p className="font-bold text-slate-700 text-sm">Two-Factor Authentication</p>
//                     <p className="text-xs text-slate-500">Require an OTP when logging in.</p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setSettings(prev => ({ ...prev, isTwoFactorEnabled: !prev.isTwoFactorEnabled }))}
//                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isTwoFactorEnabled ? 'bg-green-600' : 'bg-slate-300'}`}
//                   >
//                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isTwoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
//                   </button>
//                 </div>

//                 <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 mt-6">
//                   {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Complete Setup'}
//                 </button>
//               </motion.form>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import ReCAPTCHA from 'react-google-recaptcha';
import { register } from '@/api/auth/auth';
import { updateMyProfile } from '@/api/shared/profile';
import { setCredentials, updateUserMetadata } from '@/store/slices/authSlice';
import { Loader2, Mail, Lock, Eye, EyeOff, User, Store } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [role, setRole] = useState<'USER' | 'DEALER'>('USER');
  const [step, setStep] = useState<'REGISTER' | 'ONBOARDING'>('REGISTER');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [metadata, setMetadata] = useState({
    firstName: '', lastName: '', mobileNumber: '', dob: '', gender: 'MALE'
  });

  const [settings, setSettings] = useState({
    isTwoFactorEnabled: false
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!captchaToken) return setError('Captcha verification is required');

    setLoading(true);
    setError('');

    try {
      const { data } = await register({ email, password, role, captchaToken });
      dispatch(setCredentials({ user: data.user, token: data.token }));
      setStep('ONBOARDING');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await updateMyProfile({ metadata, settings });
      dispatch(updateUserMetadata(data.metadata));

      if (role === 'DEALER') {
        router.push('/dealer/products');
      } else {
        router.push('/shop');
      }
    } catch (err: any) {
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 h-[60vh] w-full bg-[linear-gradient(to_right,#0ea5e915_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e915_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Image src="/logo.svg" alt="Emara Coffee" width={64} height={64} className="h-16 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {step === 'ONBOARDING' ? 'Complete your profile' : 'Create an account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {step === 'ONBOARDING' ? 'Just a few more details to get started.' : `Registering as a ${role === 'USER' ? 'Customer' : 'Dealer'}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-green-900/5 sm:rounded-3xl sm:px-10 border border-slate-100">

          {error && <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">{error}</div>}

          <AnimatePresence mode="wait">
            {step === 'REGISTER' && (
              <motion.div key="register" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <form className="space-y-5" onSubmit={handleRegister}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email address</label>
                    <div className="mt-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" placeholder="you@company.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" placeholder="••••••••" />
                    </div>
                  </div>

                  <div className="flex justify-center py-2">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                      onChange={(token) => setCaptchaToken(token)}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Continue'}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                  <button onClick={() => setRole(role === 'USER' ? 'DEALER' : 'USER')} className="text-sm font-medium text-slate-600 flex items-center gap-2 hover:text-green-600 transition-colors">
                    {role === 'USER' ? <><Store className="h-4 w-4" /> Register as a Dealer instead</> : <><User className="h-4 w-4" /> Register as a Customer instead</>}
                  </button>
                  <p className="text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-green-600 hover:text-green-700">Log in</Link></p>
                </div>
              </motion.div>
            )}

            {step === 'ONBOARDING' && (
              <motion.form key="onboarding" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5" onSubmit={handleOnboarding}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" required value={metadata.firstName} onChange={(e) => setMetadata({ ...metadata, firstName: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" required value={metadata.lastName} onChange={(e) => setMetadata({ ...metadata, lastName: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input type="tel" required value={metadata.mobileNumber} onChange={(e) => setMetadata({ ...metadata, mobileNumber: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" required value={metadata.dob} onChange={(e) => setMetadata({ ...metadata, dob: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select required value={metadata.gender} onChange={(e) => setMetadata({ ...metadata, gender: e.target.value })} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:text-sm">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 mt-6">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Complete Setup'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}