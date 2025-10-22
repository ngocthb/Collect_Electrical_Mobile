import 'react-native-gesture-handler';
import React, { useRef, useMemo } from 'react';

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapboxPicker, { LocationData } from '../../components/MapboxPicker';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/native';
import MapboxTurnbyturn from '../../components/MapboxTurnbyturn';
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
  const pickupLocation: LocationData = {
    name: '88 Võ Văn Ngân',
    latitude: 10.85,
    longitude: 106.83,
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
        {/* Scrollable Bottom Sheet for Address & User Info */}
        <View className="absolute bottom-0 left-0 right-0">
          <ScrollView
            className="bg-white rounded-t-3xl shadow-lg max-h-[60vh]"
            showsVerticalScrollIndicator={false}
          >
            {/* Address Info */}
            <View className="px-5 pt-4 pb-2">
              <View className="flex-row items-center mb-2">
                <Icon name="map-marker" size={20} color="#34C759" />
                <View className="ml-2">
                  <Text className="font-bold text-lg text-gray-800">
                    {pickupAddress.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {pickupAddress.detail}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center mb-2">
                <Icon name="map-marker" size={20} color="#3B82F6" />
                <View className="ml-2">
                  <Text className="font-bold text-lg text-gray-800">
                    {dropoffAddress.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {dropoffAddress.detail}
                  </Text>
                </View>
              </View>
            </View>
            {/* User Info Card */}
            <View className="flex-row items-center bg-white px-5 py-4 border-t border-gray-100">
              <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-3">
                <Icon name="account" size={32} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-lg text-gray-800">
                  {user.name}
                </Text>
                <Text className="text-gray-400 text-sm">{user.product}</Text>
              </View>
              <TouchableOpacity className="bg-blue-100 rounded-full p-2 mr-2">
                <Icon name="phone" size={22} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-blue-100 rounded-full p-2">
                <Icon name="message-text" size={22} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SubLayout>
  );
};

export default DeliveryOrderMapScreen;
