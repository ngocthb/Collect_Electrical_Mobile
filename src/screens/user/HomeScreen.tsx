import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppSelector } from '../../store/hooks';

import MainLayout from '../../layout/MainLayout';
const homepage1 = require('../../assets/images/homepage1.png');
const homepage2 = require('../../assets/images/homepage2.png');
const homepage = require('../../assets/images/homepage.png');
export default function HomeScreen() {
  const { user } = useAppSelector(s => s.auth);
  const navigation = useNavigation<any>();

  const menuItems = [
    {
      id: 1,
      title: 'Ví của tôi',
      image: homepage2,
    },
    {
      id: 2,
      title: 'Các điểm thu',
      image: homepage1,
    },
  ];

  const handleMenuPress = (id: number) => {
    switch (id) {
      case 1:
        navigation.navigate('Wallet');
        break;
      case 2:
        navigation.navigate('WarehouseLocation');
        break;
      case 3:
        navigation.navigate('UserConfirm');
        break;
      default:
        break;
    }
  };

  return (
    <MainLayout>
      <ScrollView className="flex-1 px-6">
        <View className="flex-row justify-between">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-primary-100">
              {user?.name || 'User'}
            </Text>
            <Text className="text-gray-600 text-base mb-1">Xin chào!</Text>
          </View>
        </View>

        {/* Promotional banner above menu */}
        <View className="mb-4">
          <View className="rounded-2xl p-4 bg-secondary-100 border border-gray-200 ">
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-primary-50 text-base font-bold">
                  Công nghệ – xanh
                </Text>
                <Text className="text-white text-sm mt-1">
                  Công nghệ cũ, giá trị mới. Tái chế điện tử an toàn – dễ dàng –
                  bền vững.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  try {
                    navigation.navigate('Promotions');
                  } catch (e) {
                    console.warn('Promotions route not found', e);
                  }
                }}
                className="rounded-full overflow-hidden"
              >
                <Image
                  source={homepage}
                  style={{ width: 72, height: 72, borderRadius: 24 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className="mb-4">
          <Text className=" text-base font-bold text-text-main">
            Thao tác nhanh
          </Text>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              className="w-[48%] mb-4 p-4 rounded-xl items-center justify-center bg-primary-50  border-gray-200"
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
