import axiosClient from '../config/axios';
import { Warehouse } from '../types/Warehouse';

export const getWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const response = await axiosClient.get<Warehouse[]>(
      '/small-collection/active',
    );
    return (response as any) || [];
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

export default {
  getWarehouses,
};
