import axiosClient from '../config/axios';
import { checkImageResponse } from '../types/Routers';
import { CollectionRouteResponse } from '../types/Collector';

const listByDate = async (
  userId: string,
  dateStr: string,
): Promise<CollectionRouteResponse> => {
  try {
    const res = await axiosClient.get(`/routes/${dateStr}/collector/${userId}`);
    console.log(res);
    return res as any;
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

const checkImage = async (
  productImages: string[],
  confirmImages: string[],
): Promise<checkImageResponse | null> => {
  try {
    const data = await axiosClient.post<checkImageResponse>(
      `/image/compare-confirm`,
      {
        productImages,
        confirmImages,
      },
    );

    return data as any;
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
  checkImage,
};
