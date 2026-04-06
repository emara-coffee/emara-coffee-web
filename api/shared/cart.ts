import axiosInstance from '../axiosInstance';

export const getMyCart = async () => axiosInstance.get('/api/shared/cart');
export const addToCart = async (data: any) => axiosInstance.post('/api/shared/cart/add', data);
export const removeFromCart = async (itemId: string) => axiosInstance.delete(`/api/shared/cart/item/${itemId}`);
export const clearMyCart = async () => axiosInstance.delete('/api/shared/cart/clear');
export const updateCartItemQuantity = async (itemId: string, quantity: number) => axiosInstance.put(`/api/shared/cart/item/${itemId}`, { quantity });