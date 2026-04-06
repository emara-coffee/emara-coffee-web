import axiosInstance from '../axiosInstance';

export const processCheckout = async (data: any) => axiosInstance.post('/api/shared/checkout/process', data);
export const captureCheckout = async (data: { orderId: string }) => axiosInstance.post('/api/shared/checkout/capture', data);
export const getMyOrdersList = async (params?: any) => axiosInstance.get('/api/shared/checkout/my-orders', { params });