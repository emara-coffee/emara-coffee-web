import axiosInstance from '../axiosInstance';

export const fetchActiveDealers = async (search?: string) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return axiosInstance.get(`/api/public/dealers${query}`);
};

export const fetchDealerById = async (id: string) => {
  return axiosInstance.get(`/api/public/dealers/${id}`);
};