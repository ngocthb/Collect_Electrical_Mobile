import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import AppButton from './ui/AppButton';
import AppAvatar from './ui/AppAvatar';
import ImageGalleryViewer from './ui/ImageGalleryViewer';
import DeliveryQrModal from '../components/DeliveryQrModal';
// @ts-ignore
import { ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import axiosClient from '../config/axios';
import { Linking } from 'react-native';
import { sendNotification } from '../services/notificationServices';
const ARRIVAL_DISTANCE_THRESHOLD = 1500; // meters

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
  const hasReceivedSocketConfirmationRef = React.useRef(false);
  const [isSendNoti, setIsSendNoti] = useState(false);
  // Reset QR modal flag when resetQrTrigger changes (manual refresh only)
  useEffect(() => {
    if (resetQrTrigger && resetQrTrigger > 0) {
      console.log(
        '🔄 Resetting QR modal flag via manual refresh:',
        resetQrTrigger,
      );

      hasShownQrModalRef.current = false;

      if (
        !hasReceivedSocketConfirmationRef.current &&
        typeof distanceInMeters === 'number' &&
        distanceInMeters > 0 &&
        distanceInMeters < ARRIVAL_DISTANCE_THRESHOLD
      ) {
        console.log(
          '✅ Auto-showing QR modal after refresh, distance:',
          distanceInMeters,
        );
        setShowQrModal(true);
        handleSendNoti();
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
      } else if (hasReceivedSocketConfirmationRef.current) {
        console.log('⏭️ Skipping QR modal - already confirmed via socket');
      }
    }
  }, [resetQrTrigger, distanceInMeters]);

  // Only check on mount or when entering the threshold for the first time
  useEffect(() => {
    // Chỉ chạy khi không có resetQrTrigger (tức là lần đầu mount)
    if (
      !resetQrTrigger &&
      !hasReceivedSocketConfirmationRef.current &&
      typeof distanceInMeters === 'number' &&
      distanceInMeters > 0 &&
      distanceInMeters < ARRIVAL_DISTANCE_THRESHOLD &&
      !hasShownQrModalRef.current
    ) {
      console.log(
        '✅ Auto-showing QR modal on first threshold, distance:',
        distanceInMeters,
      );
      setShowQrModal(true);
      handleSendNoti();
      hasShownQrModalRef.current = true;
    }
  }, [distanceInMeters, resetQrTrigger]);

  useEffect(() => {
    const notifyArrival = async () => {
      if (
        typeof distanceInMeters === 'number' &&
        distanceInMeters > 0 &&
        distanceInMeters < ARRIVAL_DISTANCE_THRESHOLD &&
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
  const isRefreshingRef = React.useRef(false);

  const handleSendNoti = async () => {
    if (isSendNoti) return;
    if (!normalizedRequest?.productId) return;
    try {
      setIsSendNoti(true);
      const response = sendNotification(normalizedRequest.productId);
      console.log('📍 Notify arrival called:', response);
    } catch (err) {
      console.warn('Failed to notify arrival:', err);
      setIsSendNoti(false);
    }
  };

  const handleRefreshInternal = async () => {
    if (!onRefresh) return;
    try {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      setRefreshing(true);
      await onRefresh();
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
  };

  // Auto-refresh every 2 minutes (120000 ms)
  useEffect(() => {
    if (!onRefresh) return;
    let mounted = true;
    const interval = setInterval(async () => {
      if (!mounted) return;
      try {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        await onRefresh();
      } catch (e) {
        console.warn('Auto-refresh error:', e);
      } finally {
        isRefreshingRef.current = false;
        if (mounted) setRefreshing(false);
      }
    }, 120000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [onRefresh]);

  const handleDirections = async () => {
    const lat = normalizedRequest?.iat;
    const lng = normalizedRequest?.ing;

    if (!lat || !lng) {
      console.warn('No coordinates available for directions');
      return;
    }

    try {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        await Linking.openURL(fallbackUrl);
      }
    } catch (e) {
      console.warn('Cannot open Google Maps', e);
    }
  };

  console.log(normalizedRequest);
  console.log(distanceInMeters);
  return (
    <ScrollView
      className="flex-1 bg-background-50"
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
            <View>
              <View className="bg-primary-100 border-2 border-red-200  rounded-2xl shadow-lg mb-3  p-4">
                <Text className="text-text-main text-xs font-semibold uppercase tracking-wider mb-2 ">
                  Thông tin người gửi
                </Text>
                <View className="flex-row items-center">
                  <View className="relative bg-primary-100 rounded-full p-1">
                    <AppAvatar
                      name={normalizedRequest?.sender?.name}
                      uri={normalizedRequest?.sender?.avatar}
                      size={56}
                      style={{
                        borderWidth: 3,
                        borderColor: '#fff',
                      }}
                    />
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-white font-semibold text-base mb-1">
                      {normalizedRequest?.sender?.name ?? 'Người gửi'}
                    </Text>
                    <TouchableOpacity onPress={handleDirections}>
                      <Text className="text-sm text-white">
                        {normalizedRequest?.address || '—'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <ZegoSendCallInvitationButton
                    invitees={invitees}
                    isVideoCall={false}
                    resourceID="thugom_data"
                  />
                </View>
              </View>
            </View>

            <View className="bg-white border-2 border-red-200  rounded-2xl shadow-lg mb-3 py-3 px-4 ">
              <View className="mb-4">
                <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-3">
                  {normalizedRequest?.subCategoryName} •{' '}
                  {normalizedRequest?.brandName}
                </Text>
                <ImageGalleryViewer
                  images={normalizedRequest?.pickUpItemImages || []}
                  imageSize={200}
                  imageSpacing={8}
                  borderRadius={8}
                />
              </View>

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
            </View>
            {showActionButtons && (
              <>
                <View className="flex-row justify-between ">
                  <View style={{ width: '48%' }}>
                    <AppButton title="Lấy hàng thất bại" onPress={onReject} />
                  </View>
                  <View style={{ width: '48%' }}>
                    <AppButton
                      title="Lấy hàng thành công"
                      onPress={onConfirm}
                      color="#3366CC"
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
          hasReceivedSocketConfirmationRef.current = true;
        }}
        onSkip={() => {
          setShowQrModal(false);
          setShowActionButtons(false);
          hasReceivedSocketConfirmationRef.current = true;
          console.log(
            '✅ Socket confirmation received (skip) - modal will not show again',
          );
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
