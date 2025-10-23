import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import SubLayout from '../../layout/SubLayout';
import { Image } from 'react-native';
const avatar = require('../../assets/images/avatar.jpg');
interface TimelineItemProps {
  icon: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  icon,
  title,
  subtitle,
  date,
  time,
  isLast = false,
}) => (
  <View className="flex-row mt-1">
    <View className="items-center mr-4">
      <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
        <Icon name={icon} size={20} color="#fff" />
      </View>
      {!isLast && <View className="w-0.5 flex-1 bg-gray-200 my-1" />}
    </View>
    <View className="flex-1 pb-6">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="font-semibold text-gray-900 text-sm flex-1">
          {title}
        </Text>
        <Text className="text-sm text-gray-400">{date}</Text>
      </View>
      <Text className="text-sm text-gray-600 mb-1">{subtitle}</Text>
      <Text className="text-sm text-gray-400 mt-1">{time}</Text>
    </View>
  </View>
);

interface NotificationDetailScreenProps {
  navigation: any;
  route: any;
}

const NotificationDetailScreen: React.FC<NotificationDetailScreenProps> = ({
  navigation,
}) => {
  const timelineData = [
    {
      id: '5',
      icon: 'refresh-cw',
      title: 'Sản phẩm đã được tái chế',
      subtitle: '123 Võ Văn Ngân - Thủ Đức, TP.HCM',
      date: '18/10/2025',
      time: '16:20',
    },
    {
      id: '4',
      icon: 'truck',
      title: 'Sản phẩm đã được chuyển đến kho C',
      subtitle: '123 Võ Văn Ngân - Thủ Đức, TP.HCM',
      date: '18/10/2025',
      time: '16:20',
    },
    {
      id: '1',
      icon: 'package',
      title: 'Lấy hàng thành công',
      subtitle: '123 Võ Văn Ngân - Thủ Đức, TP.HCM',
      date: '18/10/2025',
      time: '16:20',
    },
    {
      id: '2',
      icon: 'truck',
      title: 'Đến phố nhận viên lấy hàng',
      subtitle: 'Bên thu gom A',
      date: '17/10/2025',
      time: '14:00',
    },
    {
      id: '3',
      icon: 'check-circle',
      title: 'Đơi yêu cầu thu gom',
      subtitle: 'Yêu cầu đã được duyệt',
      date: '17/10/2025',
      time: '14:00',
      isLast: true,
    },
  ];

  return (
    <SubLayout
      title="Chi tiết thông báo"
      onBackPress={() => navigation.goBack()}
    >
      <View className="flex-1 bg-gray-50">
        <ScrollView className="flex-1  mt-4">
          {/* Shipper Info */}
          <View className="bg-white px-6 py-4 mb-2">
            <Text className="text-sm text-text-muted mb-3">
              Người vận chuyển:
            </Text>
            <View className="flex-row items-center gap-3">
              <Image source={avatar} className="w-12 h-12 rounded-full" />
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">
                  Naruto
                </Text>
                <Text className="text-sm text-gray-500">
                  Phương tiện: xe tải nhỏ
                </Text>
                <Text className="text-sm text-gray-500">
                  Biển số xe: 60F1-123.456
                </Text>
              </View>
            </View>
          </View>
          {/* Timeline */}
          <View className="bg-white px-6 py-4">
            <Text className="text-sm text-gray-600 mb-4">Chi tiết:</Text>
            {timelineData.map(item => (
              <TimelineItem
                key={item.id}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                date={item.date}
                time={item.time}
                isLast={item.isLast}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SubLayout>
  );
};

export default NotificationDetailScreen;
