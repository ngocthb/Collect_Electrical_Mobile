import axiosClient from '../config/axios';

export interface UpdateProfileRequest {
  email: string;
  avatarUrl: string;
  phoneNumber: string;
}

export const updateProfile = async (
  userId: string,
  data: UpdateProfileRequest,
): Promise<any> => {
  try {
    const response = await axiosClient.put(`/users/${userId}`, data);
    return response;
  } catch (error) {
    console.error('[updateProfile] Error:', error);
    throw error;
  }
};

export const deleteAccount = async (userId: string): Promise<any> => {
  try {
    const response = await axiosClient.delete(`/users/${userId}`);
    return response;
  } catch (error) {
    console.error('[deleteAccount] Error:', error);
    throw error;
  }
};
