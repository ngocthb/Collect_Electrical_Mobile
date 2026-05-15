import axiosClient from '../config/axios';
import { TimelineDetails } from '../types/Timeline';

const getPostTimeline = async (productId: string): Promise<TimelineDetails> => {
  try {
    const res = await axiosClient.get<TimelineDetails>(
      `/tracking/product/${productId}/timeline`,
    );

    return res as any;
  } catch (e) {
    throw e;
  }
};

export default {
  getPostTimeline,
};
