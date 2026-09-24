import api from './api';

export async function selfPunch({ latitude, longitude, photoBlob }) {
  const formData = new FormData();
  formData.append('latitude', latitude);
  formData.append('longitude', longitude);
  formData.append('photo', photoBlob, 'punch.jpg');

  const { data } = await api.post('/attendance/punch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function adminPunch({ employeeId, type, note }) {
  const { data } = await api.post('/attendance/admin-punch', { employeeId, type, note });
  return data.data;
}

export async function myHistory(params = {}) {
  const { data } = await api.get('/attendance/me', { params });
  return data.data;
}

export async function employeeHistory(id, params = {}) {
  const { data } = await api.get(`/attendance/employee/${id}`, { params });
  return data.data;
}

export async function dailySummary(date) {
  const { data } = await api.get('/attendance/summary', { params: { date } });
  return data.data;
}
