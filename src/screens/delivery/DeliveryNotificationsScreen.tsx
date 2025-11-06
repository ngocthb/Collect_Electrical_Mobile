import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MainLayout from '../../layout/MainLayout';

interface NotificationProps {
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const NotificationItem = ({
  title,
  message,
  time,
  isRead,
}: NotificationProps) => {
  return (
    <TouchableOpacity className="p-4 bg-white mb-3 rounded-lg border border-gray-200">
      <View className="flex-row items-start justify-between mb-2">
        <Text
          className={`flex-1 text-base font-medium ${
            isRead ? 'text-gray-600' : 'text-gray-900'
          }`}
        >
          {title}
        </Text>
      </View>
      <Text className="text-sm text-gray-500 mb-2 leading-5">{message}</Text>
      <Text className="text-xs text-gray-400">{time}</Text>
    </TouchableOpacity>
  );
};

export default function DeliveryNotificationsScreen() {
  const notifications = [
    {
      id: '1',
      title: 'Đơn hàng mới',
      message: 'Bạn có đơn hàng thu gom mới tại 123 Nguyễn Huệ, Q1',
      time: '5 phút trước',
      isRead: false,
    },
    {
      id: '2',
      title: 'Thanh toán thành công',
      message: 'Bạn đã thu gom thành công đơn hàng #DH001',
      time: '1 giờ trước',
      isRead: false,
    },
    {
      id: '3',
      title: 'Hoàn thành đơn hàng',
      message: 'Đơn hàng #DH002 đã được kho ghi nhận thành công',
      time: '2 giờ trước',
      isRead: true,
    },
    {
      id: '4',
      title: 'Cập nhật lộ trình',
      message: 'Lộ trình giao hàng đã được tối ưu cho ngày hôm nay',
      time: '3 giờ trước',
      isRead: true,
    },
  ];

  return (
    <MainLayout headerTitle="Thông báo">
      <View className="flex-1 bg-white">
        {/* Notifications */}
        <ScrollView className="flex-1 p-4">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              title={notification.title}
              message={notification.message}
              time={notification.time}
              isRead={notification.isRead}
            />
          ))}
        </ScrollView>
      </View>
    </MainLayout>
  );
}
