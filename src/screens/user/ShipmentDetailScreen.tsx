import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
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

  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string }
  > = {
    completed: {
      label: 'Đã hoàn thành',
      bg: 'bg-green-100',
      text: 'text-green-800',
    },
    scheduled: {
      label: 'Sắp tiến hành',
      bg: 'bg-teal-100',
      text: 'text-teal-800',
    },
    in_progress: {
      label: 'Đang tiến hành',
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
    },
    on_the_way: {
      label: 'Đang trên đường tới',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
  };

  const updateStatus = (newStatus: string) => {
    setStatus(newStatus);
    const label = statusConfig[newStatus]?.label || newStatus;
    Alert.alert('Cập nhật trạng thái', `Đã chuyển sang: ${label}`);
    // TODO: persist to server/store if needed
  };

  const cfg = statusConfig[status] || statusConfig['on_the_way'];

  const handleCall = async (phone?: string) => {
    if (!phone) return;
    const tel = `tel:${phone.replace(/\s+/g, '')}`;
    try {
      const supported = await Linking.canOpenURL(tel);
      if (supported) {
        await Linking.openURL(tel);
      } else {
        Alert.alert('Không thể gọi', 'Thiết bị không hỗ trợ cuộc gọi.');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi.');
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
              className="p-2 mr-2 bg-green-50 rounded-lg"
            >
              <Icon name="phone" size={18} color="#059669" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('DeliveryInfo', {
                  orderId: shipper.orderId,
                })
              }
              className="p-2 bg-gray-50 rounded-lg"
            >
              <Icon name="info" size={18} color="#6b7280" />
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
            <View className="items-end">
              <Text className="text-sm text-gray-500">Trạng thái</Text>
              <View className={`mt-1 px-3 py-1 rounded-full ${cfg.bg}`}>
                <Text className={`${cfg.text} font-semibold`}>{cfg.label}</Text>
              </View>

              {status === 'on_the_way' && (
                <View className="flex-row mt-3">
                  <TouchableOpacity
                    onPress={() => updateStatus('completed')}
                    className="px-3 py-1 mr-2 rounded-full bg-green-50 border border-green-200"
                  >
                    <Text className="text-green-700">Đã hoàn thành</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => updateStatus('scheduled')}
                    className="px-3 py-1 mr-2 rounded-full bg-teal-50 border border-teal-200"
                  >
                    <Text className="text-teal-700">Sắp tiến hành</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => updateStatus('in_progress')}
                    className="px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200"
                  >
                    <Text className="text-yellow-700">Đang tiến hành</Text>
                  </TouchableOpacity>
                </View>
              )}
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
              Ghi chú: Tháo dây điện trước khi thu gom
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

        <View className="mt-auto mb-6">
          <TouchableOpacity
            onPress={() => handleCall(shipper.phone)}
            className="py-3 rounded-xl bg-green-600 items-center"
          >
            <Text className="text-white font-semibold">Gọi shipper</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SubLayout>
  );
}
