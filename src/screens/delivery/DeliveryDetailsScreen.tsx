import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import SubLayout from '../../layout/SubLayout';
import DeliveryMapPanel from '../../components/DeliveryMapPanel';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCurrentLocationDistance } from '../../services/mapboxService';

const DeliveryDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const normalizedRequest = route.params?.normalizedRequest;

  const [distanceInMeters, setDistanceInMeters] = useState<number>(0);

  // Fetch distance once on mount
  useEffect(() => {
    const fetchInitialDistance = async () => {
      if (!normalizedRequest?.sender?.iat || !normalizedRequest?.sender?.ing) {
        console.log('Sender location not available');
        return;
      }

      try {
        const res = await getCurrentLocationDistance(
          normalizedRequest.sender.iat,
          normalizedRequest.sender.ing,
        );
        setDistanceInMeters(res.distance);
        console.log('Initial distance:', res.distance);
      } catch (err) {
        console.warn('Failed to get initial distance:', err);
      }
    };

    fetchInitialDistance();
  }, [normalizedRequest?.sender?.iat, normalizedRequest?.sender?.ing]);

  const handleConfirm = useCallback(() => {
    navigation.navigate('DeliveryPhotoConfirm', {
      requestId: normalizedRequest?.collectionRouteId,
    });
  }, [navigation, normalizedRequest?.collectionRouteId]);

  const handleReject = useCallback(() => {
    navigation.navigate('DeliveryCancel', {
      requestId: normalizedRequest?.collectionRouteId,
    });
  }, [navigation, normalizedRequest?.collectionRouteId]);

  const [resetQrTrigger, setResetQrTrigger] = useState(0);

  const handleRefresh = useCallback(async () => {
    if (!normalizedRequest?.sender?.iat || !normalizedRequest?.sender?.ing) {
      return;
    }

    try {
      console.log('🔄 Manual refresh triggered');
      const res = await getCurrentLocationDistance(
        normalizedRequest.sender.iat,
        normalizedRequest.sender.ing,
      );
      setDistanceInMeters(res.distance);
      // Only increment trigger on MANUAL refresh
      setResetQrTrigger(prev => prev + 1);
      console.log('✅ Manual refresh completed, new distance:', res.distance);
    } catch (err) {
      console.warn('Refresh failed:', err);
    }
  }, [normalizedRequest?.sender?.iat, normalizedRequest?.sender?.ing]);

  return (
    <SubLayout
      title="Chi tiết đơn hàng"
      onBackPress={() => navigation.goBack()}
      onRefresh={handleRefresh}
    >
      <View className="flex-1 bg-white">
        {DeliveryMapPanel ? (
          <DeliveryMapPanel
            normalizedRequest={normalizedRequest}
            isExpanded={true}
            distanceInMeters={distanceInMeters}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onRefresh={handleRefresh}
            resetQrTrigger={resetQrTrigger}
          />
        ) : (
          <View className="px-5 pb-5">
            <Text className="text-sm text-gray-500">
              Không thể tải giao diện
            </Text>
          </View>
        )}
      </View>
    </SubLayout>
  );
};

export default DeliveryDetailsScreen;
