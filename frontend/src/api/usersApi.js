import api from './axiosInstance';

export const usersApi = {
  getUsers: (params = {}) =>
    api.get('/users', { params }).then(r => r.data),

  createUser: (data) =>
    api.post('/auth/register', data).then(r => r.data),

  getUserById: (id) =>
    api.get(`/users/${id}`).then(r => r.data),

  updateUser: (id, data) =>
    api.patch(`/users/${id}`, data).then(r => r.data),

  deleteUser: (id) =>
    api.delete(`/users/${id}`).then(r => r.data),
};
