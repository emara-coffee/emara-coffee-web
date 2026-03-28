import axiosInstance from './axiosInstance';

export const placeOrder = async (data: { addressId: string }) => {
  const response = await axiosInstance.post('/orders', data);
  return response.data;
};

export const getUserOrders = async () => {
  const response = await axiosInstance.get('/orders/my-orders');
  return response.data;
};

export const cancelOrder = async (id: string) => {
  const response = await axiosInstance.put(`/orders/${id}/cancel`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await axiosInstance.get('/orders/admin');
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await axiosInstance.put(`/orders/admin/${id}/status`, { status });
  return response.data;
};

export const updateRefundStatus = async (id: string, refundStatus: string) => {
  const response = await axiosInstance.put(`/orders/admin/${id}/refund`, { refundStatus });
  return response.data;
};