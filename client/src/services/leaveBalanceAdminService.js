import api from './api';

export async function assignStandardLeave({ employeeCode, casualLeave, sickLeave, earnLeave }) {
  const { data } = await api.patch('/leave-balance/assign', {
    employeeCode,
    casualLeave,
    sickLeave,
    earnLeave,
  });
  return data.data;
}

export async function grantSpecialLeave({ employeeCode, amount }) {
  const { data } = await api.patch('/leave-balance/grant-special', { employeeCode, amount });
  return data.data;
}