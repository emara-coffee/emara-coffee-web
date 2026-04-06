import axiosInstance from '../axiosInstance';

export const register = async (data: any) => axiosInstance.post('/api/auth/register', data);
export const login = async (data: any) => axiosInstance.post('/api/auth/login', data);
export const verifyOTP = async (data: any) => axiosInstance.post('/api/auth/verify-otp', data);
export const resendOTP = async (data: any) => axiosInstance.post('/api/auth/resend-otp', data);
export const forgotPassword = async (data: any) => axiosInstance.post('/api/auth/forgot-password', data);
export const resetPassword = async (data: any) => axiosInstance.post('/api/auth/reset-password', data);
export const refreshAccessToken = async () => axiosInstance.post('/api/auth/refresh-token');
export const logout = async () => axiosInstance.post('/api/auth/logout');