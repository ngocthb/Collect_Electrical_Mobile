import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CollectionRouteWithDistance } from '../types/Collector';
import {
  getOrderAddress,
  resolveStatus,
  getStatusColor,
} from '../utils/deliveryHelpers';
import { callUser } from '../services/callService';
// @ts-ignore
import { ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';

const cleanUserIdForZego = (userId: string) => {
  return userId.replace(/[^a-zA-Z0-9_]/g, '');
};

type Props = {
  order: CollectionRouteWithDistance;
  isSelectedDateToday: boolean;
};

const DeliveryOrderCard = ({ order, isSelectedDateToday }: Props) => {
  const user = useAppSelector(state => state.auth.user);
  const navigation = useNavigation<any>();
  const status = resolveStatus(order);
  const actionsDisabled = status === 'failed' || status === 'completed';

  const receiver = order?.sender;
  const cleanReceiverId = receiver?.userId
    ? cleanUserIdForZego(receiver.userId)
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

  const handleEyePress = () => {
    navigation.navigate('DeliveryDetails', {
      normalizedRequest: order,
      pickupLocationName: getOrderAddress(order),
      isRouteLoading: false,
    });
  };
  console.log(order);
  return (
    <View className="flex-row mb-8 relative z-10">
      <View className="items-center mr-3">
        <TouchableOpacity
          disabled={!isSelectedDateToday || actionsDisabled}
          onPress={() => {
            if (order.iat && order.ing) {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${order.iat},${order.ing}&travelmode=driving`;
              Linking.openURL(url);
            }
          }}
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
                : 'navigation-variant'
            }
            size={24}
            color={getStatusColor(status)}
          />
        </TouchableOpacity>
      </View>

      {/* Order card */}
      <View className="flex-1 flex-row items-center">
        <TouchableOpacity
          onPress={handleEyePress}
          disabled={isSelectedDateToday || !actionsDisabled}
          className="flex-1"
        >
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-col flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-sm font-bold text-text-main">
                  {order?.sender?.name}
                </Text>
              </View>
              <Text className="text-xs text-text-main">
                {order?.estimatedTime}
              </Text>
            </View>

            <Text className="text-primary-100 font-bold text-lg">
              {order?.distanceKm} km
            </Text>
          </View>
        </TouchableOpacity>

        <View className="ml-3">
          {invitees.length > 0 && isSelectedDateToday && !actionsDisabled ? (
            <ZegoSendCallInvitationButton
              invitees={invitees}
              isVideoCall={false}
              resourceID={'thugom'}
              timeout={120}
              onWillPressed={async () => {
                console.log('📞 Call button will be pressed');
                try {
                  await callUser(
                    String(user?.userId),
                    String(user?.name),
                    String(receiver?.userId),
                    `call_${Date.now()}`,
                    `room_${Date.now()}`,
                  );
                  return true;
                } catch (e) {
                  return false;
                } finally {
                  console.log('📞 Call button press handling completed');
                  return true;
                }
              }}
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
              <Text style={{ color: 'red', fontSize: 10 }}>No receiver ID</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default DeliveryOrderCard;
