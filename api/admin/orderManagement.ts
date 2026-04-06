import axiosInstance from '../axiosInstance';

export const getAllOrders = async (params?: any) => axiosInstance.get('/api/admin/order-management', { params });
export const updateOrderStatus = async (orderId: string, data: any) => axiosInstance.patch(`/api/admin/order-management/${orderId}/status`, data);
export const updateRefundStatus = async (orderId: string, data: any) => axiosInstance.patch(`/api/admin/order-management/${orderId}/refund`, data);