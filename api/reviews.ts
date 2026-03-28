import axiosInstance from './axiosInstance';

export const getProductReviews = async (productId: string) => {
  const response = await axiosInstance.get(`/reviews/product/${productId}`);
  return response.data;
};

export const addReview = async (data: { productId: string; rating: number; text?: string; media?: string[] }) => {
  const response = await axiosInstance.post('/reviews', data);
  return response.data;
};

export const addReviewComment = async (data: { reviewId: string; text: string }) => {
  const response = await axiosInstance.post('/reviews/comment', data);
  return response.data;
};