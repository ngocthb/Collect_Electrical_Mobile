import axiosClient from '../config/axios';

const getPostTimeline = async (productId: string) => {
  try {
    const res = await axiosClient.get(
      `/tracking/product/${productId}/timeline`,
    );
    return res;
  } catch (e) {
    throw e;
  }
};

export default {
  getPostTimeline,
};
