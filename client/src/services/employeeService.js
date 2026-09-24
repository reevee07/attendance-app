import api from './api';

export async function listEmployees(params = {}) {
  const { data } = await api.get('/employees', { params });
  return data.data;
}

export async function createEmployee(payload) {
  const { data } = await api.post('/employees', payload);
  return data.data;
}

export async function updateEmployee(id, payload) {
  const { data } = await api.patch(`/employees/${id}`, payload);
  return data.data;
}

export async function deactivateEmployee(id) {
  const { data } = await api.delete(`/employees/${id}`);
  return data.data;
}
