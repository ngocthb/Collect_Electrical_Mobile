import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { formatDate } from '../../utils/dateUtils';
import SubLayout from '../../layout/SubLayout';
import { useAppSelector } from '../../store/hooks';
import voucherService from '../../services/voucherService';
import { Voucher } from '../../types/Voucher';

interface VoucherDetailsRouteProp {
  voucherId: string;
}

export default function VoucherDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { voucherId } = route.params as VoucherDetailsRouteProp;
  const user = useAppSelector(s => s.auth.user);

  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        setError(null);
        if (voucherId) {
          const data = await voucherService.getVoucherById(voucherId);
          setVoucher(data);
        }
      } catch (err) {
        setError('Không thể tải thông tin voucher');
        console.error('Error fetching voucher:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [voucherId]);

  return (
    <SubLayout title="Chi tiết Voucher" onBackPress={() => navigation.goBack()}>
      {loading ? (
        <View className="flex-1 justify-center items-center bg-background-50">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="text-gray-600 mt-4">Đang tải...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center bg-background-50 px-6">
          <Text className="text-red-600 text-center font-semibold mb-4">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-red-600 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Quay lại</Text>
          </TouchableOpacity>
        </View>
      ) : voucher ? (
        <ScrollView className="flex-1 bg-background-50">
          <View className="px-6">
            {/* Voucher Card Preview */}
            <View className="rounded-2xl  items-center">
              <View className="p-4 rounded-xl mb-4">
                <QRCode
                  value={`${voucher.code} - ${user?.userId}`} // You can customize this value as needed
                  size={200}
                  backgroundColor="white"
                  logoSize={60}
                  logoBorderRadius={30}
                  quietZone={10}
                />

                <Text className="text-gray-900 text-sm text-center mt-4">
                  {voucher.code}
                </Text>
              </View>
            </View>

            {/* Voucher Details */}
            <View className="bg-white rounded-2xl p-6 mb-6 border-2 border-red-200">
              <Text className="text-gray-900 font-bold text-lg mb-4">
                Thông tin chi tiết
              </Text>

              <View className="mb-4">
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Tên</Text>
                  <Text className="text-gray-900 font-semibold">
                    {voucher.name}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-3 gap-3">
                  <Text className="text-gray-600">Mô tả</Text>
                  <Text className="text-gray-900 font-semibold">
                    {voucher.description}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Giá trị</Text>
                  <Text className="text-gray-900 font-semibold">
                    {voucher.value?.toLocaleString()} đ
                  </Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Điểm đổi</Text>
                  <Text className="text-gray-900 font-semibold">
                    {voucher.pointsToRedeem.toLocaleString()} 🪙
                  </Text>
                </View>

                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Trạng thái</Text>
                  <Text className="text-gray-900 font-semibold">
                    {voucher.status}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Bắt đầu</Text>
                  <Text className="text-gray-900 font-semibold">
                    {formatDate(voucher.startAt)}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Kết thúc</Text>
                  <Text className="text-gray-900 font-semibold">
                    {formatDate(voucher.endAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center bg-background-50">
          <Text className="text-gray-600">Không tìm thấy voucher</Text>
        </View>
      )}
    </SubLayout>
  );
}
