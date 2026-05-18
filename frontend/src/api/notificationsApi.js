import api from './axiosInstance';

export const notificationsApi = {
  getNotifications: () =>
    api.get('/notifications').then(r => r.data),

  markAsRead: (id) =>
    api.patch('/notifications/mark-read', { id }).then(r => r.data),
};
