import axiosInstance from '../axiosInstance';

export const createTerm = async (data: any) => axiosInstance.post('/api/admin/terms', data);
export const updateTerm = async (id: string, data: any) => axiosInstance.put(`/api/admin/terms/${id}`, data);
export const getPaginatedTerms = async (params?: any) => axiosInstance.get('/api/admin/terms', { params });
export const activateTerm = async (id: string) => axiosInstance.put(`/api/admin/terms/${id}/activate`);
export const deleteTerm = async (id: string) => axiosInstance.delete(`/api/admin/terms/${id}`);