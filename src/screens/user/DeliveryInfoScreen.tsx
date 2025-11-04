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
import axiosClient from '../../config/axios';
import { Image } from 'react-native';
import AppButton from '../../components/ui/AppButton';
import { formatTimestamp } from '../../utils/dateUtils';

const avatar = require('../../assets/images/avatar.jpg');
const estimatedTime = '15 phút';
const estimatedDistance = '5.2 km';

const DeliveryInfoScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const requestId: string | undefined = route.params?.requestId;

  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!requestId) return;
      setLoading(true);
      try {
        const r = await axiosClient.get(`/posts/${requestId}`);
        console.log(r);
        setIsRejected((r as any).status === 'Đã Từ Chối');
        const data = r as any;
        const normalized: any = { ...data };

        // Map imageUrls to images format
        if (Array.isArray(data.imageUrls)) {
          normalized.images = data.imageUrls.map((u: string) => ({ uri: u }));
          normalized.image = normalized.images[0] || null;
        }

        // Map product description to description
        if (data.product?.description) {
          normalized.description = data.product.description;
        }

        // Map category fields
        if (data.parentCategory) {
          normalized.category = data.parentCategory;
          if (data.subCategory) {
            normalized.category += ` - ${data.subCategory}`;
          }
        }

        // Map schedule to timeSlots format
        if (Array.isArray(data.schedule)) {
          const slotsObj: Record<string, string[]> = {};
          data.schedule.forEach((item: any) => {
            if (item && item.dayName && item.slots) {
              const start = item.slots.startTime || '';
              const end = item.slots.endTime || '';
              slotsObj[item.dayName] = [start, end];
            }
          });
          normalized.timeSlots = slotsObj;
        }

        if (mounted) setRequest(normalized ?? null);
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
      case 'đã từ chối':
        return 'bg-red-500';
      case 'chờ duyệt':
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

  const renderAttributesOrCondition = () => {
    if (request?.product?.attributes && request.product.attributes.length > 0) {
      return (
        <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Thông số kỹ thuật
          </Text>
          {request.product.attributes.map((attr: any, index: number) => (
            <View
              key={index}
              className="flex-row justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <Text className="text-gray-600">{attr.attributeName}</Text>
              <Text className="text-gray-900 font-medium">
                {attr.value} {attr.unit || ''}
              </Text>
            </View>
          ))}
        </View>
      );
    } else if (request?.product?.sizeTierName) {
      return (
        <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Kích thước
          </Text>
          <Text className="text-gray-900">{request.product.sizeTierName}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SubLayout
      title="Thông tin giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4169E1" />
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-5">
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
                <View className="flex-row justify-between items-center mt-2">
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
                    {formatTimestamp(request?.date)}
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
                  <View
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      alignItems: 'flex-end',
                      minHeight: 20,
                    }}
                  >
                    <Text
                      style={{ textAlign: 'right' }}
                      className="text-gray-900 font-semibold text-base"
                    >
                      {request ? `#${request.id}` : '—'}
                    </Text>
                  </View>
                </View>

                {/* Address row (from request) */}
                <View className="flex-row items-center justify-between pt-3 ">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                      <Icon
                        name="map-marker-distance"
                        size={20}
                        color="#3B82F6"
                      />
                    </View>
                    <Text className="text-gray-600 text-base">Địa chỉ </Text>
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
              </View>
            </View>

            {request?.description && (
              <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
                <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
                  Mô tả
                </Text>
                <Text className="text-gray-900">{request.description}</Text>
              </View>
            )}
            {isRejected && (
              <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
                <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
                  Lí do từ chối
                </Text>
                <Text className="text-gray-900">{request.rejectMessage}</Text>
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
                      onLoad={() =>
                        console.log('[DeliveryInfo] image loaded', i)
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* time slots */}
            {renderTimeSlots(request?.timeSlots)}

            {/* Attributes or Condition */}
            {renderAttributesOrCondition()}

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

            {!isRejected && (
              <AppButton
                title="Xác nhận"
                loading={loading}
                disabled={loading}
                onPress={() =>
                  navigation.navigate('UserConfirm', { requestId: request?.id })
                }
              />
            )}
          </View>
        </ScrollView>
      )}
    </SubLayout>
  );
};

export default DeliveryInfoScreen;
