import axiosInstance from './axiosInstance';

export const getUserAddresses = async () => {
  const response = await axiosInstance.get('/addresses');
  return response.data;
};

export const addAddress = async (data: any) => {
  const response = await axiosInstance.post('/addresses', data);
  return response.data;
};