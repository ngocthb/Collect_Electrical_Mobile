import axiosClient from '../config/axios';

export async function getProductsByUser(userId: string) {
  if (!userId) return [];
  const resp = await axiosClient.get(`/products/user/${userId}`);
  return Array.isArray(resp) ? resp : resp?.data ?? [];
}

export default { getProductsByUser };
