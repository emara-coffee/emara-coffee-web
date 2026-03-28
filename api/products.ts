import axiosInstance from './axiosInstance';

export const getProducts = async (params?: any) => {
  const response = await axiosInstance.get('/products', { params });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: any) => {
  const response = await axiosInstance.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: any) => {
  const response = await axiosInstance.put(`/products/${id}`, data);
  return response.data;
};