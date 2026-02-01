import axiosClient from '../config/axios';
import { Notification } from '../types/Notification';

export const getNotificationByUserId = async (
  userId: string,
): Promise<Notification[]> => {
  try {
    const response = await axiosClient.get<Notification[]>(
      `/notifications/user/${userId}`,
    );
    return response as any;
  } catch (error) {
    console.error('[getNotificationByUserId] Error:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<void> => {
  try {
    await axiosClient.put(`/notifications/read`, {
      notificationIds: [notificationId],
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
