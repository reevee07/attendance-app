import api from './api';

export async function requestLeave(payload) {
  const { data } = await api.post('/leaves', payload);
  return data.data;
}

export async function listMine() {
  const { data } = await api.get('/leaves/mine');
  return data.data;
}


export async function listPendingLeaves() {
  const { data } = await api.get('/leaves/pending');
  return data.data;
}

export async function decideLeave(id, decision) {
  const { data } = await api.patch(`/leaves/${id}/decision`, { decision });
  return data.data;
}

export async function todayLeaveCount() {
  const { data } = await api.get('/leaves/today-count');
  return data.data.count;
}


