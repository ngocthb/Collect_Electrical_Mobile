import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { formatTimestamp } from '../../utils/dateUtils';
import MainLayout from '../../layout/MainLayout';
import {
  getNotificationByUserId,
  markNotificationAsRead,
} from '../../services/notificationServices';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Notification } from '../../types/Notification';
import { readNotis } from '../../store/slices/notificationSlice';
const NotificationScreen: React.FC = () => {
  const user = useAppSelector((state: any) => state.auth.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useAppDispatch();
  const loadNotifications = async (
    pageNum: number = 1,
    append: boolean = false,
  ) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await getNotificationByUserId(user.userId, pageNum);
      const newNotifications = Array.isArray(data) ? data : [];

      if (append) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.notificationId));
          const uniqueNew = newNotifications.filter(
            n => !existingIds.has(n.notificationId),
          );
          return [...prev, ...uniqueNew];
        });
      } else {
        setNotifications(newNotifications);
      }

      setHasMore(newNotifications.length >= 10);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (!append) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadNotifications(1, false);
  }, [user.userId]);

  const handleReadNotification = async (noti: Notification) => {
    if (noti.isRead) return;

    const notificationId = noti.notificationId;
    try {
      setNotifications(prev =>
        prev.map(notif =>
          notif.notificationId === notificationId
            ? { ...notif, isRead: true }
            : notif,
        ),
      );

      await markNotificationAsRead(notificationId);
      dispatch(readNotis(1));
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
    setPage(1);
    setHasMore(true);
    await loadNotifications(1, false);
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(nextPage, true);
    }
  };

  return (
    <MainLayout
      headerTitle="Thông báo"
      onRefresh={onRefresh}
      useScrollView={false}
    >
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
          <FlatList
            data={notifications}
            keyExtractor={item => item.notificationId}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleReadNotification(item)}
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
            )}
            contentContainerStyle={{ paddingVertical: 12 }}
            refreshing={loading}
            onRefresh={onRefresh}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#e85a4f" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </MainLayout>
  );
};

export default NotificationScreen;
