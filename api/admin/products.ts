import axiosInstance from '../axiosInstance';

export const createProduct = async (formData: FormData) => axiosInstance.post('/api/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getPaginatedProducts = async (params?: any) => axiosInstance.get('/api/admin/products', { params });
export const getProductById = async (id: string) => axiosInstance.get(`/api/admin/products/${id}`);
export const updateProductBaseDetails = async (id: string, data: any) => axiosInstance.patch(`/api/admin/products/${id}/details`, data);
export const updateProductCompatibilities = async (id: string, data: any) => axiosInstance.put(`/api/admin/products/${id}/compatibilities`, data);
export const updateProductStatus = async (id: string, data: any) => axiosInstance.patch(`/api/admin/products/${id}/status`, data);
export const hardDeleteProduct = async (id: string) => axiosInstance.delete(`/api/admin/products/${id}/hard-delete`);
export const getProductReviews = async (productId: string, params?: any) => axiosInstance.get(`/api/admin/products/${productId}/reviews`, { params });
export const toggleProductReviewStatus = async (reviewId: string, data: any) => axiosInstance.patch(`/api/admin/products/reviews/${reviewId}/status`, data);