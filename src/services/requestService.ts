import axiosClient from '../config/axios';

interface CreateRequestPayload {
  senderId?: string;
  name: string;
  category?: string;
  description?: string;
  address?: string;
  images?: string[];
  collectionSchedule?: Array<{
    dayName: string;
    slots: Array<{ startTime: string; endTime: string }>;
  }>;
}

const create = async (payload: CreateRequestPayload) => {
  try {
    console.log(JSON.stringify(payload, null, 2));

    const response = await axiosClient.post('posts', payload);
    return response;
  } catch (error) {
    throw error;
  }
};

const list = async () => {
  try {
    const response = await axiosClient.get('posts');
    // axiosClient response interceptor returns response.data
    return response as any;
  } catch (error) {
    throw error;
  }
};

const getRequestBySenderId = async (id: string) => {
  try {
    const response = await axiosClient.get(`posts/sender/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default { create, list, getRequestBySenderId };
