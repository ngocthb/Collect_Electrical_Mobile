import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import QRCode from 'react-native-qrcode-svg';
import routeService from '../../services/routeService';
import * as signalR from '@microsoft/signalr';
import Icon from 'react-native-vector-icons/Feather';
import Config from '../../config/env';

import SubLayout from '../../layout/SubLayout';
import { useAppSelector } from '../../store/hooks';

const DeliveryQrScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAppSelector(s => s.auth.user);
  const routeProduct =
    route.params?.request ??
    route.params?.product ??
    route.params?.requestId ??
    null;
  const [product, setProduct] = useState<any>(
    typeof routeProduct === 'object' && routeProduct ? routeProduct : null,
  );
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] =
    useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const productId =
          typeof routeProduct === 'object' ? routeProduct?.id : routeProduct;

        if (productId != null) {
          try {
            const res = await routeService.getDetail(String(productId));

            if (mounted) {
              setProduct(res ?? null);
            }
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

  useEffect(() => {
    if (!product?.collectionRouteId) return;

    const hubUrl = Config.SIGNAL;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.on('ReceiveConfirmation', (routeId, status) => {
      if (routeId === product.collectionRouteId) {
        if (status === 'User_Confirm') {
          setIsWaitingForConfirmation(false);
          navigation.navigate('DeliveryPhotoConfirm', {
            requestId: product.collectionRouteId,
          });
        } else if (status === 'User_Reject') {
          setIsWaitingForConfirmation(false);
          toast.show({
            type: 'confirm',
            text1: 'Xác nhận thất bại',
            text2:
              'Người gửi không xác nhận bạn là người lấy hàng. Vui lòng kiểm tra lại thông tin.',
            autoHide: false,
            props: {
              button1: 'Đóng',
              button2: 'Về trang đơn hàng',
              onCancel: () => {
                toast.hide();
              },
              onConfirm: () => {
                toast.hide();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'DeliveryOrder' }],
                });
              },
            },
          });
        }
      } else {
        console.log('[DeliveryQr] ⚠️ RouteId mismatch - ignoring notification');
      }
    });

    // Add more event listeners for debugging
    newConnection.onreconnecting(error => {
      console.log('[DeliveryQr] 🔄 SignalR reconnecting...', error);
    });

    newConnection.onreconnected(connectionId => {
      // Rejoin group after reconnection
      newConnection
        .invoke('JoinShipperGroup', product.collectionRouteId)

        .catch(err =>
          console.error('[DeliveryQr] Error rejoining group:', err),
        );
    });

    newConnection.onclose(error => {
      console.log('[DeliveryQr] ❌ SignalR connection closed', error);
    });

    // Now start the connection
    newConnection
      .start()
      .then(() => {
        return newConnection.invoke('JoinShipperGroup', user?.userId);
      })
      .then(() => {
        setConnection(newConnection);
        setIsWaitingForConfirmation(true);
      })
      .catch(err => {
        console.error('[DeliveryQr] ❌ SignalR connection/join error:', err);
      });

    return () => {
      if (newConnection) {
        newConnection
          .stop()

          .catch(err =>
            console.error('[DeliveryQr] Error stopping connection:', err),
          );
      }
    };
  }, [product?.collectionRouteId, navigation]);

  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = async () => {
    if (!product) return;
    const id = product?.collectionRouteId;
    setIsSkipping(true);
    try {
      const res = await routeService.userConfirmRouter(id, false, true);

      navigation.navigate('DeliveryPhotoConfirm', {
        requestId: product.collectionRouteId,
      });
    } catch (error: any) {
      console.error('[DeliveryQr] Skip error:', error);
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

          {/* Waiting status indicator */}
          {isWaitingForConfirmation && product && (
            <View className="w-full bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
              <View className="flex-row items-center justify-center">
                <Icon name="clock" size={20} color="#3B82F6" />
                <Text className="text-sm text-blue-800 text-center ml-2 font-medium">
                  Đang chờ khách hàng xác nhận...
                </Text>
              </View>
              <Text className="text-xs text-blue-600 text-center mt-2">
                Vui lòng yêu cầu khách hàng quét mã QR và xác nhận trên thiết bị
                của họ
              </Text>
            </View>
          )}

          <View className="w-full items-center">
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
