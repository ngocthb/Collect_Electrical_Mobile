import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import { fetchUserProfile } from '../../services/authService';
import AppAvatar from '../../components/ui/AppAvatar';

import MainLayout from '../../layout/MainLayout';
const homepage1 = require('../../assets/images/homepage1.png');
const homepage2 = require('../../assets/images/homepage2.png');
const homepage = require('../../assets/images/homepage.png');
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();
  const isUser = String(user?.role).toLowerCase() === 'user';

  const onRefresh = useCallback(async () => {
    try {
      // re-fetch profile and update redux
      const profileData: any = await fetchUserProfile();
      if (profileData) {
        dispatch(setUser(profileData));
      }
    } catch (e) {
      console.warn('[Home] refresh profile failed', e);
    }
  }, [dispatch]);

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

      default:
        break;
    }
  };

  return (
    <MainLayout hideHeader={true} onRefresh={onRefresh}>
      <View className="flex-1 px-6 bg-background-50 ">
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
              {user?.name ?? 'Khách hàng'}
            </Text>
            <Text className="text-sm text-gray-500">{user?.email ?? '—'}</Text>

            <View className="flex-row items-center mt-2">
              <Text className="text-base font-bold text-primary-100 mr-2">
                {(user?.points ?? 0).toLocaleString()}
              </Text>
              <View className="w-6 h-6 bg-yellow-400 rounded-full items-center justify-center">
                <Text className="text-xs">🪙</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Promotional banner above menu */}
        <View className="mb-4">
          <View className="rounded-2xl p-4 bg-primary-100 border border-gray-200 ">
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-white text-base font-bold">
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
      </View>
    </MainLayout>
  );
}
