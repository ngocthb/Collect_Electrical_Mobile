import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import { fetchUserProfile } from '../../services/authService';
import { getProductToday } from '../../services/productService';
import { isCompletedStatus } from '../../utils/productHelper';
import MainLayout from '../../layout/MainLayout';
import ProductCard from '../../components/ProductCard';
import NewsCarousel from '../../components/NewsCarousel';
import { getAllConfig } from '../../services/systemConfigService';
import { setAllConfig } from '../../store/slices/systemSlice';

const homepage1 = require('../../assets/images/homepage1.png');
const homepage2 = require('../../assets/images/homepage2.png');
const homepage3 = require('../../assets/images/homepage3.png');
const homepage4 = require('../../assets/images/homepage4.png');
const DEVELOP_MODE_KEY = 'develop_mode';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();

  const [todayProducts, setTodayProducts] = useState<any[]>([]);
  const [isDevelopMode, setIsDevelopMode] = useState(false);
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);

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
      checkIsDevelopMode();
      await fetchAllConfig();
    } catch (e) {
      console.warn('[Home] refresh profile failed', e);
    }
  }, [dispatch, getTodayProducts]);

  const onRefreshProducts = useCallback(async () => {
    try {
      setIsRefreshingProducts(true);
      await onRefresh();
    } finally {
      setIsRefreshingProducts(false);
    }
  }, [onRefresh]);

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

    ...(isDevelopMode
      ? [
          {
            id: 3,
            title: 'Bảng xếp hạng',
            image: homepage3,
          },
          {
            id: 4,
            title: 'Phản ánh',
            image: homepage4,
          },
        ]
      : []),
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
        navigation.navigate('Leaderboard');
        break;
      case 4:
        navigation.navigate('ReportList');
        break;
    }
  };

  const fetchAllConfig = async () => {
    try {
      const configData = await getAllConfig();
      console.log(configData);
      dispatch(setAllConfig(configData));
    } catch (error) {
      console.error('Failed to fetch system config:', error);
    }
  };

  useEffect(() => {
    getTodayProducts();
  }, []);

  useEffect(() => {
    checkIsDevelopMode();
  }, []);

  useEffect(() => {
    fetchAllConfig();
  }, []);
  const checkIsDevelopMode = () => {
    let mounted = true;

    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem(DEVELOP_MODE_KEY);
        if (mounted) {
          setIsDevelopMode(savedMode === 'true');
        }
      } catch (error) {
        console.warn('[DeliveryOrderCard] Failed to load develop mode', error);
      }
    })();

    return () => {
      mounted = false;
    };
  };

  return (
    <MainLayout hideHeader={true} useScrollView={false}>
      <View className="px-6 bg-background-50 pb-24">
        {/* NEWS CAROUSEL */}
        <NewsCarousel />

        {/* QUICK ACTION */}
        <View className="mb-4">
          <Text className="text-base font-bold text-text-main">
            Thao tác nhanh
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              className="w-[48%] mb-4 p-4 rounded-xl items-center justify-center bg-primary-100 border-2 border-red-200"
              onPress={() => handleMenuPress(item.id)}
            >
              <Image source={item.image} className="w-24 h-20" />

              <Text className="text-sm font-medium text-center mt-3 text-white">
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TODAY PRODUCTS */}

        <View className="mb-2">
          <Text className="text-base font-bold text-text-main">
            Lịch thu hôm nay
          </Text>
        </View>
        <FlatList
          className="max-h-80"
          contentContainerStyle={{
            paddingBottom: 90,
            flexGrow: todayProducts.length === 0 ? 1 : 0,
          }}
          data={todayProducts}
          keyExtractor={item => String(item.productId)}
          onRefresh={onRefreshProducts}
          refreshing={isRefreshingProducts}
          renderItem={({ item: product }) => (
            <ProductCard
              key={product.productId}
              product={product}
              onPress={() => {
                if (!isCompletedStatus(product.status)) {
                  navigation.navigate('ProductDetails', {
                    productId: product.productId,
                  });
                } else {
                  navigation.navigate('Timeline', {
                    productId: product.productId,
                  });
                }
              }}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Icon name="inbox" size={40} color="#6B7280" />
              <Text className="text-gray-500 text-sm mt-2 text-center">
                Hôm nay chưa có sản phẩm cần thu gom
              </Text>
            </View>
          }
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        />
      </View>
    </MainLayout>
  );
}
