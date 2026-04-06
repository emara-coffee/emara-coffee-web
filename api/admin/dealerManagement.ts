import axiosInstance from '../axiosInstance';

export const createVerificationBlueprint = async (data: any) => axiosInstance.post('/api/admin/dealer-management/blueprints', data);
export const getVerificationBlueprints = async () => axiosInstance.get('/api/admin/dealer-management/blueprints');
export const getVerificationBlueprintById = async (id: string) => axiosInstance.get(`/api/admin/dealer-management/blueprints/${id}`);
export const updateVerificationBlueprint = async (id: string, data: any) => axiosInstance.put(`/api/admin/dealer-management/blueprints/${id}`, data);
export const toggleBlueprintStatus = async (id: string, data: any) => axiosInstance.patch(`/api/admin/dealer-management/blueprints/${id}/status`, data);
export const hardDeleteBlueprint = async (id: string) => axiosInstance.delete(`/api/admin/dealer-management/blueprints/${id}`);
export const getPaginatedDealers = async (params?: any) => axiosInstance.get('/api/admin/dealer-management/dealers', { params });
export const getDealerComplianceDetails = async (dealerId: string) => axiosInstance.get(`/api/admin/dealer-management/dealers/${dealerId}/compliance`);
export const reviewDealerSubmission = async (submissionId: string, data: any) => axiosInstance.patch(`/api/admin/dealer-management/submissions/${submissionId}/review`, data);
export const updateDealerSuspensionStatus = async (dealerId: string, data: any) => axiosInstance.patch(`/api/admin/dealer-management/dealers/${dealerId}/suspend`, data);
export const getDealerInventory = async (dealerId: string, params?: any) => axiosInstance.get(`/api/admin/dealer-management/dealers/${dealerId}/inventory`, { params });
export const getDealerSalesHistory = async (dealerId: string, params?: any) => axiosInstance.get(`/api/admin/dealer-management/dealers/${dealerId}/sales`, { params });