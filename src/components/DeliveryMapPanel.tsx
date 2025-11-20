import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppButton from './ui/AppButton';
import AppAvatar from './ui/AppAvatar';
import { maskPhone } from '../utils/validations';
import DeliveryQrModal from '../components/DeliveryQrModal';
// @ts-ignore
import { ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import axiosClient from '../config/axios';

type Props = {
  normalizedRequest: any;
  pickupLocationName?: string;
  isExpanded: boolean;
  distanceInMeters?: number;
  onConfirm: () => void;
  onReject: () => void;
  onRefresh?: () => Promise<void>;
  resetQrTrigger?: number;
};

const DeliveryMapPanel: React.FC<Props> = ({
  normalizedRequest,
  isExpanded,
  distanceInMeters,
  onConfirm,
  onReject,
  onRefresh,
  resetQrTrigger,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const hasShownQrModalRef = React.useRef(false);
  const hasNotifiedArrivalRef = React.useRef(false);

  // Reset QR modal flag when resetQrTrigger changes (manual refresh only)
  useEffect(() => {
    if (resetQrTrigger && resetQrTrigger > 0) {
      console.log(
        '🔄 Resetting QR modal flag via manual refresh:',
        resetQrTrigger,
      );
      // Reset flag trước khi check
      hasShownQrModalRef.current = false;

      // Always check and show modal after manual refresh if distance is small
      if (
        typeof distanceInMeters === 'number' &&
        distanceInMeters > 0 &&
        distanceInMeters < 5000000000
      ) {
        console.log(
          '✅ Auto-showing QR modal after refresh, distance:',
          distanceInMeters,
        );
        setShowQrModal(true);
        hasShownQrModalRef.current = true;

        if (normalizedRequest?.productId) {
          (async () => {
            try {
              hasNotifiedArrivalRef.current = true;
              const response = await axiosClient.post(
                `/products/notify-arrival/${normalizedRequest.productId}`,
              );
              console.log(
                '📍 Notify arrival (manual refresh) called:',
                response,
              );
            } catch (err) {
              console.warn('Failed to notify arrival (manual refresh):', err);
              hasNotifiedArrivalRef.current = false;
            }
          })();
        }
      }
    }
  }, [resetQrTrigger, distanceInMeters]);

  // Only check on mount or when entering the threshold for the first time
  useEffect(() => {
    // Chỉ chạy khi không có resetQrTrigger (tức là lần đầu mount)
    if (
      !resetQrTrigger &&
      typeof distanceInMeters === 'number' &&
      distanceInMeters > 0 &&
      distanceInMeters < 5000 &&
      !hasShownQrModalRef.current
    ) {
      console.log(
        '✅ Auto-showing QR modal on first threshold, distance:',
        distanceInMeters,
      );
      setShowQrModal(true);
      hasShownQrModalRef.current = true;
    }
  }, [distanceInMeters, resetQrTrigger]);

  console.log(normalizedRequest);
  // Notify arrival API when distance < 5000m
  useEffect(() => {
    const notifyArrival = async () => {
      if (
        typeof distanceInMeters === 'number' &&
        distanceInMeters > 0 &&
        distanceInMeters < 5000000000 &&
        !hasNotifiedArrivalRef.current &&
        normalizedRequest?.postId
      ) {
        try {
          hasNotifiedArrivalRef.current = true;
          const response = await axiosClient.post(
            `/products/notify-arrival/${normalizedRequest.productId}`,
          );
          console.log('📍 Notify arrival API called:', response);
        } catch (err) {
          console.warn('Failed to notify arrival:', err);
          hasNotifiedArrivalRef.current = false;
        }
      }
    };

    notifyArrival();
  }, [distanceInMeters, normalizedRequest?.postId]);

  const receiver = normalizedRequest?.sender;
  const cleanReceiverId = receiver?.userId
    ? receiver.userId.replace(/[^a-zA-Z0-9_]/g, '')
    : null;

  const invitees = useMemo(() => {
    if (!cleanReceiverId) return [];
    return [
      {
        userID: String(cleanReceiverId),
        userName: String(receiver?.name || 'User'),
      },
    ];
  }, [cleanReceiverId, receiver?.name]);

  // pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshInternal = async () => {
    if (!onRefresh) return;
    try {
      setRefreshing(true);
      await onRefresh();
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      scrollEnabled={isExpanded}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefreshInternal}
          />
        ) : undefined
      }
    >
      <View className="px-5 pb-5">
        {isExpanded && (
          <>
            <View className="mb-4">
              <Text className="text-xs text-gray-500 mb-3">
                Thông tin người gửi
              </Text>
              <View className=" bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-center">
                  <AppAvatar
                    uri={normalizedRequest?.sender?.avatar}
                    size={56}
                  />
                  <View className="flex-1 ml-4">
                    <Text className="text-base font-bold text-gray-900">
                      {normalizedRequest?.sender?.name ?? 'Người gửi'}
                    </Text>

                    <Text className="text-sm text-gray-500 mt-1">
                      SĐT: {maskPhone(normalizedRequest?.sender?.phone) || '—'}
                    </Text>
                  </View>
                  <ZegoSendCallInvitationButton
                    invitees={invitees}
                    isVideoCall={false}
                    resourceID="thugom_data"
                  />
                </View>
                <Text className="text-sm text-gray-500 mt-2">
                  {normalizedRequest?.sender?.address || '—'}
                </Text>
              </View>
            </View>

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
              <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-3">
                {normalizedRequest?.subCategoryName} •{' '}
                {normalizedRequest?.brandName}
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
              </View>
            </View>

            {showActionButtons && (
              <>
                <View className="flex-row justify-between ">
                  <View style={{ width: '48%' }}>
                    <AppButton
                      title="Lấy hàng thất bại"
                      onPress={onReject}
                      color="#E53935"
                    />
                  </View>
                  <View style={{ width: '48%' }}>
                    <AppButton
                      title="Lấy hàng thành công"
                      onPress={onConfirm}
                    />
                  </View>
                </View>
                <View className="h-5" />
              </>
            )}
          </>
        )}
      </View>

      <DeliveryQrModal
        visible={showQrModal}
        onClose={() => setShowQrModal(false)}
        request={normalizedRequest}
        onAccept={() => {
          setShowQrModal(false);
          setShowActionButtons(true);
        }}
        onSkip={() => {
          setShowQrModal(false);

          setShowActionButtons(false);
        }}
      />
    </ScrollView>
  );
};

// Avoid re-rendering unless important props change. We compare by
// collectionRouteId (stable identifier), isExpanded and a small change
// in distanceInMeters (ignore tiny fluctuations under 0.5m).
export default React.memo(DeliveryMapPanel, (prev, next) => {
  const prevId = prev.normalizedRequest?.collectionRouteId;
  const nextId = next.normalizedRequest?.collectionRouteId;
  if (prevId !== nextId) return false;
  if (prev.isExpanded !== next.isExpanded) return false;

  // So sánh resetQrTrigger để re-render khi có refresh
  if (prev.resetQrTrigger !== next.resetQrTrigger) return false;

  const prevDist =
    typeof prev.distanceInMeters === 'number' ? prev.distanceInMeters : -1;
  const nextDist =
    typeof next.distanceInMeters === 'number' ? next.distanceInMeters : -1;
  if (Math.abs(prevDist - nextDist) > 0.5) return false;
  return true;
});
