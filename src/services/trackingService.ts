import axiosClient from '../config/axios';

const getPostTimeline = async (postId: string) => {
  try {
    const res = await axiosClient.get(`/tracking/post/${postId}/timeline`);
    return res;
  } catch (e) {
    throw e;
  }
};

export default {
  getPostTimeline,
};
