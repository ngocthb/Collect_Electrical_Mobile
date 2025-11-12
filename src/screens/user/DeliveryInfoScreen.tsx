import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import ImageModal from '../../components/ui/ImageModal';
import { getStatusBadgeClass } from '../../utils/status';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
import { useRoute } from '@react-navigation/native';
import axiosClient from '../../config/axios';
import { Image } from 'react-native';
import { formatTimestamp } from '../../utils/dateUtils';

const DeliveryInfoScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const requestId: string | undefined = route.params?.requestId;

  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const renderTimeSlots = (slots: Record<string, string[]>) => {
    if (!slots) return null;
    const entries = Object.entries(slots).filter(
      ([, v]) => Array.isArray(v) && v.length > 0,
    );
    if (entries.length === 0) return null;
    // Group days that share identical time ranges to display them on one row
    const groups = new Map<string, { times: string[]; days: string[] }>();

    entries.forEach(([day, times]) => {
      const key = Array.isArray(times) ? times.join('|') : String(times);
      if (groups.has(key)) {
        groups.get(key)!.days.push(day);
      } else {
        groups.set(key, {
          times: Array.isArray(times) ? times : [times],
          days: [day],
        });
      }
    });

    const grouped = Array.from(groups.values());
    const totalDays = entries.length;
    const allDaysSameGroup = totalDays === 7 && grouped.length === 1;

    const shortDayLabel = (code: string) => {
      if (!code) return '';
      if (/^T[2-7]$/.test(code) || code === 'CN') return code;
      if (code === 'Thứ 2') return 'T2';
      if (code === 'Thứ 3') return 'T3';
      if (code === 'Thứ 4') return 'T4';
      if (code === 'Thứ 5') return 'T5';
      if (code === 'Thứ 6') return 'T6';
      if (code === 'Thứ 7') return 'T7';
      if (code === 'Chủ Nhật' || code === 'Chủ nhật') return 'CN';

      return String(code).slice(0, 3);
    };

    // if schedule contains entries for all 7 days and they're all the same group,
    // show a compact "Cả tuần" row
    if (allDaysSameGroup) {
      const g = grouped[0];
      return (
        <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Khung thời gian
          </Text>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-gray-700">Cả tuần</Text>
            <Text className="text-gray-900 font-medium">
              {g.times.filter(Boolean).join(' - ')}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Khung thời gian
        </Text>
        {grouped.map((g, idx) => (
          <View
            key={idx}
            className="flex-row items-center justify-between py-2"
          >
            <Text className="text-gray-700">
              {g.days.length === 7
                ? 'Cả tuần'
                : g.days.map(d => shortDayLabel(d)).join(', ')}
            </Text>
            <Text className="text-gray-900 font-medium">
              {g.times.filter(Boolean).join(' - ')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderAttributesOrCondition = () => {
    if (request?.product?.attributes && request.product.attributes.length > 0) {
      const attrs: any[] = request.product.attributes;
      const normalize = (s: string) => (s || '').toLowerCase();
      const findByName = (keywords: string[]) =>
        attrs.find(a =>
          keywords.some(k => normalize(a.attributeName).includes(k)),
        );

      const lengthAttr = findByName(['chiều dài', 'chiều dai', 'length']);
      const widthAttr = findByName(['chiều rộng', 'chiều rong', 'width']);
      const heightAttr = findByName(['chiều cao', 'height']);

      const parseUnitFromName = (name?: string) => {
        if (!name) return '';
        const m = name.match(/\(([^)]+)\)/);
        return m && m[1] ? m[1].trim() : '';
      };

      const otherAttrs = attrs.filter(
        a => ![lengthAttr, widthAttr, heightAttr].includes(a),
      );

      const canRenderBox = lengthAttr && widthAttr && heightAttr;
      const unit =
        (lengthAttr && lengthAttr.unit) ||
        (widthAttr && widthAttr.unit) ||
        (heightAttr && heightAttr.unit) ||
        parseUnitFromName(lengthAttr?.attributeName) ||
        parseUnitFromName(widthAttr?.attributeName) ||
        parseUnitFromName(heightAttr?.attributeName) ||
        '';

      return (
        <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Thông số kỹ thuật
          </Text>
          {canRenderBox ? (
            <View className="flex-row justify-between py-2  ">
              <Text className="text-gray-600">
                Kích thước ({unit ? ` ${unit}` : ''})
              </Text>
              <Text className="text-gray-900 font-medium">
                {`${lengthAttr.value} x ${widthAttr.value} x ${heightAttr.value}`}
                {` (d x r x c)`}
              </Text>
            </View>
          ) : null}

          {otherAttrs.map((attr: any, index: number) => (
            <View key={index} className="flex-row justify-between py-2">
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

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleImagePress = (imageUri: string) => {
    setSelectedImage(imageUri);
    toggleModal();
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
        <ScrollView className="flex-1 ">
          <View className="p-5">
            <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
              {request?.category && (
                <Text className="text-sm text-gray-500 mb-1">
                  {request.category}
                </Text>
              )}
              {/* request thumbnail */}
              {request?.image && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="space-x-3"
                >
                  {request.images.map((img: any, i: number) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleImagePress(img.uri)}
                    >
                      <Image
                        source={img && img.uri ? { uri: img.uri } : img}
                        style={{
                          width: 84,
                          height: 84,
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
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <View className="flex-row justify-between items-center mt-2">
                <View
                  className={`${getStatusBadgeClass(
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

              <View className="space-y-4">
                <View className="flex-row items-center justify-between pt-3 ">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                      <Icon name="map-pin" size={20} color="#3B82F6" />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        alignItems: 'flex-end',
                        minHeight: 30,
                      }}
                    >
                      <Text
                        style={{ textAlign: 'left' }}
                        className="text-gray-900l text-sm"
                      >
                        {request?.address ?? '—'}
                      </Text>
                    </View>
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
          </View>
        </ScrollView>
      )}
      <ImageModal
        visible={isModalVisible}
        imageUri={selectedImage}
        onClose={toggleModal}
      />
    </SubLayout>
  );
};

export default DeliveryInfoScreen;
