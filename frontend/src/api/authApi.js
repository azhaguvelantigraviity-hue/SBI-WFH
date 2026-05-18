import api from './axiosInstance';

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then(r => r.data),

  register: (data) =>
    api.post('/auth/register', data).then(r => r.data),

  getMe: () =>
    api.get('/auth/me').then(r => r.data),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then(r => r.data),
};
