import axiosClient from '../config/axios';

export const getStatistics = async (collectorId: string, period: number) => {
  try {
    const response = await axiosClient.get(
      `/collectors/${collectorId}/statistics?period=${period}`,
    );
    return response as any;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};
