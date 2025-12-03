import axiosClient from '../config/axios';
import { ProductDetail } from '../types/Product';

export async function getProductsByUser(userId: string) {
  if (!userId) return [];
  const resp = await axiosClient.get(`/products/user/${userId}`);
  return Array.isArray(resp) ? resp : resp?.data ?? [];
}

export async function getProductById(
  productId: string,
): Promise<ProductDetail> {
  const resp = (await axiosClient.get(
    `/products/${productId}`,
  )) as ProductDetail;
  return resp || null;
}

export default { getProductsByUser, getProductById };
