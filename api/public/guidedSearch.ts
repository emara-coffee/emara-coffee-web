import axiosInstance from '../axiosInstance';

export const getSearchBlueprints = async () => axiosInstance.get('/api/public/guided-search/blueprints');
export const getDynamicOptions = async (categoryId: string, data: any) => axiosInstance.post(`/api/public/guided-search/categories/${categoryId}/options`, data);
export const findMatchingProducts = async (categoryId: string, data: any) => axiosInstance.post(`/api/public/guided-search/categories/${categoryId}/results`, data);