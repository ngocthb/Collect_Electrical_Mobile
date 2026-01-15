import axiosClient from '../config/axios';
import { ServerTime } from '../types/common';

export const getTimeSever = async (): Promise<ServerTime> => {
  try {
    const response = await axiosClient.get<ServerTime>(
      '/system-config/server-time',
    );

    return response as any;
  } catch (error) {
    console.error('Error fetching server time:', error);
    throw error;
  }
};
