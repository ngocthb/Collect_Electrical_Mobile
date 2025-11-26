import axiosClient from '../config/axios';
import { Address } from '../types/Address';
export const addressService = {
  /**
   * Fetch all addresses for a user
   * @param userId - The user ID
   * @returns Array of user addresses
   */
  async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const response = await axiosClient.get<Address[]>(
        `/user-address/${userId}`,
      );
      return (response as any) || [];
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
  },

  /**
   * Create a new address
   * @param userId - The user ID
   * @param addressData - Address details
   * @returns Created address
   */
  async createAddress(
    userId: string,
    address: string,
    iat: number,
    ing: number,
    isDefault?: boolean,
  ): Promise<Address> {
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
  },

  /**
   * Update an existing address
   * @param userAddressId - The address ID
   * @param addressData - Updated address details
   * @returns Updated address
   */
  async updateAddress(
    userAddressId: string,
    userId: string,
    address: string,
    iat: number,
    ing: number,
    isDefault?: boolean,
  ): Promise<Address> {
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
  },

  /**
   * Delete an address
   * @param userAddressId - The address ID
   */
  async deleteAddress(userAddressId: string): Promise<void> {
    try {
      await axiosClient.delete(`/user-address/${userAddressId}`);
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },
};

export default addressService;
