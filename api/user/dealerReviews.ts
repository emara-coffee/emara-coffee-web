import axiosInstance from '../axiosInstance';

export const submitDealerReview = async (data: any) => axiosInstance.post('/api/user/dealer-reviews', data);
export const updateMyDealerReview = async (reviewId: string, data: any) => axiosInstance.put(`/api/user/dealer-reviews/${reviewId}`, data);
export const deleteMyDealerReview = async (reviewId: string) => axiosInstance.delete(`/api/user/dealer-reviews/${reviewId}`);