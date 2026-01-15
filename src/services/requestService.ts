import Toast from 'react-native-toast-message';
import axiosClient from '../config/axios';
import { AxiosError } from 'axios';
import { CreateRequestPayload } from '../types/Request';

const create = async (payload: CreateRequestPayload) => {
  try {
    const response = await axiosClient.post('posts', payload);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError;
    // if (axiosError.status === 400) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Dữ liệu không hợp lệ.. Vui lòng kiểm tra lại thông tin.',
    //   });
    // }
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
