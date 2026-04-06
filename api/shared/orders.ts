import axiosInstance from '../axiosInstance';

export const getDetailedOrders = async (params?: any) => axiosInstance.get('/api/shared/orders', { params });
export const getOrderById = async (orderId: string) => axiosInstance.get(`/api/shared/orders/${orderId}`);
export const cancelOrder = async (orderId: string, data: any) => axiosInstance.patch(`/api/shared/orders/${orderId}/cancel`, data);