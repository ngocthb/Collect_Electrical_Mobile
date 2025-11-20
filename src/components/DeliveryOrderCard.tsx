import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppButton from '../components/ui/AppButton';
import {
  getOrderName,
  getOrderTime,
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
  idx: number;
  isLast?: boolean;
  isSelectedDateToday: boolean;
  onOpenMap: (order: any) => void;
  onReject: (order: any) => void;
  onConfirm: (order: any) => void;
};

const DeliveryOrderCard = ({
  order,
  isSelectedDateToday,
  onOpenMap,
  onReject,
  onConfirm,
}: Props) => {
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
      distanceText: '---',
      durationText: '---',
    });
  };
  console.log(order);
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
              <Icon name="clock" size={10} color="#19CCA1" />{' '}
              {order?.estimatedTime}
            </Text>
          </View>

          <View className="flex-row gap-3 items-start">
            <TouchableOpacity
              onPress={() =>
                isSelectedDateToday && !actionsDisabled && handleEyePress()
              }
              className="bg-primary-50 rounded-full p-2"
              disabled={!isSelectedDateToday || actionsDisabled}
              style={{
                opacity: !isSelectedDateToday || actionsDisabled ? 0.4 : 1,
              }}
            >
              <Icon name="eye" size={26} color="#4169E1" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                isSelectedDateToday && !actionsDisabled && onOpenMap(order)
              }
              className="bg-primary-50 rounded-full p-2"
              disabled={!isSelectedDateToday || actionsDisabled}
              style={{
                opacity: !isSelectedDateToday || actionsDisabled ? 0.4 : 1,
              }}
            >
              <Icon name="directions" size={26} color="#4169E1" />
            </TouchableOpacity>

            {invitees.length > 0 && isSelectedDateToday && !actionsDisabled ? (
              <ZegoSendCallInvitationButton
                invitees={invitees}
                isVideoCall={false}
                resourceID="thugom_data"
              />
            ) : invitees.length > 0 ? (
              <View
                className="bg-primary-50 rounded-full p-2"
                style={{ opacity: 0.4 }}
              >
                <Icon name="phone" size={26} color="#4169E1" />
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

        <View className="bg-primary-50 rounded-xl p-3 mb-2">
          <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-2">
            {order?.subCategoryName} • {order?.brandName}
          </Text>
          <View className="flex-row items-center mb-3">
            <Icon name="map-marker" size={16} color="#4169E1" />
            <Text className="ml-2 text-sm font-normal text-text-main">
              {order?.address}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DeliveryOrderCard;
