import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import ImageGalleryViewer from '../../components/ui/ImageGalleryViewer';
import { getStatusBadgeClass } from '../../utils/status';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
import { useRoute } from '@react-navigation/native';
import axiosClient from '../../config/axios';
import { Image } from 'react-native';
import AppAvatar from '../../components/ui/AppAvatar';
import AppButton from '../../components/ui/AppButton';
import routeService from '../../services/routeService';
import {
  connectShippingHub,
  joinRouteGroup,
  disconnect,
} from '../../services/signalrService';

const DeliveryInfoScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const productId: string | undefined = route.params?.productId;

  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let mounted = true;

    const start = async () => {
      try {
        await connectShippingHub({
          ShowConfirmButton: (data: any) => {
            console.log('📩 Received ShowConfirmButton event:', data);
            if (mounted) setShowVerifyButton(true);
          },
        });

        await joinRouteGroup(productId);
        console.log('👉 Joined SignalR group for product:', productId);
      } catch (err) {
        console.error('❌ SignalR connection/join error:', err);
      }
    };

    start();

    return () => {
      mounted = false;
      disconnect().catch(err =>
        console.error('SignalR disconnect error:', err),
      );
    };
  }, [productId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const r = await axiosClient.get(`/products/${productId}`);
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
  }, [productId]);

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
        <View className="bg-white border-2 border-red-200  rounded-2xl shadow-lg mb-3 py-2 px-4">
          <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-2 ">
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
      <View className="bg-white border-2 border-red-200  rounded-2xl shadow-lg mb-3 py-2 px-4 ">
        <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-2 ">
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
    if (request?.attributes && request.attributes.length > 0) {
      const attrs: any[] = request.attributes;
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
        <View className="bg-white border-2 border-red-200  rounded-2xl shadow-lg mb-3 py-2 px-4 ">
          <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-2 ">
            Thông số kỹ thuật
          </Text>
          {canRenderBox ? (
            <View className="flex-row justify-between py-2  ">
              <Text className="text-gray-600 text-sm">
                Dài x Rộng x Cao ({unit ? ` ${unit}` : ''})
              </Text>
              <Text className="text-gray-900 font-medium">
                {`${lengthAttr.value} x ${widthAttr.value} x ${heightAttr.value}`}
              </Text>
            </View>
          ) : null}

          {otherAttrs.map((attr: any, index: number) => (
            <View key={index} className="flex-row justify-between py-2">
              <Text className="text-gray-600  text-sm">
                {attr.attributeName}
              </Text>
              <Text className="text-gray-900 font-medium">
                {attr.value} {attr.unit || ''}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    return null;
  };

  const handleSkip = async () => {
    if (!request) return;
    const id = request.collectionRouterId;
    if (!id) return;
    setIsSkipping(true);
    try {
      await routeService.userConfirmRouter(id, false, true);
      setShowVerifyButton(false);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error: any) {
      console.error('[DeliveryQr] Skip error:', error);
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <SubLayout
      title="Thông tin giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      {loading ? (
        <View className="flex-1 bg-background-50 items-center justify-center">
          <ActivityIndicator size="large" color="#e85a4f" />
        </View>
      ) : (
        <ScrollView className="flex-1 bg-background-50">
          <View className="px-5 py-4">
            {request?.collector && (
              <View className="bg-primary-100 border-2 border-red-200  rounded-2xl shadow-lg mb-3  p-4 ">
                <View className="flex-row justify-between">
                  <Text className="text-text-main text-xs font-semibold uppercase tracking-wider mb-2 ">
                    Nhân viên thu gom
                  </Text>
                  <View className="flex-row items-center">
                    <Icon name="calendar" size={14} color="#fff" />
                    <Text className="text-text-main text-xs font-semibold uppercase tracking-wider ml-2">
                      {request?.pickUpDate} • {request?.estimatedTime}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <AppAvatar
                    name={request.collector.name}
                    uri={request.collector.avatar}
                    size={56}
                    style={{
                      borderWidth: 3,
                      borderColor: '#fff',
                    }}
                  />
                  <View className="flex-1 ml-2">
                    <Text className="text-white font-semibold text-base mb-1">
                      {request.collector.name}
                    </Text>

                    {request.collector.email && (
                      <View className="flex-row items-center mt-1">
                        <Icon name="mail" size={14} color="#fff" />
                        <Text className="text-text-main text-sm ml-2">
                          {request.collector.email}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            <View className="bg-white border-2 border-red-200  rounded-2xl shadow-lg mb-3 py-3 px-4 ">
              <View className="flex-row justify-between items-center mb-2">
                {request?.categoryName && (
                  <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider ">
                    {request.categoryName} • {request.brandName}
                  </Text>
                )}
                <View
                  className={`${getStatusBadgeClass(
                    request?.status,
                  )} px-3 py-1 rounded-lg `}
                >
                  <Text className="text-xs font-medium text-white">
                    {request?.status ?? 'Đang xử lý'}
                  </Text>
                </View>
              </View>
              {/* request thumbnail */}
              <ImageGalleryViewer images={request?.productImages || []} />

              <View className="space-y-4">
                <View className="flex pt-3 ">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-primary-50 items-center justify-center">
                      <Icon name="map-pin" size={12} color="#fff" />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        alignItems: 'flex-start',
                        minHeight: 30,
                      }}
                    >
                      <Text
                        style={{ textAlign: 'left' }}
                        className="text-text-sub text-sm"
                      >
                        {request?.address ?? '—'}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mt-2">
                    <View className="w-6 h-6 rounded-full bg-primary-50 items-center justify-center">
                      <Icon name="layers" size={12} color="#fff" />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Text
                        style={{ textAlign: 'left' }}
                        className="text-text-sub text-sm"
                      >
                        {request?.description ?? '—'}
                      </Text>
                    </View>
                  </View>
                  {isRejected && (
                    <View className="mt-3">
                      <Text className="text-red-500 text-xs font-semibold uppercase tracking-wider mb-2 ">
                        Lí do từ chối
                      </Text>
                      <Text className="text-gray-900">
                        {request.rejectMessage}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* time slots */}
            {renderTimeSlots(request?.timeSlots)}

            {renderAttributesOrCondition()}

            {showVerifyButton && (
              <View className="bg-green-50 border-2 border-green-500 rounded-2xl p-5 mb-4">
                <Text className="text-text-main font-semibold text-sm mb-4 text-center">
                  Nhân viên thu gom đang ở gần vị trí của bạn. Vui lòng chuẩn bị
                  xác thực.
                </Text>
                <View className="flex-row">
                  <View style={{ width: '48%', marginRight: '4%' }}>
                    <AppButton
                      title="Xác thực nhân viên"
                      color="#3366CC"
                      onPress={() => {
                        navigation.navigate('UserConfirm');
                      }}
                    />
                  </View>
                  <View style={{ width: '48%' }}>
                    <AppButton
                      title={'Bỏ qua xác thực'}
                      onPress={handleSkip}
                      disabled={isSkipping}
                      loading={isSkipping}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SubLayout>
  );
};

export default DeliveryInfoScreen;
