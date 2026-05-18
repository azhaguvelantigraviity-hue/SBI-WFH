import api from './axiosInstance';

export const qdApi = {
  getQDs: (params = {}) =>
    api.get('/qd', { params }).then(r => r.data),

  getQDById: (id) =>
    api.get(`/qd/${id}`).then(r => r.data),

  submitQD: (data) =>
    api.post('/qd', data).then(r => r.data),

  updateQD: (id, data) =>
    api.patch(`/qd/${id}`, data).then(r => r.data),

  uploadDocs: (id, formData) =>
    api.post(`/qd/${id}/docs`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
};
