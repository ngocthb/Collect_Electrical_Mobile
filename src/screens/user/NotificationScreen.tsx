import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { formatTimestamp } from '../../utils/dateUtils';
import MainLayout from '../../layout/MainLayout';
import {
  getNotificationByUserId,
  markNotificationAsRead,
} from '../../services/notificationServices';
import { useSelector } from 'react-redux';
import { Notification } from '../../types/Notification';
import { useNavigation } from '@react-navigation/native';
const NotificationScreen: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationByUserId(user.userId);
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user.userId]);

  const handleReadNotification = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(notif =>
          notif.notificationId === notificationId
            ? { ...notif, isRead: true }
            : notif,
        ),
      );

      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);

      setNotifications(prev =>
        prev.map(notif =>
          notif.notificationId === notificationId
            ? { ...notif, isRead: false }
            : notif,
        ),
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getNotificationByUserId(user.userId);
      setNotifications(data);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <MainLayout headerTitle="Thông báo" onRefresh={onRefresh}>
      <View className="flex-1 bg-gray-50">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#e85a4f" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Không có thông báo nào</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
            {notifications.map(item => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleReadNotification(item.notificationId)}
                key={item.notificationId}
                className="mx-4 mb-2 rounded-lg bg-white border border-gray-200 overflow-hidden"
              >
                <View className="flex-row">
                  {!item.isRead && <View className="w-1 bg-primary-100" />}
                  <View className="flex-1 px-4 py-2">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-base font-semibold text-primary-100">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {formatTimestamp(item.createdAt)}
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-600 ">
                      {item.message}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </MainLayout>
  );
};

export default NotificationScreen;
