import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppButton from './ui/AppButton';
import AppAvatar from './ui/AppAvatar';
import { resolveStatus } from '../utils/deliveryHelpers';
import { getOrderId } from '../utils/deliveryHelpers';
import { maskPhone } from '../utils/validations';

type Props = {
  normalizedRequest: any;
  pickupLocationName?: string;
  currentLocationName?: string | null;
  isExpanded: boolean;
  isRouteLoading: boolean;
  distanceText: string;
  durationText: string;
  onCall: () => void;
  onMessage: () => void;
  onConfirm: () => void;
  onReject: () => void;
};

const DeliveryMapPanel: React.FC<Props> = ({
  normalizedRequest,
  pickupLocationName,
  isExpanded,
  isRouteLoading,
  distanceText,
  durationText,
  onCall,
  onMessage,
  onConfirm,
  onReject,
}) => {
  console.log(normalizedRequest);
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      scrollEnabled={isExpanded}
    >
      <View className="px-5 pb-5">
        {/* Pickup Address */}
        <View className="flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
            <Icon name="circle-slice-8" size={16} color="#34C759" />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">Điểm lấy hàng</Text>
            <Text className="text-sm font-semibold text-gray-900 mb-0.5">
              {pickupLocationName}
            </Text>
          </View>
        </View>

        {isExpanded && (
          <>
            <View className="h-px bg-gray-200 my-4" />

            {/* User Info */}
            <View className="mb-4">
              <Text className="text-xs text-gray-500 mb-3">
                Thông tin người gửi
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-2xl p-4">
                <AppAvatar uri={normalizedRequest?.sender?.avatar} size={56} />
                <View className="flex-1 ml-4">
                  <Text className="text-base font-bold text-gray-900">
                    {normalizedRequest?.sender?.name ?? 'Người gửi'}
                  </Text>

                  <Text className="text-sm text-gray-500 mt-1">
                    SĐT: {maskPhone(normalizedRequest?.sender?.phone) || '—'}
                  </Text>

                  <Text className="text-sm text-gray-500 mt-0.5">
                    Sản phẩm : {normalizedRequest?.itemName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            {(() => {
              const status = resolveStatus(normalizedRequest);
              const actionsDisabled =
                status === 'failed' || status === 'completed';
              return (
                <View className="flex-row gap-3 mb-4">
                  <AppButton
                    title="Gọi điện"
                    className="flex-1"
                    color="#4169E1"
                    textColor="#FFFFFF"
                    icon={<Icon name="phone" size={20} color="#FFFFFF" />}
                    onPress={onCall}
                    disabled={actionsDisabled}
                  />
                </View>
              );
            })()}

            {/* Warning */}
            <View className="flex-row items-center bg-amber-50 rounded-xl p-4 mb-6">
              <Icon name="information" size={20} color="#F59E0B" />
              <Text className="flex-1 text-sm text-amber-900 ml-3">
                Xảy ra sự cố ? Liên hệ với trung tâm hỗ trợ
              </Text>
            </View>

            {/* Order Details */}
            <View className="mb-4"></View>
            <View className="mb-4">
              <Text className="text-xs text-gray-500 mb-3">
                Hình ảnh sản phẩm
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {normalizedRequest?.pickUpItemImages?.map(
                  (image: string, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 8,
                        marginRight: 8,
                      }}
                      resizeMode="cover"
                    />
                  ),
                )}
              </ScrollView>
            </View>

            {/* Additional Data */}
            <View className="mb-4">
              <View className="gap-2">
                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">Ngày thu gom</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {normalizedRequest?.collectionDate || '—'}
                  </Text>
                </View>
                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">
                    Thời gian dự kiến
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {normalizedRequest?.estimatedTime || '—'}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">Biển số xe</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {normalizedRequest?.licensePlate || '—'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between ">
              <View style={{ width: '48%' }}>
                <AppButton
                  title="Lấy hàng thất bại"
                  onPress={onReject}
                  color="#E53935"
                />
              </View>
              <View style={{ width: '48%' }}>
                <AppButton title="Lấy hàng thành công" onPress={onConfirm} />
              </View>
            </View>
            <View className="h-5" />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default DeliveryMapPanel;
