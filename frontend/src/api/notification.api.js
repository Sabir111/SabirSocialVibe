import API from './axios';

export const notificationAPI = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.patch(`/notifications/${id}/read`),
};

