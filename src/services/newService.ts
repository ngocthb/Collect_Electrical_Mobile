import axiosClient from '../config/axios';

export async function getNew() {
  const resp = await axiosClient.get(`/news`);
  return resp?.data ?? resp;
}
