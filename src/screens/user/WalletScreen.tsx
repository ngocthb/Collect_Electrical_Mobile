import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  getUserPoints,
  getUserPointTransactions,
} from '../../services/pointsService';
import AppButton from '../../components/ui/AppButton';
import SubLayout from '../../layout/SubLayout';
import { useAppSelector } from '../../store/hooks';
import { formatTimestamp } from '../../utils/dateUtils';
const wallet1 = require('../../assets/images/wallet1.png');
const wallet2 = require('../../assets/images/wallet2.png');
const thumb1 = require('../../assets/images/homepage1.png');

export default function WalletScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const userId = user?.userId;
        if (!userId) {
          if (mounted) setLoading(false);
          return;
        }

        const res = await getUserPoints(userId);
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
  }, [user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const userId = user?.userId;
      if (!userId) return;
      setLoadingTransactions(true);
      try {
        const res = await getUserPointTransactions(userId);
        if (mounted && Array.isArray(res)) setTransactions(res);
      } catch (e) {
        console.warn('[Wallet] Failed to load transactions', e);
      } finally {
        if (mounted) setLoadingTransactions(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.userId]);

  const renderHistory = ({ item }: any) => {
    const img =
      item?.images && item.images.length > 0 ? { uri: item.images[0] } : thumb1;

    const desc =
      item.desciption ||
      item.description ||
      item.transactionType ||
      'Giao dịch';
    const productId = item.productId || item.postId || null;
    return (
      <TouchableOpacity
        onPress={() =>
          productId && navigation.navigate('ProductDetails', { productId })
        }
        className="flex-row items-start "
      >
        <Image source={img} className="w-16 h-16 rounded-lg mr-3 bg-gray-100" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-primary-100">
            {desc}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Bạn đã thu được{' '}
            <Text className="text-primary-100 font-semibold">
              {(item.point ?? 0).toLocaleString()}
            </Text>{' '}
            <Text style={{ fontSize: 12 }}>🪙</Text>
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SubLayout title="Ví của tôi" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 bg-background-50 px-4 ">
        {/* Balance Card */}
        <View className="rounded-3xl  overflow-hidden mb-6 p-4 bg-primary-100 border-2 border-red-200">
          <View className="flex-row items-center justify-between">
            <Image
              source={wallet1}
              className="w-24 h-24 justify-start"
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
              <View className="mt-2">
                <AppButton
                  title="Đổi quà ngay"
                  onPress={() => navigation.navigate('Voucher')}
                  color="#FFFFFF"
                  textColor="#e85a4f"
                  size="small"
                />
              </View>
            </View>

            <Image
              source={wallet2}
              className="w-32 h-32 justify-end"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* History */}
        <Text className="text-lg font-semibold mb-3">Lịch sử nhận xu</Text>
        <View>
          {loadingTransactions ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#e85a4f" />
            </View>
          ) : (
            <>
              {transactions && transactions.length > 0 ? (
                transactions.map((item, idx) => (
                  <View
                    key={idx}
                    className="bg-white border-2 border-red-200 rounded-xl p-3 mb-3 shadow-sm"
                  >
                    {renderHistory({ item })}
                  </View>
                ))
              ) : (
                <View className="py-8 items-center">
                  <Text className="text-gray-500">Không có giao dịch</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </SubLayout>
  );
}
