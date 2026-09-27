import api from './api';

export async function listOffices() {
  const { data } = await api.get('/offices');
  return data.data;
}

export async function createOffice(payload) {
  const { data } = await api.post('/offices', payload);
  return data.data;
}