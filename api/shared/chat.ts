import axiosInstance from '../axiosInstance';

const getCacheBuster = () => `_t=${Date.now()}`;

export const initializeChat = async (data: { targetUserId: string }) => axiosInstance.post('/api/shared/chat/initialize', data);

export const getMyConversations = async () => axiosInstance.get(`/api/shared/chat/conversations?${getCacheBuster()}`);

export const getChatHistory = async (targetUserId: string, params: any = {}) => {
  const queryParams = new URLSearchParams({ ...params, _t: Date.now().toString() }).toString();
  return axiosInstance.get(`/api/shared/chat/history/${targetUserId}?${queryParams}`);
};

export const sendChatMessage = async (data: any) => axiosInstance.post('/api/shared/chat/send', data);
export const updateMessageStatus = async (messageId: string, data: any) => axiosInstance.patch(`/api/shared/chat/status/${messageId}`, data);