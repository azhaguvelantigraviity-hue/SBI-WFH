import api from './axiosInstance';

export const dashboardApi = {
  getStats: () =>
    api.get('/dashboard/stats').then(r => r.data),

  getAgentStats: () =>
    api.get('/dashboard/agent-stats').then(r => r.data),
};
