import axiosInstance from '../axiosInstance';

export const addArticleComment = async (data: any) => axiosInstance.post('/api/user/article-interactions/comments', data);
export const updateArticleComment = async (commentId: string, data: any) => axiosInstance.put(`/api/user/article-interactions/comments/${commentId}`, data);
export const deleteMyArticleComment = async (commentId: string) => axiosInstance.delete(`/api/user/article-interactions/comments/${commentId}`);
export const castArticleVote = async (data: any) => axiosInstance.post('/api/user/article-interactions/votes', data);