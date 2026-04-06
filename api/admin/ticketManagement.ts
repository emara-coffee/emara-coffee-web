import axiosInstance from '../axiosInstance';

export const getAllTickets = async (params?: any) => axiosInstance.get('/api/admin/ticket-management', { params });
export const updateTicketStatus = async (ticketId: string, data: any) => axiosInstance.patch(`/api/admin/ticket-management/${ticketId}/status`, data);