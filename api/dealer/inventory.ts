import axiosInstance from '../axiosInstance';

export const getMyInventory = async (params?: any) => 
  axiosInstance.get('/api/dealer/inventory', { params });

export const getMySalesHistory = async (params?: any) => 
  axiosInstance.get('/api/dealer/inventory/sales', { params });

export const logManualSale = async (data: any) => 
  axiosInstance.post('/api/dealer/inventory/sales', data);