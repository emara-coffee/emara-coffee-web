import axiosInstance from '../axiosInstance';

export const createArticleCategory = async (data: any) => axiosInstance.post('/api/admin/article-categories', data);
export const updateArticleCategory = async (id: string, data: any) => axiosInstance.patch(`/api/admin/article-categories/${id}`, data);
export const deleteArticleCategory = async (id: string) => axiosInstance.delete(`/api/admin/article-categories/${id}`);
export const getPaginatedArticleCategories = async (params?: any) => axiosInstance.get('/api/admin/article-categories', { params });
