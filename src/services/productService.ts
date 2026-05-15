import axiosClient from '../config/axios';
import { ProductDetail } from '../types/Product';

export async function getProductsByUser(
  userId: string,
  page: number = 1,
  search: string = '',
  createAt: string = '',
): Promise<ProductDetail[]> {
  if (!userId) return [];
  console.log(createAt);
  const resp = await axiosClient.get('/products/user/filter', {
    params: {
      Page: page,
      Limit: 10,
      UserId: userId,
      Search: search,
      CreateAt: createAt,
    },
  });
  console.log(resp);
  return Array.isArray(resp) ? resp : resp?.data ?? [];
}

export async function getProductById(
  productId: string,
): Promise<ProductDetail> {
  const resp = (await axiosClient.get(
    `/products/${productId}`,
  )) as ProductDetail;
  console.log('aaaa', resp);
  return resp || null;
}

export async function cancelProduct(productId: string): Promise<void> {
  try {
    console.log(productId);
    await axiosClient.put(`/products/cancel/${productId}`, {
      reason: 'Cancelled by user',
    });
  } catch (error) {
    console.error('Error cancelling product:', error);
    throw error;
  }
}

export async function getProductToday(userId: string, pickUpDate: string) {
  const resp = await axiosClient.get('/products/user/my-pickups', {
    params: { userId, pickUpDate },
  });
  return Array.isArray(resp) ? resp : resp?.data ?? [];
}

export async function dropOff(
  senderId: string,
  description: string,
  smallCollectionPointId: string,
  images: string[],
  parentCategoryId: string,
  subCategoryId: string,
  brandId: string,
  qrCode: string,
) {
  try {
    console.log(
      senderId,
      description,
      smallCollectionPointId,
      images,
      parentCategoryId,
      subCategoryId,
      brandId,
      qrCode,
    );
    const resp = await axiosClient.post('/products/drop-off', {
      senderId,
      description,
      smallCollectionPointId,
      images,
      parentCategoryId,
      subCategoryId,
      brandId,
      qrCode,
    });
    return resp;
  } catch (error) {
    console.error('Error dropping off product:', error);
    throw error;
  }
}

export default { getProductsByUser, getProductById, cancelProduct };
