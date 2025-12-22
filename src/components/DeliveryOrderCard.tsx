import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  getOrderAddress,
  resolveStatus,
  getStatusColor,
} from '../utils/deliveryHelpers';
// @ts-ignore
import { ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { useNavigation } from '@react-navigation/native';

const cleanUserIdForZego = (userId: string) => {
  return userId.replace(/[^a-zA-Z0-9_]/g, '');
};

type Props = {
  order: any;

  isSelectedDateToday: boolean;
};

const DeliveryOrderCard = ({ order, isSelectedDateToday }: Props) => {
  const navigation = useNavigation<any>();
  const status = resolveStatus(order);
  const actionsDisabled = status === 'failed' || status === 'completed';

  const receiver = order?.sender;
  const cleanReceiverId = receiver?.userId
    ? cleanUserIdForZego(receiver.userId)
    : null;
console.log(order)
  const invitees = useMemo(() => {
    if (!cleanReceiverId) return [];
    return [
      {
        userID: String(cleanReceiverId),
        userName: String(receiver?.name || 'User'),
      },
    ];
  }, [cleanReceiverId, receiver?.name]);

  const handleEyePress = () => {
 
    navigation.navigate('DeliveryDetails', {
      normalizedRequest: order,
      pickupLocationName: getOrderAddress(order),
      isRouteLoading: false,
      distanceText: order?.distanceText || '---',
      durationText: '---',
    });
  };

  const handleDirections = async () => {
  
      const lat = order?.iat ?? order?.lat;
    const lng = order?.ing ?? order?.lng;

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

  return (
    <View className="flex-row mb-8 relative z-10">
      <View className="items-center mr-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: `${getStatusColor(status)}20`,
          }}
        >
          <Icon
            name={
              status === 'completed'
                ? 'check-circle'
                : status === 'failed'
                ? 'alert-circle'
                : 'clock-outline'
            }
            size={24}
            color={getStatusColor(status)}
          />
        </View>
      </View>

      {/* Order card */}
      <View className="flex-1">
        <View className="flex-row justify-between mb-1">
          <View className="flex-col flex-1">
            <View className="flex-row items-center mb-1">
              <View>
                <Text className="text-sm font-bold text-text-main">
                  {order?.sender?.name}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-text-main">
              <Icon name="clock" size={10} color="#e85a4f" />{' '}
              {order?.estimatedTime}
            </Text>
          </View>

          <View className="flex-row gap-3 items-start">
            <TouchableOpacity
              onPress={() =>
                handleEyePress()
              }
              className="bg-gray-100 rounded-full p-2"
              disabled={isSelectedDateToday }
              style={{
                opacity: !isSelectedDateToday || actionsDisabled ? 0.4 : 1,
              }}
            >
              <Icon name="eye" size={26} color="#3366CC" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handleDirections()
              }
              className="bg-gray-100 rounded-full p-2"
              disabled={isSelectedDateToday }
              style={{
                opacity: isSelectedDateToday  ? 0.4 : 1,
              }}
            >
              <Icon name="directions" size={26} color="#3366CC" />
            </TouchableOpacity>

            {invitees.length > 0 && !isSelectedDateToday && actionsDisabled ? (
              <ZegoSendCallInvitationButton
                invitees={invitees}
                isVideoCall={false}
                resourceID="thugom_data"
              />
            ) : invitees.length > 0 ? (
              <View
                className="bg-gray-100 rounded-full p-2"
                style={{ opacity: 0.4 }}
              >
                <Icon name="phone-in-talk" size={26} color="#3366CC" />
              </View>
            ) : (
              <View>
                <Text style={{ color: 'red', fontSize: 10 }}>
                  No receiver ID
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-white rounded-xl p-3 mb-3 border border-red-200 flex-row items-center justify-between">
          <Text className="flex-1 text-sm font-medium text-text-main">
            {order?.address}
          </Text>

          <View className="bg-red-50 px-3 py-1 rounded-lg ">
            <Text className="text-primary-100 font-bold text-lg">
              {order?.distanceKm || '---'} km
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DeliveryOrderCard;
