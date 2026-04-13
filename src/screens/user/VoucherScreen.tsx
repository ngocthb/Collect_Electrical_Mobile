import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';

import toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import SubLayout from '../../layout/SubLayout';
import SearchInputHeader from '../../components/SearchAndFilterHeader';
import ConfirmModal from '../../components/ConfirmModal';
import getVoucher from '../../services/voucherService';

const COLORS = ['#e85a4f', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

export default function VoucherScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);
  const isFocused = useIsFocused();
  const isMounted = useRef(true);
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
  const [allVouchersData, setAllVouchersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [modalType, setModalType] = useState<'confirm' | 'insufficient'>(
    'confirm',
  );
  const searchTimeoutRef = useRef<number | null>(null);

  const loadVouchers = async (
    pageNum: number = 1,
    append: boolean = false,
    searchTerm: string = '',
    mode: string = 'all',
  ) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let resp;
      if (mode === 'my') {
        const userId = user?.userId || '';
        resp = await getVoucher.getVoucherByUser(userId, pageNum, searchTerm);
      } else {
        resp = await getVoucher.getVoucher(pageNum, searchTerm);
      }
      const vouchersData = Array.isArray(resp) ? resp : [];

      if (isMounted.current) {
        if (append) {
          setAllVouchersData(prev => {
            const existingIds = new Set(prev.map(v => v.voucherId));
            const uniqueNew = vouchersData.filter(
              v => !existingIds.has(v.voucherId),
            );
            return [...prev, ...uniqueNew];
          });
        } else {
          setAllVouchersData(vouchersData);
        }

        setHasMore(vouchersData.length >= 10);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      if (isMounted.current && !append) setAllVouchersData([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  const loadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadVouchers(nextPage, true, searchQuery, viewMode);
    }
  };

  const handleRefresh = async () => {
    setPage(1);
    setHasMore(true);
    await loadVouchers(1, false, searchQuery, viewMode);
  };

  useEffect(() => {
    isMounted.current = true;
    if (isFocused) {
      setPage(1);
      setHasMore(true);
      loadVouchers(1, false, searchQuery, viewMode);
    }
    return () => {
      isMounted.current = false;
    };
  }, [isFocused]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setSearchQuery('');
    loadVouchers(1, false, '', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      loadVouchers(1, false, searchQuery, viewMode);
    }, 1000);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleVoucherPress = (item: any) => {
    navigation.navigate('VoucherDetails', { voucher: item });
  };

  const renderVoucher = ({ item }: any) => {
    const colorIndex = allVouchersData.indexOf(item) % COLORS.length;
    const color = COLORS[colorIndex];
    const userPoints = user?.points || 0;
    const insufficientPoints = userPoints < item.pointsToRedeem;
    const hasImage = !!item.imageUrl;

    const Content = (
      <View className="w-full">
        <Text className="text-gray-900 font-semibold text-sm">{item.name}</Text>

        <Text className="text-gray-700 text-xs mt-1" numberOfLines={3}>
          {item.description}
        </Text>

        <Text className="text-gray-900 font-bold text-sm mt-2">
          {item.pointsToRedeem.toLocaleString()} <Text>🪙</Text>
        </Text>

        {viewMode !== 'my' && (
          <View className="mt-2">
            <TouchableOpacity
              onPress={() => handleRedeemPress(item)}
              disabled={insufficientPoints}
              className={`py-1.5 rounded-full border items-center ${
                insufficientPoints
                  ? 'bg-gray-200 border-gray-200'
                  : 'border-primary-100 bg-primary-100'
              }`}
            >
              <Text
                className={`font-semibold text-xs ${
                  insufficientPoints ? 'text-gray-400' : 'text-white'
                }`}
              >
                {insufficientPoints ? 'Không đủ xu' : 'Đổi Voucher'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );

    return (
      <TouchableOpacity
        activeOpacity={viewMode === 'my' ? 0.7 : 1}
        onPress={viewMode === 'my' ? () => handleVoucherPress(item) : undefined}
        disabled={viewMode !== 'my'}
        className="flex-row mb-4 items-stretch"
      >
        <View
          className="flex-col justify-center items-center rounded-l-2xl"
          style={{ width: 70, backgroundColor: color }}
        >
          <Text
            className="text-white font-bold text-xs"
            style={{ transform: [{ rotate: '-90deg' }], letterSpacing: 1 }}
          >
            {item.code}
          </Text>
        </View>

        <View className="flex-col justify-between items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} className="w-1.5 h-2.5 bg-gray-400" />
          ))}
        </View>

        <View
          className="flex-1 px-3 py-3 bg-white rounded-r-2xl"
          style={{ borderWidth: 1, borderColor: color }}
        >
          {hasImage ? (
            <View className="flex-col">
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-32 rounded-md mb-3"
                resizeMode="cover"
              />
              {Content}
            </View>
          ) : (
            Content
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#e85a4f" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="items-center justify-center py-12">
          <ActivityIndicator size="large" color="#e85a4f" />
          <Text className="text-text-muted mt-4 text-center">Đang tải...</Text>
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-text-muted mt-4 text-center">
          {viewMode === 'my'
            ? 'Bạn chưa có voucher nào'
            : 'Không tìm thấy voucher'}
        </Text>
      </View>
    );
  };

  const handleRedeemPress = (voucher: any) => {
    const userPoints = user?.points || 0;
    if (userPoints < voucher.pointsToRedeem) {
      setSelectedVoucher(voucher);
      setModalType('insufficient');
      setConfirmModalVisible(true);
      return;
    }
    setSelectedVoucher(voucher);
    setModalType('confirm');
    setConfirmModalVisible(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedVoucher) return;
    setRedeeming(true);
    try {
      await getVoucher.redeemVoucher(
        selectedVoucher.voucherId,
        user?.userId || '',
      );
      toast.show({
        type: 'success',
        text1: 'Đổi voucher thành công!',
      });
      setConfirmModalVisible(false);

      setSelectedVoucher(null);
      setPage(1);
      setHasMore(true);

      dispatch(
        setUser({
          ...user,
          points: (user?.points || 0) - selectedVoucher.pointsToRedeem,
        } as any),
      );
      loadVouchers(1, false, searchQuery, viewMode);
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      setConfirmModalVisible(false);
    } finally {
      setRedeeming(false);
    }
  };

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
      noScroll={true}
      enableRefresh={false}
    >
      <View className="flex-1 bg-background-50">
        {/* Search Input */}
        <SearchInputHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm voucher..."
        />

        {/* View Mode Toggle Buttons */}
        <View className="px-6 pb-3 flex-row gap-3">
          <TouchableOpacity
            onPress={() => setViewMode('all')}
            className={`flex-1 py-2 rounded-full border ${
              viewMode === 'all'
                ? 'bg-primary-100 border-primary-100'
                : 'bg-white border-gray-200'
            } items-center`}
          >
            <Text
              className={`font-semibold ${
                viewMode === 'all' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Tất cả Voucher
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('my')}
            className={`flex-1 py-2 rounded-full border ${
              viewMode === 'my'
                ? 'bg-primary-100 border-primary-100'
                : 'bg-white border-gray-200'
            } items-center`}
          >
            <Text
              className={`font-semibold ${
                viewMode === 'my' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Voucher của tôi
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vouchers FlatList */}
        <FlatList
          data={allVouchersData}
          keyExtractor={item => item.voucherId}
          renderItem={renderVoucher}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={handleRefresh}
        />

        {/* Redeem Confirmation Modal */}
        {modalType === 'insufficient' ? (
          <ConfirmModal
            visible={confirmModalVisible}
            title="Không đủ 🪙"
            message={`Bạn cần thêm ${(
              selectedVoucher?.pointsToRedeem - (user?.points || 0) || 0
            ).toLocaleString()} 🪙 để đổi voucher này.`}
            confirmText="Đóng"
            onConfirm={() => setConfirmModalVisible(false)}
            onCancel={() => setConfirmModalVisible(false)}
            iconName="alert-circle"
            iconColor="#e85a4f"
            showButtons
          />
        ) : (
          <ConfirmModal
            visible={confirmModalVisible}
            title="Xác nhận đổi voucher"
            message={`${selectedVoucher?.name}`}
            subMessage={`Voucher này cần ${(
              selectedVoucher?.pointsToRedeem || 0
            ).toLocaleString()} 🪙 để đổi`}
            confirmText="Xác nhận"
            cancelText="Hủy"
            onConfirm={handleConfirmRedeem}
            onCancel={() => setConfirmModalVisible(false)}
            iconName="gift"
            iconColor="#10B981"
            loading={redeeming}
            showButtons
          />
        )}
      </View>
    </SubLayout>
  );
}
