import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppSelector } from '../../store/hooks';

import MainLayout from '../../layout/MainLayout';
const homepage1 = require('../../assets/images/homepage1.png');
const homepage2 = require('../../assets/images/homepage2.png');
const homepage4 = require('../../assets/images/homepage4.png');

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
            <Text className="text-gray-600 text-base mb-1">Xin chào!</Text>
            <Text className="text-2xl font-bold text-primary-100">
              {user?.name || 'User'}
            </Text>
          </View>
        </View>

        {/* Menu Grid */}
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              className="w-[48%] mb-4 p-4 rounded-xl items-center justify-center bg-primary-50 border-2 border-primary-100"
              onPress={() => handleMenuPress(item.id)}
            >
              <View className="items-center justify-center">
                <View className="items-center justify-center">
                  <View className="w-20 h-20 rounded-full overflow-hidden bg-white">
                    <View className="w-full h-full p-2">
                      <Image
                        source={item.image}
                        className="w-16 h-16"
                        resizeMode="contain"
                      />
                    </View>
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
