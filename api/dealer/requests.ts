import axiosInstance from '../axiosInstance';

export const requestDealership = async (data: any) => axiosInstance.post('/api/dealer/requests/request', data);
export const getMyProductRequests = async (params?: any) => axiosInstance.get('/api/dealer/requests/my-requests', { params });
export const cancelDealershipRequest = async (productId: string) => axiosInstance.delete(`/api/dealer/requests/request/${productId}`);