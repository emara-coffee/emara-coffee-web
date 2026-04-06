import axiosInstance from '../axiosInstance';

export const getPaginatedUsers = async (params?: any) => axiosInstance.get('/api/admin/users', { params });
export const getUserDetails = async (id: string) => axiosInstance.get(`/api/admin/users/${id}`);
export const updateUserStatus = async (id: string, data: any) => axiosInstance.patch(`/api/admin/users/${id}/status`, data);
export const sendCustomNotification = async (id: string, data: any) => axiosInstance.post(`/api/admin/users/${id}/notify`, data);
export const sendBulkNotification = async (data: any) => axiosInstance.post('/api/admin/users/bulk-notify', data);
export const hardDeleteUser = async (id: string) => axiosInstance.delete(`/api/admin/users/${id}`);