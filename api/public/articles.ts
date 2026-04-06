import axiosInstance from '../axiosInstance';

export const getPaginatedArticles = async (params?: any) => axiosInstance.get('/api/public/articles', { params });
export const getTrendingArticles = async () => axiosInstance.get('/api/public/articles/trending');
export const getArticleBySlug = async (slug: string) => axiosInstance.get(`/api/public/articles/${slug}`);