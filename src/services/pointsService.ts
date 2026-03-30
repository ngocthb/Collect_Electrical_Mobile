import axiosClient from '../config/axios';

export async function getUserPoints(userId: string) {
  if (!userId) return null;
  const resp = await axiosClient.get(`/points/${userId}`);

  return resp?.data ?? resp;
}

export async function getUserPointTransactions(userId: string) {
  if (!userId) return [];
  const resp = await axiosClient.get(`/points-transaction/${userId}`);
  return resp?.data ?? resp;
}

export async function dailyPoints(userId: string, points: number) {
  if (!userId) return null;
  const resp = await axiosClient.post(`/point/daily`, {
    userId,
    points,
  });
  return resp?.data ?? resp;
}

export default { getUserPoints, dailyPoints };
