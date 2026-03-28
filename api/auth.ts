import axiosInstance from './axiosInstance';

export const requestOtp = async (data: { email: string }) => {
  const response = await axiosInstance.post('/auth/request-otp', data);
  return response.data;
};

export const signupUser = async (data: any) => {
  const response = await axiosInstance.post('/auth/signup', data);
  return response.data;
};

export const loginUser = async (data: any) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};