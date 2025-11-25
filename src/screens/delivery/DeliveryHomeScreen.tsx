import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import MainLayout from '../../layout/MainLayout';

const homepage5 = require('../../assets/images/homepage5.png');
const homepage6 = require('../../assets/images/homepage6.png');

export default function DeliveryHomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);

  const menuItems = [
    {
      id: 1,
      title: 'Đơn hàng',
      image: homepage5,
    },
    {
      id: 2,
      title: 'Lộ trình',
      image: homepage6,
    },
  ];

  const handleMenuPress = (id: number) => {
    switch (id) {
      case 1:
        navigation.navigate('DeliveryOrder');
        break;
      case 2:
        navigation.navigate('DeliveryRoute');
        break;
      default:
        break;
    }
  };

  return (
    <MainLayout>
      <ScrollView className="flex-1 px-6  ">
        <View className="flex-row justify-between">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-primary-100">
              {user?.name || 'Naruto'}
            </Text>
            <Text className="text-gray-600 text-base mb-1">Xin chào!</Text>
          </View>
        </View>
        <View className="mb-4">
          <Text className=" text-base font-bold text-text-main">
            Thao tác nhanh
          </Text>
        </View>
        {/* Menu Grid */}
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              className="w-[48%] mb-4 p-2 rounded-xl items-center justify-center bg-primary-50  border-gray-200"
              onPress={() => handleMenuPress(item.id)}
            >
              <View className="items-center justify-center">
                <View className="items-center justify-center">
                  <View>
                    <Image source={item.image} className="w-24 h-20" />
                  </View>
                </View>

                <Text className="text-sm font-medium text-center mt-3 text-primary-100">
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </MainLayout>
  );
}
