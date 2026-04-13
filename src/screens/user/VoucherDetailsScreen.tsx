import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Feather';
import { formatDate } from '../../utils/dateUtils';
import SubLayout from '../../layout/SubLayout';

interface VoucherDetailsRouteProp {
  voucher: {
    voucherId: string;
    code: string;
    name: string;
    description: string;
    pointsToRedeem: number;
    imageUrl: string;
    status: string;
    startAt: string;
    endAt: string;
    value: number;
  };
}

export default function VoucherDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { voucher } = route.params as VoucherDetailsRouteProp;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Voucher: ${voucher.code}\n${voucher.name}\nGiá: ${voucher.pointsToRedeem} xu`,
        title: voucher.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = () => {
    // Copy to clipboard logic - you might want to add react-native-clipboard
    console.log('Copy code:', voucher.code);
  };

  return (
    <SubLayout title="Chi tiết Voucher" onBackPress={() => navigation.goBack()}>
      <ScrollView className="flex-1 bg-background-50">
        <View className="px-6">
          {/* Voucher Card Preview */}
          <View className="rounded-2xl  items-center">
            <View className="p-4 rounded-xl mb-4">
              <QRCode
                value={voucher.code}
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
                <View className="px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold">
                    {voucher.status}
                  </Text>
                </View>
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

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={handleShare}
              className="flex-1 bg-white border border-gray-200 rounded-full py-3 items-center flex-row justify-center gap-2"
            >
              <Icon name="share-2" size={18} color="#e85a4f" />
              <Text className="text-gray-900 font-semibold">Chia sẻ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCopyCode}
              className="flex-1 bg-primary-100 rounded-full py-3 items-center flex-row justify-center gap-2"
            >
              <Icon name="copy" size={18} color="white" />
              <Text className="text-white font-semibold">Sao chép</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SubLayout>
  );
}
