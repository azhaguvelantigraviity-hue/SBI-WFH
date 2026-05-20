import api from './axiosInstance';

export const leadsApi = {
  getLeads: (params = {}) =>
    api.get('/leads', { params }).then(r => r.data),

  getLeadById: (id) =>
    api.get(`/leads/${id}`).then(r => r.data),

  createLead: (data) =>
    api.post('/leads', data).then(r => r.data),

  updateLead: (id, data) =>
    api.patch(`/leads/${id}`, data).then(r => r.data),

  deleteLead: (id) =>
    api.delete(`/leads/${id}`).then(r => r.data),

  bulkImport: (leads, autoAssign = false) =>
    api.post('/leads/bulk-import', { leads, autoAssign }).then(r => r.data),

  bulkAssign: (leadIds, assigned_to) =>
    api.post('/leads/bulk-assign', { leadIds, assigned_to }).then(r => r.data),

  requestLeads: () =>
    api.post('/leads/request').then(r => r.data),
};
