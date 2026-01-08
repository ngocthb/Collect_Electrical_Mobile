export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
export * from './Notification';
