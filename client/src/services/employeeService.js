import api from './api';

function buildFormData(payload, photoFile) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  if (photoFile) formData.append('photo', photoFile);
  return formData;
}

export async function listEmployees(params = {}) {
  const { data } = await api.get('/employees', { params });
  return data.data;
}

export async function createEmployee(payload, photoFile) {
  const formData = buildFormData(payload, photoFile);
  const { data } = await api.post('/employees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function updateEmployee(id, payload, photoFile) {
  const formData = buildFormData(payload, photoFile);
  const { data } = await api.patch(`/employees/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deactivateEmployee(id) {
  const { data } = await api.delete(`/employees/${id}`);
  return data.data;
}