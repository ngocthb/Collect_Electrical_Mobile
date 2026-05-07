import axiosClient from '../config/axios';
import { Warehouse } from '../types/Warehouse';

export interface WarehousePaginatedResponse {
  data: Warehouse[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export const getWarehouses = async (
  page: number = 1,
  search: string = '',
): Promise<WarehousePaginatedResponse> => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (search) params.append('categoryName', search);

    const response = await axiosClient.get<WarehousePaginatedResponse>(
      `/collectionUnit/active?${params.toString()}`,
    );
    console.log(response);
    return (
      (response as any) || {
        data: [],
        page,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
      }
    );
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

export default {
  getWarehouses,
};
