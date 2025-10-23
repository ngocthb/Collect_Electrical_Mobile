import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
import { Image } from 'react-native';
const shipper = {
  name: 'Nguyễn Văn A',
  phone: '0901234567',
  vehicle: 'Xe máy',
  licensePlate: '59A-12345',
  rating: 4.8,
  totalDeliveries: 1250,
};

const avatar = require('../../assets/images/avatar.jpg');
const estimatedTime = '15 phút';
const estimatedDistance = '5.2 km';
const orderCode = '#DH123456';

const DeliveryInfoScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SubLayout
      title="Thông tin giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1">
        <View className="p-5">
          {/* Shipper Profile Card */}
          <View className="bg-white rounded-3xl shadow-md mb-5 overflow-hidden">
            <View className="p-6">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Thông tin tài xế
              </Text>

              <View className="flex-row items-center mb-5">
                <View className="relative">
                  <View className="mr-4">
                    <Image
                      source={avatar}
                      className="w-20 h-20 rounded-full"
                      style={{
                        shadowColor: '#3B82F6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  <View className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white">
                    <Icon name="check" size={14} color="white" />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="font-bold text-2xl text-gray-900 mb-1">
                    {shipper.name}
                  </Text>
                </View>
              </View>

              {/* Vehicle Info */}
              <View className="flex-row gap-3 mb-5">
                <View className="flex-1 bg-gray-50 rounded-2xl p-4">
                  <View className="flex-row items-center mb-2">
                    <Icon name="motorbike" size={20} color="#3B82F6" />
                    <Text className="text-gray-500 text-xs ml-2">
                      Phương tiện
                    </Text>
                  </View>
                  <Text className="text-gray-900 font-semibold text-base">
                    {shipper.vehicle}
                  </Text>
                </View>

                <View className="flex-1 bg-gray-50 rounded-2xl p-4">
                  <View className="flex-row items-center mb-2">
                    <Icon name="card-text-outline" size={20} color="#3B82F6" />
                    <Text className="text-gray-500 text-xs ml-2">
                      Biển số xe
                    </Text>
                  </View>
                  <Text className="text-gray-900 font-semibold text-base">
                    {shipper.licensePlate}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-secondary-100 rounded-2xl py-4 flex-row items-center justify-center"
                  onPress={() => {}}
                  style={{
                    shadowColor: '#10B981',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Icon name="phone" size={22} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Gọi điện
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-primary-100 rounded-2xl py-4 flex-row items-center justify-center"
                  onPress={() => {}}
                  style={{
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Icon name="message-text" size={22} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Nhắn tin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Order Details Card */}
          <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Chi tiết đơn hàng
            </Text>

            <View className="space-y-4">
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                    <Icon name="barcode-scan" size={20} color="#8B5CF6" />
                  </View>
                  <Text className="text-gray-600 text-base">Mã đơn hàng</Text>
                </View>
                <Text className="text-gray-900 font-semibold text-base">
                  {orderCode}
                </Text>
              </View>

              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Icon
                      name="map-marker-distance"
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  <Text className="text-gray-600 text-base">Khoảng cách</Text>
                </View>
                <Text className="text-gray-900 font-semibold text-base">
                  {estimatedDistance}
                </Text>
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                    <Icon name="clock-outline" size={20} color="#10B981" />
                  </View>
                  <Text className="text-gray-600 text-base">
                    Thời gian dự kiến
                  </Text>
                </View>
                <Text className="text-gray-900 font-semibold text-base">
                  {estimatedTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Help Section */}
          <TouchableOpacity
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex-row items-center"
            onPress={() => {}}
          >
            <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mr-4">
              <Icon name="help-circle" size={28} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-amber-900 font-semibold text-base mb-1">
                Cần hỗ trợ?
              </Text>
              <Text className="text-amber-700 text-sm">
                Liên hệ bộ phận chăm sóc khách hàng
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#F59E0B" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default DeliveryInfoScreen;
