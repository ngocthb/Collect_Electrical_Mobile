import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppButton from '../components/ui/AppButton';
import {
  getOrderId,
  getOrderName,
  getOrderTime,
  getOrderAddress,
  resolveStatus,
  getStatusColor,
} from '../utils/deliveryHelpers';

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
  idx,
  isLast,
  isSelectedDateToday,
  onOpenMap,
  onReject,
  onConfirm,
}: Props) => {
  const status = resolveStatus(order);
  const actionsDisabled = status === 'failed' || status === 'completed';

  return (
    <View className="flex-row mb-8 relative z-10">
      {/* Timeline icon */}
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
              <TouchableOpacity onPress={() => onConfirm(order)}>
                <Text className="text-sm font-bold text-text-main">
                  {getOrderName(order)}
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-text-muted mb-2">
              {getOrderTime(order)}
            </Text>
          </View>

          <View className="flex-row gap-3 items-start">
            <TouchableOpacity
              onPress={() => isSelectedDateToday && onOpenMap(order)}
              className="bg-primary-50 rounded-full p-2"
              disabled={!isSelectedDateToday || actionsDisabled}
              style={{
                opacity: !isSelectedDateToday || actionsDisabled ? 0.4 : 1,
              }}
            >
              <Icon name="directions" size={18} color="#4169E1" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-primary-50 rounded-full p-2"
              disabled={!isSelectedDateToday || actionsDisabled}
              onPress={() => {
                if (!isSelectedDateToday || actionsDisabled) return;
              }}
              style={{
                opacity: !isSelectedDateToday || actionsDisabled ? 0.4 : 1,
              }}
            >
              <Icon name="phone" size={18} color="#4169E1" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-primary-50 rounded-full p-2"
              disabled={!isSelectedDateToday || actionsDisabled}
              onPress={() => {
                if (!isSelectedDateToday || actionsDisabled) return;
              }}
              style={{
                opacity: !isSelectedDateToday || actionsDisabled ? 0.4 : 1,
              }}
            >
              <Icon name="message-text" size={18} color="#4169E1" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-primary-50 rounded-xl p-3 mb-2">
          <View className="flex-row items-center mb-3">
            <Icon name="map-marker" size={18} color="#4169E1" />
            <Text className="ml-2 text-sm font-normal text-text-main">
              {getOrderAddress(order)}
            </Text>
          </View>

          {status === 'pending' && (
            <View className="flex-row justify-evenly">
              <View className="w-2/5">
                <AppButton
                  title="Từ chối"
                  size="small"
                  disabled={!isSelectedDateToday}
                  onPress={() => onReject(order)}
                  color="#E53935"
                />
              </View>
              <View className="w-2/5">
                <AppButton
                  title="Xác nhận"
                  size="small"
                  disabled={!isSelectedDateToday}
                  onPress={() => isSelectedDateToday && onConfirm(order)}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default DeliveryOrderCard;
