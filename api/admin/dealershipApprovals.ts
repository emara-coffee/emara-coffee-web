import axiosInstance from '../axiosInstance';

export const getAllDealershipRequests = async (params?: any) => axiosInstance.get('/api/admin/dealership-approvals/requests', { params });
export const updateDealershipStatus = async (dealerId: string, productId: string, data: any) => axiosInstance.patch(`/api/admin/dealership-approvals/requests/${dealerId}/${productId}`, data);