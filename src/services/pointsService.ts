import axiosClient from '../config/axios';

export async function getUserPoints(userId: string) {
  if (!userId) return null;
  const resp = await axiosClient.get(`/points/${userId}`);
  return resp?.data ?? resp;
}

export default { getUserPoints };
