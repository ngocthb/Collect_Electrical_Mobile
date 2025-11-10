import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import SubLayout from '../../layout/SubLayout';

export default function ShipmentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // receive notification/order data via params if provided
  const notification = route.params?.notification;

  // sample fallback data when no params
  const shipper = notification?.shipper || {
    name: 'Nguyễn Văn A',
    phone: '+84912345678',
    vehicle: 'Xe máy - Wave',
    eta: '31/10/2025 • 09:00',
    orderId: 'DH-20251030-001',
    avatar: require('../../assets/images/avatar.jpg'),
  };

  // status handling
  const initialStatus = notification?.status || 'on_the_way';
  const [status, setStatus] = useState<string>(initialStatus);

  const statusConfig = {
    scheduled: {
      label: 'Sắp tiến hành',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
  };

  const cfg = statusConfig['scheduled'];

  const updateStatus = (newStatus: 'scheduled') => {
    setStatus(newStatus);
    const label = statusConfig[newStatus]?.label || newStatus;
    toast.show({
      type: 'success',
      text1: 'Cập nhật trạng thái',
      text2: `Đã chuyển sang: ${label}`,
    });
    // TODO: persist to server/store if needed
  };

  const handleCall = async (phone?: string) => {
    if (!phone) return;
    const tel = `tel:${phone.replace(/\s+/g, '')}`;
    try {
      const supported = await Linking.canOpenURL(tel);
      if (supported) {
        await Linking.openURL(tel);
      } else {
        toast.show({
          type: 'error',
          text1: 'Không thể gọi',
          text2: 'Thiết bị không hỗ trợ cuộc gọi.',
        });
      }
    } catch (err) {
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể thực hiện cuộc gọi.',
      });
    }
  };

  return (
    <SubLayout
      title="Chi tiết giao nhận"
      onBackPress={() => navigation.goBack()}
    >
      <View className="flex-1 p-4 bg-white">
        {/* Shipper card */}
        <View className="flex-row items-center bg-white rounded-xl p-3 mb-4 border border-gray-100">
          <Image
            source={shipper.avatar}
            className="w-16 h-16 rounded-full mr-3"
          />
          <View className="flex-1">
            <Text className="font-bold text-lg">{shipper.name}</Text>
            <Text className="text-sm text-gray-500">{shipper.vehicle}</Text>
            <Text className="text-sm text-gray-400 mt-1">
              Mã đơn: {shipper.orderId}
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => handleCall(shipper.phone)}
              className="p-2 mr-2 bg-blue-50 rounded-lg"
            >
              <Icon name="phone" size={18} color="#4169E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ETA and details */}
        <View className="rounded-lg border border-gray-100 p-4 mb-4 bg-white">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500">Thời gian dự kiến</Text>
              <Text className="font-semibold text-gray-900 mt-1">
                {shipper.eta}
              </Text>
            </View>
            {/* Status */}
            <View className="items-end">
              <Text className="text-sm text-gray-500">Trạng thái</Text>
              <View className={`mt-1 px-3 py-1 rounded-full ${cfg.bg}`}>
                <Text className={`${cfg.text} font-semibold`}>{cfg.label}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order summary */}
        <View className="rounded-lg border border-gray-100 p-4 mb-4 bg-white">
          <Text className="text-sm text-gray-500">Thông tin đơn hàng</Text>
          <View className="mt-3">
            <Text className="font-semibold">1 x Máy giặt (Model XYZ)</Text>
            <Text className="text-sm text-gray-500">Trọng lượng: ~12 kg</Text>
            <Text className="text-sm text-gray-500 mt-2">
              Mô tả: Vẫn còn dùng được
            </Text>

            {/* Images list below details */}
            <View className="mt-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(notification?.order?.images &&
                notification.order.images.length
                  ? notification.order.images
                  : notification?.order?.image
                  ? [notification.order.image]
                  : [null]
                ).map((img: string | null, idx: number) => (
                  <Image
                    key={idx}
                    source={img ? { uri: img } : shipper.avatar}
                    className="w-24 h-24 rounded-lg mr-3 bg-gray-100"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </SubLayout>
  );
}
