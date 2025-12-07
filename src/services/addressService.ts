import axiosClient from '../config/axios';
import { Address } from '../types/Address';

export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const response = await axiosClient.get<Address[]>(
      `/user-address/${userId}`,
    );
    return (response as any) || [];
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
};

export const createAddress = async (
  userId: string,
  address: string,
  iat: number,
  ing: number,
  isDefault?: boolean,
): Promise<Address> => {
  try {
    const response = await axiosClient.post<Address>('/user-address', {
      userId,
      address,
      iat,
      ing,
      isDefault,
    });
    return response as any;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
};

export const updateAddress = async (
  userAddressId: string,
  userId: string,
  address: string,
  iat: number,
  ing: number,
  isDefault?: boolean,
): Promise<Address> => {
  try {
    const response = await axiosClient.put<Address>(
      `/user-address/${userAddressId}`,
      {
        userId,
        address,
        iat,
        ing,
        isDefault,
      },
    );
    console.log(response);
    return response as any;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

export const deleteAddress = async (userAddressId: string): Promise<void> => {
  try {
    await axiosClient.delete(`/user-address/${userAddressId}`);
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

export default {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
