import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppSelector } from '../../store/hooks';
import AppAvatar from '../../components/ui/AppAvatar';
import MainLayout from '../../layout/MainLayout';

const avatar = require('../../assets/images/avatar.jpg');
const homepage1 = require('../../assets/images/homepage1.png');
const homepage2 = require('../../assets/images/homepage2.png');
const homepage3 = require('../../assets/images/homepage3.png');
const homepage4 = require('../../assets/images/homepage4.png');

export default function HomeScreen() {
  const { user } = useAppSelector(s => s.auth);
  const navigation = useNavigation<any>();

  const menuItems = [
    {
      id: 1,
      title: 'Tạo yêu cầu',
      image: homepage1,
      color: '#E3F2FD',
      textColor: '#1976D2',
    },
    {
      id: 2,
      title: 'Ví của tôi',
      image: homepage2,
      color: '#E8F5E8',
      textColor: '#388E3C',
    },
    {
      id: 4,
      title: 'Các điểm thu',
      image: homepage4,
      color: '#FCE4EC',
      textColor: '#C2185B',
    },
  ];

  const handleMenuPress = (id: number) => {
    switch (id) {
      case 1:
        navigation.navigate('CreateRequest');
        break;
      case 2:
        navigation.navigate('Wallet');
        break;
      case 4:
        navigation.navigate('WarehouseLocation');
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
            <Text className="text-2xl font-bold text-gray-800">
              {user?.name || 'Naruto'}
            </Text>
          </View>
        </View>
        {/* Menu Grid */}
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              className="w-[48%] mb-4 p-4 rounded-xl"
              style={{ backgroundColor: item.color }}
              onPress={() => handleMenuPress(item.id)}
            >
              <View className="items-center justify-center h-28">
                <Image
                  source={item.image}
                  className="w-20 h-20 mb-2"
                  resizeMode="contain"
                />
                <Text
                  className="text-sm font-medium text-center"
                  style={{ color: item.textColor }}
                >
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
