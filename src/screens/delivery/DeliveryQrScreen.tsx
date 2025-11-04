import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import AppButton from '../../components/ui/AppButton';
import QRCode from 'react-native-qrcode-svg';
import routeService from '../../services/routeService';
import axiosClient from '../../config/axios';

import SubLayout from '../../layout/SubLayout';

const DeliveryQrScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const routeProduct =
    route.params?.request ??
    route.params?.product ??
    route.params?.requestId ??
    null;
  const [product, setProduct] = useState<any>(
    typeof routeProduct === 'object' && routeProduct ? routeProduct : null,
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const productId =
          typeof routeProduct === 'object' ? routeProduct?.id : routeProduct;

        if (productId != null) {
          console.log(productId);
          try {
            const res = await routeService.getDetail(String(productId));

            if (mounted) setProduct(res ?? null);
          } catch (e) {
            console.warn('routeService.getDetail failed, falling back', e);
          }
        }
      } catch (e) {
        console.warn('Failed to load delivery', e);
      }
    };

    if (!product) load();
    return () => {
      mounted = false;
    };
  }, [routeProduct]);

  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = async () => {
    if (!product) return;
    const id = product?.collectionRouteId;
    setIsSkipping(true);
    try {
      const res = await routeService.userConfirmRouter(id, false);

      console.log('Skip response:', res);

      navigation.navigate('DeliveryPhotoConfirm', {
        requestId: product.collectionRouteId,
      });
    } catch (error: any) {
      console.error('Skip error:', error);
    } finally {
      setIsSkipping(false);
    }
  };

  const confirmPayload = {
    code: product?.collectionRouteId,
    shipper: {
      name: product?.collector?.name,
      avatar: product?.collector?.avatar,
      phone: product?.collector?.phone,
      licensePlate: product?.licensePlate || null,
    },
    request: {
      itemName: product?.itemName,
      pickUpItemImages: product?.pickUpItemImages || [],
      confirmImages: product?.confirmImages || [],
      collectionDate: product?.collectionDate || null,
      estimatedTime: product?.estimatedTime || null,
      address: product?.address || null,
    },
  };

  return (
    <SubLayout
      title="Xác nhận giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-6 py-8 items-center">
          <Text className="text-base mb-6 text-center text-gray-700">
            Khi đến nơi, hãy đưa mã xác nhận này cho khách hàng để họ quét và
            xác nhận lấy hàng.
          </Text>
          <View className="bg-white p-6 rounded-xl shadow mb-8 items-center">
            {product ? (
              <>
                <QRCode value={JSON.stringify(confirmPayload)} size={240} />
                <Text className="mt-8 text-sm font-semibold tracking-widest text-primary-600">
                  {product?.collectionRouteId}
                </Text>
              </>
            ) : (
              <View className="items-center p-6">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-sm text-gray-500">
                  Đang tải thông tin đơn hàng...
                </Text>
              </View>
            )}
          </View>

          <View className="w-full items-center">
            <AppButton
              title="Chụp ảnh xác nhận"
              disabled={!product}
              onPress={() =>
                product &&
                navigation.navigate('DeliveryPhotoConfirm', {
                  requestId: product.collectionRouteId,
                })
              }
            />
            <View className="w-full mt-3">
              <AppButton
                title="Skip"
                color="#ef4444"
                loading={isSkipping}
                disabled={!product || isSkipping}
                onPress={handleSkip}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default DeliveryQrScreen;
