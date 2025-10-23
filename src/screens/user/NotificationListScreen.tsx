import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MainLayout from '../../layout/MainLayout';

interface NotificationItemProps {
  image: string;
  title: string;
  subtitle: string;
  date: string;
  amount?: string;
  isRead?: boolean;
  onPress: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  image,
  title,
  subtitle,
  date,
  amount,
  isRead = false,
  onPress,
}) => (
  <TouchableOpacity
    className={`flex-row items-center p-4 mx-4 mb-3 rounded-2xl shadow-sm active:scale-[0.98] ${
      isRead ? 'bg-white' : 'bg-teal-50 border-2 border-teal-100'
    }`}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {/* Image with gradient overlay */}
    <View className="relative">
      <View className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
        <Image
          source={{ uri: image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {!isRead && (
        <View className="absolute -top-1 -left-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white" />
      )}
    </View>

    {/* Content */}
    <View className="flex-1 ml-4 min-w-0">
      <Text
        className={`font-bold text-base mb-1 ${
          isRead ? 'text-gray-700' : 'text-gray-900'
        }`}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        className={`text-sm mb-2 ${isRead ? 'text-gray-500' : 'text-gray-700'}`}
        numberOfLines={2}
      >
        {subtitle}
      </Text>
      <View className="flex-row items-center">
        <Icon name="clock" size={12} color="#9ca3af" />
        <Text className="text-xs text-gray-400 ml-1" numberOfLines={1}>
          {date}
        </Text>
      </View>
    </View>

    {/* Amount Badge */}
    {amount && (
      <View className="ml-2  px-4 py-2 ">
        <Text className="font-bold text-secondary-100 text-base">
          +{amount} 🪙
        </Text>
      </View>
    )}

    {/* Arrow indicator */}
    <View className="ml-2">
      <Icon name="chevron-right" size={20} color="#cbd5e1" />
    </View>
  </TouchableOpacity>
);

interface NotificationListScreenProps {
  navigation: any;
}

const NotificationListScreen: React.FC<NotificationListScreenProps> = ({
  navigation,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notifications = [
    {
      id: '1',
      image:
        'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=100&h=100&fit=crop',
      title: 'Tủ lạnh',
      subtitle: 'Sản phẩm sẽ được đến lấy vào ngày mai lúc 9:00 AM',
      date: 'Thứ 4, 3 Tháng 08 2025',
      isRead: false,
    },
    {
      id: '2',
      image:
        'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=100&h=100&fit=crop',
      title: 'Máy giặt cũ',
      subtitle: 'Bạn đã thu được điểm thưởng từ việc tái chế',
      amount: '12,000',
      date: 'Thứ 4, 10 Tháng 10 2025',
      isRead: false,
    },
    {
      id: '3',
      image:
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=100&h=100&fit=crop',
      title: 'Lò vi sóng hư',
      subtitle: 'Bạn đã thu được điểm thưởng',
      amount: '2,000',
      date: 'Thứ 3, 3 Tháng 08 2025',
      isRead: true,
    },
  ];

  const filteredNotifications =
    filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MainLayout>
      <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        {/* Header with stats */}
        <View className="px-4 pt-4 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Thông báo
              </Text>
              {unreadCount > 0 && (
                <Text className="text-sm text-gray-500 mt-1">
                  {unreadCount} thông báo mới
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView
          className="flex-1 mt-2"
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.length > 0 ? (
            <>
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  image={notification.image}
                  title={notification.title}
                  subtitle={notification.subtitle}
                  date={notification.date}
                  amount={notification.amount}
                  isRead={notification.isRead}
                  onPress={() => {
                    if (notification.amount) {
                      navigation.navigate('UserNotificationDetail', {
                        notification,
                      });
                    } else {
                      navigation.navigate('DeliveryInfo');
                    }
                  }}
                />
              ))}
              <View className="h-6" />
            </>
          ) : (
            <View className="items-center justify-center py-20">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Icon name="bell-off" size={32} color="#9ca3af" />
              </View>
              <Text className="text-gray-500 font-semibold text-base">
                Không có thông báo
              </Text>
              <Text className="text-gray-400 text-sm mt-2">
                Bạn đã xem hết thông báo
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </MainLayout>
  );
};

export default NotificationListScreen;
