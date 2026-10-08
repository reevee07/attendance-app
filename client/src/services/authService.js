import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data; // { token, user }
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data.data;
}


export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.patch('/auth/change-password', { currentPassword, newPassword });
  return data;
}