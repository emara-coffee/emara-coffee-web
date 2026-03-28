import axiosInstance from './axiosInstance';

export const createTicket = async (data: { subject: string; message: string }) => {
  const response = await axiosInstance.post('/tickets', data);
  return response.data;
};

export const getUserTickets = async () => {
  const response = await axiosInstance.get('/tickets/my-tickets');
  return response.data;
};

export const getTicketMessages = async (ticketId: string) => {
  const response = await axiosInstance.get(`/tickets/${ticketId}/messages`);
  return response.data;
};

export const addTicketMessage = async (data: { ticketId: string; message: string }) => {
  const response = await axiosInstance.post('/tickets/messages', data);
  return response.data;
};

export const getAllTickets = async () => {
  const response = await axiosInstance.get('/tickets/admin');
  return response.data;
};

export const updateTicketStatus = async (id: string, status: string) => {
  const response = await axiosInstance.put(`/tickets/admin/${id}/status`, { status });
  return response.data;
};