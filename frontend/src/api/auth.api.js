import API from './axios';

export const authAPI = {
  register: (data) => API.post('/users/register', data),
  login: (data) => API.post('/users/login', data),
  logout: () => API.post('/users/logout'),
  getCurrentUser: () => API.get('/users/current-user'),
  refreshToken: () => API.post('/users/refresh-token'),
  changePassword: (data) => API.post('/users/change-password', data),
  updateAccount: (data) => API.patch('/users/update-account', data),
  updateAvatar: (formData) => API.patch('/users/update-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserProfile: (username) => API.get(`/users/profile/${username}`),
};

