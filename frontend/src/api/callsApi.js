import api from './axiosInstance';

export const callsApi = {
  getCalls: (params = {}) =>
    api.get('/calls', { params }).then(r => r.data),

  getCallStats: (params = {}) =>
    api.get('/calls/stats', { params }).then(r => r.data),

  logCall: (data) =>
    api.post('/calls', data).then(r => r.data),
};
