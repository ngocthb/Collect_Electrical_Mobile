import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import { fetchUserProfile } from '../../services/authService';
import { getProductToday } from '../../services/productService';

import MainLayout from '../../layout/MainLayout';

import ProductCard from '../../components/ProductCard';
const homepage1 = require('../../assets/images/homepage1.png');
const homepage2 = require('../../assets/images/homepage2.png');
const homepage = require('../../assets/images/homepage.png');
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();
  const [todayProducts, setTodayProducts] = useState<any[]>([]);
  const getTodayProducts = useCallback(async () => {
    const date = new Date();
    const pickUpDate = date.toISOString().split('T')[0];
    const userId = user?.userId;
    if (userId) {
      const products = await getProductToday(userId, pickUpDate);
      setTodayProducts(products);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    try {
      const profileData: any = await fetchUserProfile();
      if (profileData) {
        dispatch(setUser(profileData));
      }
      await getTodayProducts();
    } catch (e) {
      console.warn('[Home] refresh profile failed', e);
    }
  }, [dispatch, getTodayProducts]);

  const menuItems = [
    {
      id: 1,
      title: 'Kho điểm xanh',
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

  useEffect(() => {
    getTodayProducts();
  }, []);

  return (
    <MainLayout hideHeader={true} onRefresh={onRefresh}>
      <View className="flex-1 px-6 bg-background-50 ">
        {/* Promotional banner above menu */}
        <View className="mb-4 mt-10">
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
              <View>
                <Image
                  source={homepage}
                  style={{ width: 72, height: 72, borderRadius: 24 }}
                  resizeMode="cover"
                />
              </View>
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
        {todayProducts.length > 0 && (
          <View>
            <View className="mt-4 mb-2">
              <Text className=" text-base font-bold text-text-main">
                Lịch thu hôm nay
              </Text>
            </View>
            {todayProducts.map(product => (
              <ProductCard
                key={product.productId}
                product={product}
                onPress={() =>
                  navigation.navigate('ProductDetail', {
                    productId: product.productId,
                  })
                }
              />
            ))}
          </View>
        )}
      </View>
    </MainLayout>
  );
}
