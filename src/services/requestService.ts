import Toast from 'react-native-toast-message';
import axiosClient from '../config/axios';

import { CreateRequestPayload } from '../types/Request';

const create = async (payload: CreateRequestPayload) => {
  try {
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
