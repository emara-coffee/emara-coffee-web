import axiosInstance from '../axiosInstance';

export const getActiveTerm = async () => axiosInstance.get('/api/public/terms/active');