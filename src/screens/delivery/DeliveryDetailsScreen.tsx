import React from 'react';
import { View, Text, Image } from 'react-native';
import SubLayout from '../../layout/SubLayout';
import DeliveryMapPanel from '../../components/DeliveryMapPanel';
import { useNavigation, useRoute } from '@react-navigation/native';

const DeliveryDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const normalizedRequest = route.params?.normalizedRequest;
  const pickupLocationName = route.params?.pickupLocationName;
  const isRouteLoading = route.params?.isRouteLoading;
  const distanceText = route.params?.distanceText;
  const durationText = route.params?.durationText;
  console.log(normalizedRequest);
  return (
    <SubLayout
      title="Chi tiết đơn hàng"
      onBackPress={() => navigation.goBack()}
    >
      <View className="flex-1 bg-white">
        {DeliveryMapPanel ? (
          <DeliveryMapPanel
            normalizedRequest={normalizedRequest}
            pickupLocationName={pickupLocationName}
            isExpanded={true}
            isRouteLoading={isRouteLoading}
            distanceText={distanceText}
            durationText={durationText}
            onCall={() => {}}
            onMessage={() => {}}
            onConfirm={() =>
              navigation.navigate('DeliveryConfirm', {
                requestId: normalizedRequest?.collectionRouteId,
              })
            }
            onReject={() =>
              navigation.navigate('DeliveryCancel', {
                requestId: normalizedRequest?.collectionRouteId,
              })
            }
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
