import axiosClient from '../config/axios';

const getVoucher = async (page: number = 1, name: string) => {
  try {
    console.log('call api');
    const resp = await axiosClient.get(`/voucher/paged`, {
      params: { Page: page, Limit: 10, Name: name },
    });
    return Array.isArray(resp) ? resp : resp?.data ?? [];
  } catch (error) {
    console.error('[getVoucher] Error:', error);
    throw error;
  }
};

const getVoucherById = async (voucherId: string) => {
  try {
    const resp = await axiosClient.get(`/voucher/${voucherId}`);
    return resp || null;
  } catch (error) {
    console.error('[getVoucherById] Error:', error);
    throw error;
  }
};

const redeemVoucher = async (voucherId: string, userId: string) => {
  try {
    const resp = await axiosClient.post(`/voucher/user/receive-voucher`, {
      voucherId,
      userId,
    });
    return resp;
  } catch (error) {
    console.error('[redeemVoucher] Error:', error);
    throw error;
  }
};

const getVoucherByUser = async (
  userId: string,
  page: number = 1,
  name: string,
) => {
  try {
    const resp = await axiosClient.get(`/voucher/user/${userId}/paged`, {
      params: { Page: page, Limit: 10, UserId: userId, Name: name },
    });
    return Array.isArray(resp) ? resp : resp?.data ?? [];
  } catch (error) {
    console.error('[getVoucherByUser] Error:', error);
    throw error;
  }
};

export default {
  getVoucher,
  getVoucherById,
  redeemVoucher,
  getVoucherByUser,
};
