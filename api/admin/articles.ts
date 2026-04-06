import axiosInstance from '../axiosInstance';

export const getPaginatedArticles = async (params?: any) => axiosInstance.get('/api/admin/articles', { params });
export const createArticle = async (formData: FormData) => axiosInstance.post('/api/admin/articles', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateArticle = async (id: string, data: any) => axiosInstance.patch(`/api/admin/articles/${id}`, data);
export const updateArticleStatus = async (id: string, data: any) => axiosInstance.patch(`/api/admin/articles/${id}/status`, data);

export const getArticleComments = async (articleId: string, params?: any) => axiosInstance.get(`/api/admin/articles/${articleId}/comments`, { params });
export const toggleArticleCommentStatus = async (commentId: string, data: any) => axiosInstance.patch(`/api/admin/articles/comments/${commentId}/status`, data);
export const deleteArticleComment = async (commentId: string) => axiosInstance.delete(`/api/admin/articles/comments/${commentId}`);