import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconIon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getProductsByUser } from '../../services/productService';
import { useIsFocused } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import MainLayout from '../../layout/MainLayout';

const RequestScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatusGroup, setSelectedStatusGroup] = useState<string>('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const auth = useAppSelector(s => s.auth);
  const isFocused = useIsFocused();

  const isMounted = useRef(true);

  const statusGroupMap: Record<string, string[]> = {
    completed: [
      'Tái chế',
      'Đã đóng gói',
      'Đã thu gom',
      'Nhập kho',
      'Đã đóng thùng',
    ],
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const userId = auth.user?.userId;
      if (!userId) {
        if (isMounted.current) setProducts([]);
        return;
      }
      const resp = await getProductsByUser(userId);
      if (isMounted.current) setProducts(Array.isArray(resp) ? resp : []);
    } catch (e) {
      console.warn('[Products] Failed to load user products', e);
      if (isMounted.current) setProducts([]);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    if (isFocused) loadProducts();
    return () => {
      isMounted.current = false;
    };
  }, [isFocused]);

  const filteredProducts = selectedStatusGroup
    ? products.filter(p => {
        const pStatus = String(p.status || '')
          .trim()
          .toLowerCase();

        if (selectedStatusGroup === 'completed') {
          return statusGroupMap.completed
            .map(s => s.toLowerCase())
            .includes(pStatus);
        }

        if (selectedStatusGroup === 'incomplete') {
          return !statusGroupMap.completed
            .map(s => s.toLowerCase())
            .includes(pStatus);
        }

        return true; // Default case for 'Tất cả'
      })
    : products;

  const openProduct = (prod: any) => {
    const pStatus = String(prod.status || '')
      .trim()
      .toLowerCase();

    if (!statusGroupMap.completed.map(s => s.toLowerCase()).includes(pStatus)) {
      navigation.navigate('DeliveryInfo', { productId: prod.productId });
    } else {
      navigation.navigate('UserNotificationDetail', {
        productId: prod.productId,
      });
    }
  };

  const statusGroupOptions = [
    { value: '', label: 'Tất cả', color: 'gray' },
    { value: 'incomplete', label: 'Chưa hoàn thành', color: 'yellow' },
    { value: 'completed', label: 'Đã hoàn thành', color: 'green' },
  ];

  const selectedOption = statusGroupOptions.find(
    opt => opt.value === selectedStatusGroup,
  );

  const renderProductStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const s = String(status).trim().toLowerCase();

    // Default to incomplete
    let label = 'Chưa hoàn thành';
    let bgClass = 'bg-amber-500';

    if (
      [
        'tái chế',
        'đã đóng gói',
        'đã thu gom',
        'nhập kho',
        'đã đóng thùng',
      ].includes(s)
    ) {
      label = 'Đã hoàn thành';
      bgClass = 'bg-green-600';
    }

    return (
      <View className={`${bgClass} px-2 py-1 rounded-lg`}>
        <Text className="text-white text-[10px] font-semibold">{label}</Text>
      </View>
    );
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-400',
      blue: 'bg-blue-500',
      yellow: 'bg-amber-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
    };
    return colorMap[color] || 'bg-gray-400';
  };

  const filterDropdown = (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setFilterDropdownOpen(!filterDropdownOpen)}
        className="flex-row items-center px-3 py-1.5 rounded-lg border border-gray-200 bg-primary-100"
      >
        <View
          className={`w-2 h-2 rounded-full mr-1.5 ${
            selectedOption?.color === 'gray'
              ? 'bg-white border border-gray-300'
              : getColorClass(selectedOption?.color || 'gray')
          }`}
        />
        <Text className="text-xs font-medium text-white mr-2">
          {selectedOption?.label || 'Tất cả'}
        </Text>
        <IconIon name="funnel-outline" size={16} color="#fff" />
      </TouchableOpacity>

      {filterDropdownOpen && (
        <>
          {/* Overlay - bấm vào đây sẽ đóng dropdown */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -1000,
              left: -1000,
              right: -1000,
              bottom: -1000,
              zIndex: 998,
            }}
            activeOpacity={1}
            onPress={() => setFilterDropdownOpen(false)}
          />

          {/* Dropdown menu */}
          <View
            className="absolute top-11 right-0 w-40 bg-white rounded-lg border border-gray-200 shadow-lg"
            style={{ zIndex: 999, elevation: 5 }}
          >
            {statusGroupOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setSelectedStatusGroup(option.value);
                  setFilterDropdownOpen(false);
                }}
                className={`flex-row items-center px-3 py-2.5 ${
                  index < statusGroupOptions.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                } ${
                  selectedStatusGroup === option.value
                    ? 'bg-gray-50'
                    : 'bg-white'
                }`}
              >
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${getColorClass(
                    option.color,
                  )}`}
                />
                <Text
                  className={`text-[13px] text-gray-700 ${
                    selectedStatusGroup === option.value
                      ? 'font-semibold'
                      : 'font-normal'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <MainLayout
      headerTitle="Yêu cầu của bạn"
      onRefresh={loadProducts}
      headerRightComponent={filterDropdown}
    >
      <View className="flex-1 bg-background-50">
        <ScrollView className="flex-1 px-4 mt-2">
          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#e85a4f" />
              <Text className="text-text-muted mt-4 text-center">
                Đang tải...
              </Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Icon name="inbox" size={64} color="#DDD" />
              <Text className="text-text-muted mt-4 text-center">
                Không có sản phẩm nào
              </Text>
            </View>
          ) : (
            filteredProducts.map((prod: any) => (
              <TouchableOpacity
                key={prod.productId}
                className="flex-row items-center bg-white border-2 border-red-200 rounded-xl p-3 mb-3 shadow-sm"
                onPress={() => openProduct(prod)}
              >
                {/* Image */}
                <View className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    source={{ uri: prod.productImages?.[0] || '' }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* Content */}
                <View className="flex-1 ml-3">
                  <Text
                    className="text-base font-semibold text-primary-100 mb-1"
                    numberOfLines={1}
                  >
                    {prod.categoryName} • {prod.brandName}
                  </Text>
                  <Text className="text-sm text-gray-600" numberOfLines={2}>
                    {prod.description}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {prod.sizeTierName}
                  </Text>
                </View>

                {/* Status Badge */}
                <View className="ml-2">
                  {renderProductStatusBadge(prod.status)}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </MainLayout>
  );
};

export default RequestScreen;
