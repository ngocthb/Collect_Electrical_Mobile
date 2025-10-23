import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LocationData } from '../../components/MapboxPicker';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/native';
import MapboxTurnbyturn from '../../components/MapboxTurnbyturn';
import AppButton from '../../components/ui/AppButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_HEIGHT = SCREEN_HEIGHT * 0.25;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.65;

const pickupAddress = {
  name: '88 Võ Văn Ngân',
  detail: 'Thủ Đức, thành phố Hồ Chí Minh',
};

const dropoffAddress = {
  name: 'S102 Vinhomes Grand Park',
  detail: 'Thủ Đức, thành phố Hồ Chí Minh',
};

const user = {
  name: 'Sasuke',
  product: 'Tủ lạnh còn sử dụng được',
};

const DeliveryOrderMapScreen = () => {
  const navigation = useNavigation<any>();
  const [isExpanded, setIsExpanded] = useState(false);
  const panelHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;

  const pickupLocation: LocationData = {
    name: '88 Võ Văn Ngân',
    latitude: 10.85,
    longitude: 106.83,
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = isExpanded
          ? MAX_HEIGHT - gestureState.dy
          : MIN_HEIGHT - gestureState.dy;

        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          panelHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50 && !isExpanded) {
          expandPanel();
        } else if (gestureState.dy > 50 && isExpanded) {
          collapsePanel();
        } else {
          Animated.spring(panelHeight, {
            toValue: isExpanded ? MAX_HEIGHT : MIN_HEIGHT,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const expandPanel = () => {
    setIsExpanded(true);
    Animated.spring(panelHeight, {
      toValue: MAX_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const collapsePanel = () => {
    setIsExpanded(false);
    Animated.spring(panelHeight, {
      toValue: MIN_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  return (
    <SubLayout
      title="Chi tiết đơn hàng"
      onBackPress={() => navigation.goBack()}
    >
      <View className="flex-1 bg-white">
        {/* Map */}
        <View className="flex-1">
          <MapboxTurnbyturn
            initialLocation={pickupLocation}
            onLocationSelect={() => {}}
            searchPlaceholder=""
            confirmButtonText=""
            showMyLocationButton={false}
          />
        </View>

        {/* Draggable Bottom Panel */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg"
          style={{
            height: panelHeight,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          {/* Drag Handle */}
          <View
            className="items-center py-3 px-5"
            {...panResponder.panHandlers}
          >
            <View className="w-10 h-1 bg-gray-300 rounded-sm" />
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            scrollEnabled={isExpanded}
          >
            <View className="px-5 pb-5">
              {/* Header */}
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Thông tin đơn hàng
              </Text>

              {/* Pickup Address */}
              <View className="flex-row items-start mb-4">
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Icon name="circle-slice-8" size={16} color="#34C759" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">
                    Điểm lấy hàng
                  </Text>
                  <Text className="text-base font-semibold text-gray-900 mb-0.5">
                    {pickupAddress.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {pickupAddress.detail}
                  </Text>
                </View>
              </View>

              {isExpanded && (
                <>
                  {/* Divider */}
                  <View className="h-px bg-gray-200 my-4" />

                  {/* User Info */}
                  <View className="mb-4">
                    <Text className="text-xs text-gray-500 mb-3">
                      Thông tin người gửi
                    </Text>
                    <View className="flex-row items-center bg-gray-50 rounded-2xl p-4">
                      <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Icon name="account" size={32} color="#3B82F6" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900">
                          {user.name}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-0.5">
                          {user.product}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3 mb-4">
                    <TouchableOpacity className="flex-1 bg-blue-500 rounded-xl py-4 flex-row items-center justify-center">
                      <Icon name="phone" size={20} color="white" />
                      <Text className="text-white font-semibold ml-2 text-[15px]">
                        Gọi điện
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-gray-100 rounded-xl py-4 flex-row items-center justify-center">
                      <Icon name="message-text" size={20} color="#3B82F6" />
                      <Text className="text-blue-500 font-semibold ml-2 text-[15px]">
                        Nhắn tin
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Warning */}
                  <View className="flex-row items-center bg-amber-50 rounded-xl p-4 mb-6">
                    <Icon name="information" size={20} color="#F59E0B" />
                    <Text className="flex-1 text-sm text-amber-900 ml-3">
                      Xảy ra sự cố ? Liên hệ với trung tâm hỗ trợ
                    </Text>
                  </View>

                  {/* Order Details */}
                  <View className="mb-4">
                    <Text className="text-xs text-gray-500 mb-3">
                      Chi tiết đơn hàng
                    </Text>
                    <View className="gap-2">
                      <View className="flex-row justify-between py-2">
                        <Text className="text-sm text-gray-500">
                          Mã đơn hàng
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900">
                          #DH123456
                        </Text>
                      </View>
                      <View className="flex-row justify-between py-2">
                        <Text className="text-sm text-gray-500">
                          Khoảng cách
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900">
                          12.5 km
                        </Text>
                      </View>
                      <View className="flex-row justify-between py-2">
                        <Text className="text-sm text-gray-500">
                          Thời gian dự kiến
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900">
                          25 phút
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Confirm Button */}
                  <AppButton
                    title="Xác nhận lấy hàng"
                    onPress={() => navigation.navigate('DeliveryConfirm')}
                  />
                  <View className="h-5" />
                </>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </SubLayout>
  );
};

export default DeliveryOrderMapScreen;
