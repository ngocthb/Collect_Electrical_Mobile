import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AppButton from '../../components/ui/AppButton';
import SubLayout from '../../layout/SubLayout';

const wallet1 = require('../../assets/images/wallet1.png');
const wallet2 = require('../../assets/images/wallet2.png');
const avatar = require('../../assets/images/avatar.jpg');
const thumb1 = require('../../assets/images/homepage1.png');
const thumb2 = require('../../assets/images/homepage2.png');

export default function WalletScreen() {
  const navigation = useNavigation<any>();

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // TODO: replace this with real userId from auth state
        const userId = '7f5c8b33-1b52-4d11-91b0-932c3d243c71';
        const pointsModule = await import('../../services/pointsService');
        const res = await pointsModule.getUserPoints(userId);
        if (mounted && res && typeof res.points === 'number')
          setBalance(res.points);
      } catch (e) {
        console.warn('[Wallet] Failed to load points', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const history = [
    {
      id: 'h1',
      title: 'Máy giặt cũ',
      amount: 12000,
      date: 'Thứ 3, 10 Tháng 10 2025',
      image: thumb1,
    },
    {
      id: 'h2',
      title: 'Lò vi sóng hư',
      amount: 2000,
      date: 'Thứ 3, Tháng 08 2025',
      image: thumb2,
    },
  ];

  const renderHistory = ({ item }: any) => (
    <View className="flex-row items-start py-3">
      <Image
        source={item.image}
        className="w-16 h-16 rounded-lg mr-3 bg-gray-100"
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">
          {item.title}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Bạn đã thu được{' '}
          <Text className="text-green-600 font-semibold">
            {item.amount.toLocaleString()}
          </Text>{' '}
          <Text style={{ fontSize: 12 }}>🪙</Text>
        </Text>
        <Text className="text-xs text-gray-400 mt-2">{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SubLayout title="Ví của tôi" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 px-4 pt-4">
        {/* Balance Card */}
        <View
          className="rounded-3xl  overflow-hidden mb-6 p-4"
          style={{ backgroundColor: '#23D69A' }}
        >
          <View className="flex-row items-center justify-between">
            <Image
              source={wallet1}
              className="w-14 h-20 mr-6 justify-start"
              resizeMode="contain"
            />
            <View className="flex-1 justify-between">
              <Text className="text-white text-sm">Tổng xu</Text>
              <Text className="text-white text-2xl font-bold mt-2">
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  `${(balance ?? 0).toLocaleString()} 🪙`
                )}
              </Text>
              <View className="mt-4 w-2/3">
                <AppButton
                  title="Đổi quà ngay"
                  onPress={() => navigation.navigate('Voucher')}
                  color="#FFFFFF"
                  textColor="#10B981"
                  size="small"
                />
              </View>
            </View>

            <Image
              source={wallet2}
              className="w-28 h-20 justify-end"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* History */}
        <Text className="text-lg font-semibold mb-3">Lịch sử nhận xu</Text>
        <View className="bg-white rounded-lg p-3 shadow-sm">
          <FlatList
            data={history}
            renderItem={renderHistory}
            keyExtractor={i => i.id}
            ItemSeparatorComponent={() => <View className="h-2" />}
          />
        </View>
      </View>
    </SubLayout>
  );
}
