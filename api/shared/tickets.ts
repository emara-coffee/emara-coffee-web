import axiosInstance from '../axiosInstance';

export const createTicket = async (data: any) => axiosInstance.post('/api/shared/tickets', data);
export const getMyTickets = async (params?: any) => axiosInstance.get('/api/shared/tickets', { params });
export const getTicketDetails = async (ticketId: string, params?: any) => axiosInstance.get(`/api/shared/tickets/${ticketId}`, { params });
export const postTicketMessage = async (ticketId: string, data: any) => axiosInstance.post(`/api/shared/tickets/${ticketId}/messages`, data);
export const resolveMyTicket = async (ticketId: string) => axiosInstance.patch(`/api/shared/tickets/${ticketId}/resolve`);
export const requestCallback = async (ticketId: string) => axiosInstance.patch(`/api/shared/tickets/${ticketId}/callback`);