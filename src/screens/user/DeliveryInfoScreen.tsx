import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
import { useRoute } from '@react-navigation/native';
import mockRequestService from '../../services/mockRequestService';
import { Image } from 'react-native';
import AppButton from '../../components/ui/AppButton';
const shipper = {
  name: 'Nguyễn Văn A',
  phone: '0901234567',
  vehicle: 'Xe máy',
  licensePlate: '59A-12345',
  rating: 4.8,
  totalDeliveries: 1250,
};

const avatar = require('../../assets/images/avatar.jpg');
const estimatedTime = '15 phút';
const estimatedDistance = '5.2 km';

const DeliveryInfoScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const requestId: number | undefined = route.params?.requestId;

  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!requestId) return;
      console.log('[DeliveryInfo] loading requestId=', requestId);
      setLoading(true);
      try {
        const r = await mockRequestService.get(requestId);
        console.log('[DeliveryInfo] fetched request=', r);
        if (mounted) setRequest(r ?? null);
      } catch (e) {
        console.warn('Failed to load request', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [requestId]);

  const statusColorClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'đang chờ duyệt':
        return 'bg-yellow-400';
      case 'đã duyệt':
        return 'bg-blue-500';
      case 'đã hoàn thành':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const dayLabel = (code: string) => {
    switch (code) {
      case 'T2':
        return 'Thứ 2';
      case 'T3':
        return 'Thứ 3';
      case 'T4':
        return 'Thứ 4';
      case 'T5':
        return 'Thứ 5';
      case 'T6':
        return 'Thứ 6';
      case 'T7':
        return 'Thứ 7';
      case 'CN':
        return 'Chủ Nhật';
      default:
        return code;
    }
  };

  const renderTimeSlots = (slots: Record<string, string[]>) => {
    if (!slots) return null;
    const entries = Object.entries(slots).filter(
      ([, v]) => Array.isArray(v) && v.length > 0,
    );
    if (entries.length === 0) return null;

    return (
      <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Khung thời gian
        </Text>
        {entries.map(([day, times]) => (
          <View
            key={day}
            className="flex-row items-center justify-between py-2"
          >
            <Text className="text-gray-700">{dayLabel(day)}</Text>
            <Text className="text-gray-900 font-medium">
              {times.join('  -  ')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SubLayout
      title="Thông tin giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1">
        <View className="p-5">
          {/* Shipper Profile Card - hidden when request is pending */}
          {request &&
            (request.status || '').toLowerCase() !== 'đang chờ duyệt' && (
              <View className="bg-white rounded-3xl shadow-md mb-5 overflow-hidden">
                <View className="p-6">
                  <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
                    Thông tin tài xế
                  </Text>

                  <View className="flex-row items-center mb-5">
                    <View className="relative">
                      <View className="mr-4">
                        <Image
                          source={avatar}
                          className="w-20 h-20 rounded-full"
                          style={{
                            shadowColor: '#3B82F6',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                          }}
                          resizeMode="cover"
                        />
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="font-bold text-2xl text-gray-900 mb-1">
                        {shipper.name}
                      </Text>
                    </View>
                  </View>

                  {/* Vehicle Info */}
                  <View className="flex-row gap-3 mb-5">
                    <View className="flex-1 bg-gray-50 rounded-2xl p-4">
                      <View className="flex-row items-center mb-2">
                        <Icon name="motorbike" size={20} color="#3B82F6" />
                        <Text className="text-gray-500 text-xs ml-2">
                          Phương tiện
                        </Text>
                      </View>
                      <Text className="text-gray-900 font-semibold text-base">
                        {shipper.vehicle}
                      </Text>
                    </View>

                    <View className="flex-1 bg-gray-50 rounded-2xl p-4">
                      <View className="flex-row items-center mb-2">
                        <Icon
                          name="card-text-outline"
                          size={20}
                          color="#3B82F6"
                        />
                        <Text className="text-gray-500 text-xs ml-2">
                          Biển số xe
                        </Text>
                      </View>
                      <Text className="text-gray-900 font-semibold text-base">
                        {shipper.licensePlate}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-secondary-100 rounded-2xl py-4 flex-row items-center justify-center"
                      onPress={() => {}}
                      style={{
                        shadowColor: '#10B981',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                      }}
                    >
                      <Icon name="phone" size={22} color="white" />
                      <Text className="text-white font-bold text-base ml-2">
                        Gọi điện
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-primary-100 rounded-2xl py-4 flex-row items-center justify-center"
                      onPress={() => {}}
                      style={{
                        shadowColor: '#3B82F6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                      }}
                    >
                      <Icon name="message-text" size={22} color="white" />
                      <Text className="text-white font-bold text-base ml-2">
                        Nhắn tin
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

          {/* Order Details Card */}
          <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Chi tiết đơn hàng
            </Text>

            {/* Request summary */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                {request ? request.name : 'Yêu cầu của bạn'}
              </Text>
              {request?.category && (
                <Text className="text-sm text-gray-500 mt-1">
                  {request.category}
                </Text>
              )}
              {/* request thumbnail */}
              {request?.image && (
                <Image
                  source={
                    request.image && request.image.uri
                      ? { uri: request.image.uri }
                      : request.image
                  }
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 12,
                    marginTop: 10,
                  }}
                  resizeMode="cover"
                  onError={e =>
                    console.warn('[DeliveryInfo] thumb load error', e)
                  }
                  onLoad={() => console.log('[DeliveryInfo] thumb loaded')}
                />
              )}
              <View className="flex-row items-center mt-2">
                <View
                  className={`${statusColorClass(
                    request?.status,
                  )} px-3 py-1 rounded-lg mr-3`}
                >
                  <Text className="text-xs font-medium text-white">
                    {request?.status ?? 'Đang xử lý'}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500">
                  {request?.time ?? ''}
                </Text>
              </View>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                    <Icon name="barcode-scan" size={20} color="#8B5CF6" />
                  </View>
                  <Text className="text-gray-600 text-base">Mã đơn hàng</Text>
                </View>
                <Text className="text-gray-900 font-semibold text-base">
                  {request ? `#${request.id}` : '#DH123456'}
                </Text>
              </View>

              {/* Address row (from request) */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Icon
                      name="map-marker-distance"
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  <Text className="text-gray-600 text-base">Địa chỉ nhận</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    alignItems: 'flex-end',
                    minHeight: 96,
                  }}
                >
                  <Text
                    style={{ textAlign: 'right' }}
                    className="text-gray-900 font-semibold text-base"
                  >
                    {request?.address ?? '—'}
                  </Text>
                </View>
              </View>

              {/* Distance row (fallback to estimated) */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Icon
                      name="map-marker-distance"
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  <Text className="text-gray-600 text-base">Khoảng cách</Text>
                </View>
                <Text className="text-gray-900 font-semibold text-base">
                  {request?.distance ?? estimatedDistance}
                </Text>
              </View>

              {/* Estimated time */}
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                    <Icon name="clock-outline" size={20} color="#10B981" />
                  </View>
                  <Text className="text-gray-600 text-base">
                    Thời gian dự kiến
                  </Text>
                </View>
                <Text className="text-gray-900 font-semibold text-base">
                  {request?.estimatedTime ?? request?.time ?? estimatedTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Request description / images */}
          {request?.description && (
            <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Mô tả
              </Text>
              <Text className="text-gray-900">{request.description}</Text>
            </View>
          )}

          {/* images */}
          {request?.images && request.images.length > 0 && (
            <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Hình ảnh
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="space-x-3"
              >
                {request.images.map((img: any, i: number) => (
                  <Image
                    key={i}
                    source={img && img.uri ? { uri: img.uri } : img}
                    style={{
                      width: 144,
                      height: 144,
                      borderRadius: 12,
                      marginRight: 12,
                    }}
                    resizeMode="cover"
                    onError={e =>
                      console.warn('[DeliveryInfo] image load error', i, e)
                    }
                    onLoad={() => console.log('[DeliveryInfo] image loaded', i)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* time slots */}
          {renderTimeSlots(request?.timeSlots)}

          {/* Help Section */}
          <TouchableOpacity
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex-row items-center mb-4"
            onPress={() => {}}
          >
            <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mr-4">
              <Icon name="help-circle" size={28} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-amber-900 font-semibold text-base mb-1">
                Cần hỗ trợ?
              </Text>
              <Text className="text-amber-700 text-sm">
                Liên hệ bộ phận chăm sóc khách hàng
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#F59E0B" />
          </TouchableOpacity>

          {request &&
            (request.status || '').toLowerCase() !== 'đang chờ duyệt' && (
              <AppButton
                title="Xác nhận"
                onPress={() =>
                  navigation.navigate('UserConfirm', { requestId: request?.id })
                }
              />
            )}
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default DeliveryInfoScreen;
