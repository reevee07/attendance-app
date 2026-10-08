import api from './api';

export async function selfPunch({ latitude, longitude, address }) {
  const { data } = await api.post('/attendance/punch', { latitude, longitude, address });
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

export async function trend(days = 7) {
  const { data } = await api.get('/attendance/trend', { params: { days } });
  return data.data;
}

export async function byOffice() {
  const { data } = await api.get('/attendance/by-office');
  return data.data;
}

export async function recent(limit = 10) {
  const { data } = await api.get('/attendance/recent', { params: { limit } });
  return data.data;
}

export async function employeeCalendar(id, month) {
  const { data } = await api.get(`/attendance/employee/${id}/calendar`, { params: { month } });
  return data.data;
}

export async function myCalendar(month) {
  const { data } = await api.get('/attendance/me/calendar', { params: { month } });
  return data.data;
}