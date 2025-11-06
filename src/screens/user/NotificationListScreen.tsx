import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MainLayout from '../../layout/MainLayout';
import StatusFilter from '../../components/ui/StatusFilter';

interface NotificationItemProps {
  image: string;
  title: string;
  subtitle: string;
  date: string;
  amount?: string;
  isFinish?: boolean;
  status?: string;
  onPress: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  image,
  title,
  subtitle,
  date,
  amount,
  status,
  onPress,
}) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center p-3 mb-3 rounded-lg border border-gray-200 bg-white active:scale-[0.98]`}
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
      </View>

      {/* Content */}
      <View className="flex-1 ml-4 min-w-0">
        <Text
          className={`font-bold text-base mb-1 ${'text-gray-900'}`}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-sm mb-2 text-gray-700" numberOfLines={2}>
          {subtitle}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Icon name="clock" size={12} color="#9ca3af" />
            <Text className="text-xs text-gray-400 ml-1" numberOfLines={1}>
              {date}
            </Text>
          </View>

          {status && (
            <View style={{ marginLeft: 8 }}>
              {status === 'completed' && (
                <View
                  style={{
                    backgroundColor: '#16a34a',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}
                  >
                    Đã hoàn thành
                  </Text>
                </View>
              )}
              {status === 'in_progress' && (
                <View
                  style={{
                    backgroundColor: '#f59e0b',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}
                  >
                    Đang tiến hành
                  </Text>
                </View>
              )}
              {status === 'scheduled' && (
                <View
                  style={{
                    backgroundColor: '#2563EB',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}
                  >
                    Sắp tiến hành
                  </Text>
                </View>
              )}
              {status === 'on_the_way' && (
                <View
                  style={{
                    backgroundColor: '#4169E1',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}
                  >
                    Đang trên đường
                  </Text>
                </View>
              )}
            </View>
          )}
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
};

interface NotificationListScreenProps {
  navigation: any;
}

const NotificationListScreen: React.FC<NotificationListScreenProps> = ({
  navigation,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      image:
        'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=100&h=100&fit=crop',
      title: 'Tủ lạnh',
      subtitle: 'Sản phẩm sẽ được đến lấy vào ngày mai lúc 9:00 AM',
      date: 'Thứ 4, 3 Tháng 08 2025',
      isFinish: false,
      status: 'in_progress',
    },
    {
      id: '4',
      image:
        'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=100&h=100&fit=crop',
      title: 'Điện thoại cũ',
      subtitle: 'Người thu gom đã lên lịch lấy trong tuần tới',
      date: 'Thứ 2, 3 Tháng 11 2025',
      isFinish: false,
      status: 'scheduled',
    },
    {
      id: '2',
      image:
        'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=100&h=100&fit=crop',
      title: 'Máy giặt cũ',
      subtitle: 'Bạn đã thu được điểm thưởng từ việc tái chế',
      amount: '12,000',
      date: 'Thứ 4, 10 Tháng 10 2025',
      isFinish: true,
      status: 'completed',
    },
    {
      id: '3',
      image:
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=100&h=100&fit=crop',
      title: 'Lò vi sóng hư',
      subtitle: 'Bạn đã thu được điểm thưởng',
      amount: '2,000',
      date: 'Thứ 3, 3 Tháng 08 2025',
      isFinish: true,
      status: 'completed',
    },
  ]);

  const filteredNotifications = notifications.filter(notification =>
    selectedStatus ? notification.status === selectedStatus : true,
  );

  const statusOptions = [
    { value: '', label: 'Tất cả', color: 'gray' },

    { value: 'in_progress', label: 'Đang tiến hành', color: 'yellow' },
    { value: 'scheduled', label: 'Sắp tiến hành', color: 'blue' },
    { value: 'completed', label: 'Hoàn thành', color: 'green' },
  ];

  return (
    <MainLayout headerTitle="Thông báo">
      <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        {/* Status Filter */}
        <StatusFilter
          options={statusOptions}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* Notifications List */}
        <ScrollView
          className="flex-1 mt-2 px-4"
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
                  isFinish={notification.isFinish}
                  status={notification.status}
                  onPress={() => {
                    if (notification.status === 'in_progress') {
                      navigation.navigate('Delivering', { notification });
                    } else if (!notification.isFinish) {
                      navigation.navigate('ShipmentDetail', { notification });
                    } else if (notification.amount) {
                      navigation.navigate('UserNotificationDetail');
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
