import axiosInstance from '../axiosInstance';

export const markAllNotificationsAsSeen = async () => axiosInstance.patch('/api/shared/notifications/seen-all');
export const getPaginatedNotifications = async (params?: any) => axiosInstance.get('/api/shared/notifications', { params });
export const getNotificationById = async (id: string) => axiosInstance.get(`/api/shared/notifications/${id}`);
export const markNotificationAsSeen = async (id: string) => axiosInstance.patch(`/api/shared/notifications/${id}/seen`);
export const archiveNotification = async (id: string) => axiosInstance.patch(`/api/shared/notifications/${id}/archive`);
export const deleteNotification = async (id: string) => axiosInstance.delete(`/api/shared/notifications/${id}`);