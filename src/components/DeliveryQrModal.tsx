import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import AppButton from './ui/AppButton';
import QRCode from 'react-native-qrcode-svg';
import routeService from '../services/routeService';
import * as signalR from '@microsoft/signalr';
import Icon from 'react-native-vector-icons/Feather';
import Config from '../config/env';
import { useAppSelector } from '../store/hooks';

interface DeliveryQrModalProps {
  visible: boolean;
  onClose: () => void;
  request?: any;
  product?: any;
  requestId?: string;
  onAccept?: () => void;
  onSkip?: () => void;
}

const DeliveryQrModal: React.FC<DeliveryQrModalProps> = ({
  visible,
  onClose,
  request,
  product: productProp,
  requestId,
  onAccept,
  onSkip,
}) => {
  const navigation = useNavigation<any>();
  const user = useAppSelector(s => s.auth.user);
  const routeProduct = request ?? productProp ?? requestId ?? null;
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
      if (routeId !== product.collectionRouteId) {
        console.log('[DeliveryQr] ⚠️ RouteId mismatch - ignoring notification');
        return;
      }

      setIsWaitingForConfirmation(false);

      const s = String(status ?? '').toLowerCase();
      try {
        if (s.includes('confirm')) {
          try {
            onAccept?.();
          } catch (e) {
            console.warn('[DeliveryQr] onAccept handler error', e);
          }
        } else if (s.includes('reject')) {
          try {
            onSkip?.();
          } catch (e) {
            console.warn('[DeliveryQr] onSkip handler error', e);
          }
          // Show toast for rejects coming from server/SignalR
          toast.show({
            type: 'error',
            text1: 'Từ chối',
            text2: 'Khách hàng đã từ chối lấy hàng',
          });
        } else {
          if (status === 'User_Confirm' || status === 'User_Skip') {
            try {
              onAccept?.();
            } catch (e) {
              console.warn('[DeliveryQr] onAccept handler error', e);
            }
          } else if (status === 'User_Reject') {
            try {
              onSkip?.();
            } catch (e) {
              console.warn('[DeliveryQr] onSkip handler error', e);
            }
            toast.show({
              type: 'error',
              text1: 'Từ chối',
              text2: 'Khách hàng đã từ chối lấy hàng',
            });
          }
        }
      } catch (e) {
        console.warn('[DeliveryQr] handler error', e);
      }

      // Close modal after handling
      onClose?.();
    });

    newConnection.onreconnecting(error => {
      console.log('[DeliveryQr] 🔄 SignalR reconnecting...', error);
    });

    newConnection.onreconnected(connectionId => {
      newConnection
        .invoke('JoinShipperGroup', product.collectionRouteId)
        .catch(err =>
          console.error('[DeliveryQr] Error rejoining group:', err),
        );
    });

    newConnection.onclose(error => {
      console.log('[DeliveryQr] ❌ SignalR connection closed', error);
    });

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white rounded-2xl max-h-[90%] w-full max-w-[520px] overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-900">
              Xác nhận giao hàng
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Icon name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="w-full bg-white">
            <View className="px-6 py-6 items-center w-full">
              <Text className="text-sm mb-6 text-center text-gray-600">
                Khi đến nơi, hãy đưa mã xác nhận này cho khách hàng để họ quét
                và xác nhận lấy hàng.
              </Text>
              <View className="bg-gray-50 p-6 rounded-2xl mb-6 items-center">
                {product ? (
                  <>
                    <QRCode value={JSON.stringify(confirmPayload)} size={220} />
                    <Text className="mt-6 text-xs font-bold tracking-widest text-primary-100 text-center">
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

              {isWaitingForConfirmation && product && (
                <View className="w-full bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
                  <View className="flex-row items-center justify-center">
                    <Icon name="clock" size={18} color="#3B82F6" />
                    <Text className="text-sm text-blue-800 text-center ml-2 font-medium">
                      Đang chờ khách hàng xác nhận...
                    </Text>
                  </View>
                  <Text className="text-xs text-blue-600 text-center mt-2">
                    Vui lòng yêu cầu khách hàng quét mã QR và xác nhận
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DeliveryQrModal;
