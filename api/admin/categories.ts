import axiosInstance from '../axiosInstance';

export const createCategory = async (data: any) => axiosInstance.post('/api/admin/categories', data);
export const getPaginatedCategories = async (params?: any) => axiosInstance.get('/api/admin/categories', { params });
export const getCategoryById = async (id: string) => axiosInstance.get(`/api/admin/categories/${id}`);
export const updateCategoryDetails = async (id: string, data: any) => axiosInstance.patch(`/api/admin/categories/${id}/details`, data);
export const updateSearchBlueprint = async (id: string, data: any) => axiosInstance.put(`/api/admin/categories/${id}/blueprint`, data);
export const updateCategoryStatus = async (id: string, data: any) => axiosInstance.patch(`/api/admin/categories/${id}/status`, data);
export const hardDeleteCategory = async (id: string) => axiosInstance.delete(`/api/admin/categories/${id}/hard-delete`);