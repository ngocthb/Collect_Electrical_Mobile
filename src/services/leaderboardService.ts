import axiosClient from '../config/axios';

export async function getLeaderboard() {
  const resp = await axiosClient.get(`Rank/leaderboard`, {
    params: {
      top: 10,
    },
  });
  return resp?.data ?? resp;
}

export async function getMyRank(userId: string) {
  if (!userId) return null;
  const resp = await axiosClient.get(`Rank/progress/${userId}`);
  return resp?.data ?? resp;
}
