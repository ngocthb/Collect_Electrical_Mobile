import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import SubLayout from '../../layout/SubLayout';
const couponThumb = require('../../assets/images/homepage1.png');

export default function VoucherScreen2() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);
  const vouchers = [
    {
      id: 'v1',
      code: 'FINFIRST25',
      title: 'Giảm 20% tới đa 50k',
      price: 25000,
      color: '#e85a4f',
    },
    {
      id: 'v2',
      code: 'FINFIRST25',
      title: 'Giảm 20% tới đa 50k',
      price: 25000,
      color: '#10B981',
    },
  ];

  const renderVoucher = ({ item }: any) => (
    <View className="flex-row mb-4 items-center">
      <View
        className="flex-col justify-center items-center rounded-l-2xl "
        style={{ width: 80, height: 154, backgroundColor: item.color }}
      >
        <Text
          className="text-white font-bold"
          style={{ transform: [{ rotate: '-90deg' }], letterSpacing: 1 }}
        >
          DISCOUNT
        </Text>
      </View>

      {/* Perforation (serrated edge) */}
      <View className=" h-44 flex-col justify-between items-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} className="w-1.5 h-3 bg-gray-500" />
        ))}
      </View>

      {/* Right card */}
      <View
        className="flex-1 p-4 bg-white rounded-r-2xl"
        style={{ borderWidth: 1, borderColor: item.color }}
      >
        <View className="flex-row justify-between items-center">
          <Text className="font-bold text-primary-100 text-lg">
            {item.code}
          </Text>
          <Image source={couponThumb} className="w-7 h-7 rounded-full" />
        </View>

        <Text className="text-gray-400 mt-2">{item.title}</Text>

        <Text className="text-gray-900 mt-2 ">
          Giá {item.price.toLocaleString()} <Text>🪙</Text>
        </Text>

        <View className="mt-3">
          <TouchableOpacity className="py-2 rounded-full border border-gray-200 bg-white items-center">
            <Text className="text-gray-900 font-semibold">Sử dụng mã</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SubLayout
      title="Voucher hiện có"
      onBackPress={() => navigation.goBack()}
      rightComponent={
        <View className="flex justify-center items-center ">
          <Text className="text-base text-text-main font-semibold">
            Tổng xu:{' '}
            <Text className="font-bold text-primary-100">{user?.points}</Text>{' '}
            🪙
          </Text>
        </View>
      }
    >
      <View className="flex-1 px-6 bg-background-50">
        {vouchers.map(v => (
          <View key={v.id} className="mb-4">
            {renderVoucher({ item: v })}
          </View>
        ))}
      </View>
    </SubLayout>
  );
}
