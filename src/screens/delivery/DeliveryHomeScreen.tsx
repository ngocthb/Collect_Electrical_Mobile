import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import MainLayout from '../../layout/MainLayout';
import AppAvatar from '../../components/ui/AppAvatar';
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
    // {
    //   id: 2,
    //   title: 'Lộ trình',
    //   image: homepage6,
    // },
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
    <MainLayout hideHeader={true}>
      <ScrollView className="flex-1 px-6 bg-background-50">
        <View className="flex-row items-center mb-6 mt-10">
          <View className="relative bg-primary-100 rounded-full p-1">
            <AppAvatar
              name={user?.name}
              uri={user?.avatar ?? null}
              size={80}
              style={{ borderWidth: 4, borderColor: '#fff' }}
            />
          </View>

          <View className="flex ml-4 justify-center">
            <Text className="text-lg font-bold text-gray-800">
              {user?.name ?? 'Người thu gom'}
            </Text>
            <Text className="text-sm text-gray-500">{user?.email ?? '—'}</Text>
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
              className="w-[48%] mb-4 p-4 rounded-xl items-center justify-center bg-primary-100 border-2  border-red-200"
              onPress={() => handleMenuPress(item.id)}
            >
              <View className="items-center justify-center">
                <View className="items-center justify-center">
                  <View>
                    <Image source={item.image} className="w-24 h-20" />
                  </View>
                </View>

                <Text className="text-sm font-medium text-center mt-3 text-white">
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
