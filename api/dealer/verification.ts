import axiosInstance from '../axiosInstance';

export const getVerificationRequirements = async () => axiosInstance.get('/api/dealer/verification/requirements');

export const submitVerificationData = async (data: FormData) => {
  return axiosInstance.post('/api/dealer/verification/submit', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};