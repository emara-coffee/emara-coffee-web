import axiosInstance from '../axiosInstance';

export const submitProductReview = async (data: any) => axiosInstance.post('/api/user/product-reviews', data);
export const updateMyProductReview = async (reviewId: string, data: any) => axiosInstance.put(`/api/user/product-reviews/${reviewId}`, data);
export const deleteMyProductReview = async (reviewId: string) => axiosInstance.delete(`/api/user/product-reviews/${reviewId}`);