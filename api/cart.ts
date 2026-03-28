import axiosInstance from './axiosInstance';

export const getCart = async () => {
  const response = await axiosInstance.get('/cart');
  return response.data;
};

export const addToCart = async (data: { productId: string; quantity: number }) => {
  const response = await axiosInstance.post('/cart', data);
  return response.data;
};

export const removeFromCart = async (itemId: string) => {
  const response = await axiosInstance.delete(`/cart/${itemId}`);
  return response.data;
};