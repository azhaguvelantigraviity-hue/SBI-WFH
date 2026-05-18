import api from './axiosInstance';

export const incentivesApi = {
  getIncentives: (params = {}) =>
    api.get('/incentives', { params }).then(r => r.data),

  generateIncentives: (data) =>
    api.post('/incentives/generate', data).then(r => r.data),

  markPaid: (id, remarks = '') =>
    api.patch(`/incentives/${id}/pay`, { remarks }).then(r => r.data),
};
