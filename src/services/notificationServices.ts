import axiosClient from '../config/axios';
import { Notification } from '../types/Notification';

export const getNotificationByUserId = async (
  userId: string,
  page: number = 1,
): Promise<Notification[]> => {
  try {
    const response = await axiosClient.get<Notification[]>(
      `/notifications/user/${userId}/paged`,
      {
        params: {
          page,
          limit: 10,
        },
      },
    );
    console.log(response);
    return response.data as any;
  } catch (error) {
    console.error('[getNotificationByUserId] Error:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (
  notificationIds: string | string[],
): Promise<void> => {
  try {
    const ids = Array.isArray(notificationIds)
      ? notificationIds
      : [notificationIds];

    await axiosClient.put(`/notifications/read`, {
      notificationIds: ids,
    });
  } catch (error) {
    console.error('[markNotificationAsRead] Error:', error);
    throw error;
  }
};

export const sendNotification = async (productId: string): Promise<void> => {
  try {
    await axiosClient.post(`/notifications/notify-arrival`, {
      productId: productId,
    });
    console.log('Send noti');
  } catch (error) {
    console.error('[sendNotification] Error:', error);
    throw error;
  }
};

export const sendCallNoti = async (
  routeId: string,
  userId: string,
): Promise<void> => {
  try {
    await axiosClient.post(`notifications/notify-call`, {
      routeId,
      userId,
    });
    console.log('Send call noti');
  } catch (error) {
    console.error('[sendCallNoti] Error:', error);
    throw error;
  }
};

export const getUnReadNotis = async (userId: string) => {
  try {
    const response = await axiosClient.get(
      `/notifications/user/${userId}/unread-count`,
    );
    return response as any;
  } catch (error) {
    console.error('[getUnReadNotis] Error:', error);
    throw error;
  }
};
