import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import MainLayout from '../../layout/MainLayout';

const avatar = require('../../assets/images/avatar.jpg');
const homepage5 = require('../../assets/images/homepage5.png');
const homepage6 = require('../../assets/images/homepage6.png');
const homepage3 = require('../../assets/images/homepage3.png');

export default function DeliveryHomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);

  const menuItems = [
    {
      id: 1,
      title: 'Đơn hàng',
      image: homepage5,
      color: '#E3F2FD',
      textColor: '#1976D2',
    },
    {
      id: 2,
      title: 'Lộ trình',
      image: homepage6,
      color: '#E8F5E8',
      textColor: '#388E3C',
    },
    {
      id: 3,
      title: 'Lịch sử',
      image: homepage3,
      color: '#FFF3E0',
      textColor: '#F57C00',
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
      <ScrollView className="flex-1 px-6  mt-4">
        <View className="flex-row justify-between">
          <View className="mb-6">
            <Text className="text-gray-600 text-base mb-1">Xin chào!</Text>
            <Text className="text-2xl font-bold text-gray-800">
              {user?.name || 'Naruto'}
            </Text>
          </View>

          <View className="flex-row items-center mb-8">
            <View className="relative">
              <Image
                source={avatar}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
            </View>
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
