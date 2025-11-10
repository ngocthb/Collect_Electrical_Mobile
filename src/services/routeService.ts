import axiosClient from '../config/axios';

const listByDate = async (dateStr: string) => {
  try {
    const res = await axiosClient.get(`/routes/${dateStr}`);
    return res;
  } catch (e) {
    throw e;
  }
};

const getDetail = async (id: string) => {
  try {
    const res = await axiosClient.get(`/routes/detail/${id}`);
    return res;
  } catch (e) {
    throw e;
  }
};

const cancelRoute = async (
  id: string,
  badges: string[] | string = [],
  cancelImages: string[] = [],
  rejectMessage?: string,
) => {
  try {
    const payload: any = {};

    if (Array.isArray(badges)) {
      payload.rejectMessage = badges.join(',');
    } else if (typeof badges === 'string') {
      payload.rejectMessage = badges;
    }

    if (cancelImages && cancelImages.length > 0)
      payload.cancelImages = cancelImages;
    if (rejectMessage) payload.rejectMessage = rejectMessage;
    console.log(payload);
    const res = await axiosClient.put(`/routes/cancel/${id}`, payload);
    return res;
  } catch (e) {
    throw e;
  }
};

const confirmRoute = async (
  postId: string,
  payload: { qrCode: string; confirmImages: string[] },
) => {
  try {
    const res = await axiosClient.put(`/routes/confirm/${postId}`, payload);
    return res;
  } catch (e) {
    throw e;
  }
};

const userConfirmRouter = async (
  routeId: string,
  isConfirm: boolean,
  isSkip: boolean,
) => {
  try {
    const res = await axiosClient.put(`/routes/user-confirm/${routeId}`, {
      isConfirm,
      isSkip,
    });
    return res;
  } catch (e) {
    throw e;
  }
};

export default {
  listByDate,
  getDetail,
  cancelRoute,
  confirmRoute,
  userConfirmRouter,
};
