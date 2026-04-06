import axiosInstance from '../axiosInstance';

export const getMyProfile = async () => axiosInstance.get('/api/shared/profile');
export const updateMyProfile = async (data: any) => axiosInstance.patch('/api/shared/profile', data);