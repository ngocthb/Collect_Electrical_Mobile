import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import ImageGalleryViewer from '../../components/ui/ImageGalleryViewer';
import {
  getStatusBadgeClass,
  shortDayLabel,
  groupTimeSlots,
  parseProductAttributes,
} from '../../utils/productDetailHelper';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
import { useRoute } from '@react-navigation/native';

import AppAvatar from '../../components/ui/AppAvatar';
import AppButton from '../../components/ui/AppButton';
import routeService from '../../services/routeService';
import { getProductById } from '../../services/productService';
import {
  connectShippingHub,
  joinRouteGroup,
  disconnect,
} from '../../services/signalrService';
import { ProductDetail } from '../../types/Product';

const ProductDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const productId: string | undefined = route.params?.productId;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [product, setProduct] = useState<ProductDetail>();

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

  const loadProduct = async (isRefresh = false) => {
    if (!productId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getProductById(productId);
      setProduct(data);

      setIsRejected(data.status === 'Đã Từ Chối');
    } catch (e) {
      console.warn('Failed to load request', e);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const onRefresh = () => {
    loadProduct(true);
  };

  const renderTimeSlots = (slots: Record<string, string[]>) => {
    const result = groupTimeSlots(slots);
    if (!result) return null;

    const { grouped, allDaysSameGroup } = result;

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
    if (product?.attributes && product.attributes.length > 0) {
      const parsed = parseProductAttributes(product.attributes);
      if (!parsed) return null;

      const {
        lengthAttr,
        widthAttr,
        heightAttr,
        otherAttrs,
        canRenderBox,
        unit,
      } = parsed;

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
                {attr.optionName} {attr.unit || ''}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    return null;
  };

  const handleSkip = async () => {
    if (!product) return;
    const id = product.collectionRouterId;
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
      onRefresh={onRefresh}
    >
      {loading ? (
        <View className="flex-1 bg-background-50 items-center justify-center">
          <ActivityIndicator size="large" color="#e85a4f" />
        </View>
      ) : (
        <View className="flex-1 bg-background-50">
          <View className="px-5 py-4">
            {product?.collector && (
              <View className="bg-primary-100 border-2 border-red-200  rounded-2xl shadow-lg mb-3  p-4 ">
                <View className="flex-row justify-between">
                  <Text className="text-white text-xs font-semibold uppercase tracking-wider mb-2 ">
                    Nhân viên thu gom
                  </Text>
                  <View className="flex-row items-center">
                    <Icon name="calendar" size={14} color="#fff" />
                    <Text className="text-white text-xs font-semibold uppercase tracking-wider ml-2">
                      {product?.pickUpDate} • {product?.estimatedTime}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <AppAvatar
                    name={product.collector.name}
                    uri={product.collector.avatar}
                    size={56}
                    style={{
                      borderWidth: 3,
                      borderColor: '#fff',
                    }}
                  />
                  <View className="flex-1 ml-2">
                    <Text className="text-white font-semibold text-base mb-1">
                      {product.collector.name}
                    </Text>

                    {product.collector.email && (
                      <View className="flex-row items-center mt-1">
                        <Icon name="mail" size={14} color="#fff" />
                        <Text className="text-white text-sm ml-2">
                          {product.collector.email}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            <View className="bg-white border-2 border-red-200  rounded-2xl shadow-lg mb-3 py-3 px-4 ">
              <View className="flex-row justify-between items-center mb-2">
                {product?.categoryName && (
                  <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider ">
                    {product.categoryName} • {product.brandName}
                  </Text>
                )}
                <View
                  className={`${getStatusBadgeClass(
                    product?.status ?? '',
                  )} px-3 py-1 rounded-lg `}
                >
                  <Text className="text-xs font-medium text-white">
                    {product?.status ?? 'Đang xử lý'}
                  </Text>
                </View>
              </View>
              {/* request thumbnail */}
              <ImageGalleryViewer images={product?.productImages || []} />

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
                        {product?.address ?? '—'}
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
                        {product?.description ?? '—'}
                      </Text>
                    </View>
                  </View>
                  {isRejected && (
                    <View className="mt-3">
                      <Text className="text-red-500 text-xs font-semibold uppercase tracking-wider mb-2 ">
                        Lí do từ chối
                      </Text>
                      <Text className="text-gray-900">
                        {product?.rejectMessage}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* time slots */}
            {product?.schedule &&
              renderTimeSlots(
                product.schedule.reduce((acc, item) => {
                  if (item.dayName && item.slots) {
                    acc[item.dayName] = [
                      item.slots.startTime || '',
                      item.slots.endTime || '',
                    ];
                  }
                  return acc;
                }, {} as Record<string, string[]>),
              )}

            {renderAttributesOrCondition()}

            {showVerifyButton && (
              <View className="mt-4 mb-4">
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
        </View>
      )}
    </SubLayout>
  );
};

export default ProductDetailsScreen;
