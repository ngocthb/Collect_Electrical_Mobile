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
    grouping: ['Chờ gom nhóm'],
    collecting: ['Chờ thu gom'],
    cancelled: ['Hủy bỏ'],
    recycle: ['Tái chế', 'Đã đóng gói', 'Đã thu gom', 'Nhập kho'],
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
    ? products.filter(p =>
        statusGroupMap[selectedStatusGroup].includes(p.status),
      )
    : products;

  const openProduct = (prod: any) => {
    const status = String(prod.status || '').trim();
    let groupKey = '';
    for (const k of Object.keys(statusGroupMap)) {
      if (statusGroupMap[k].includes(status)) {
        groupKey = k;
        break;
      }
    }
    console.log(prod);
    if (groupKey === 'collecting') {
      // navigation.navigate('Delivering', { notification: prod });
      navigation.navigate('DeliveryInfo', { productId: prod.productId });
    } else if (groupKey === 'recycle') {
      navigation.navigate('UserNotificationDetail', { product: prod });
    } else if (groupKey === 'grouping') {
      navigation.navigate('DeliveryInfo', { productId: prod.productId });
      // navigation.navigate('ShipmentDetail', { notification: prod });
    } else if (groupKey === 'cancelled') {
      navigation.navigate('DeliveryInfo', { productId: prod.productId });
      // navigation.navigate('CancelledProduct', { product: prod });
    } else {
      navigation.navigate('ProductDetail', { productId: prod.productId });
    }
  };

  const statusGroupOptions = [
    { value: '', label: 'Tất cả', color: 'gray' },
    { value: 'grouping', label: 'Chờ nhóm', color: 'blue' },
    { value: 'collecting', label: 'Chờ thu gom', color: 'yellow' },
    { value: 'cancelled', label: 'Hủy bỏ', color: 'red' },
    { value: 'recycle', label: 'Tái chế', color: 'green' },
  ];

  const selectedOption = statusGroupOptions.find(
    opt => opt.value === selectedStatusGroup,
  );

  const renderProductStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const s = String(status).trim();
    let label = s;
    let bgClass = 'bg-gray-400';

    if (s === 'Chờ gom nhóm') {
      label = 'Chờ gom nhóm';
      bgClass = 'bg-blue-600';
    } else if (s === 'Chờ thu gom') {
      label = 'Chờ thu gom';
      bgClass = 'bg-amber-500';
    } else if (s === 'Hủy bỏ') {
      label = 'Hủy bỏ';
      bgClass = 'bg-red-500';
    } else if (
      ['Tái chế', 'Đã đóng gói', 'Đã thu gom', 'Nhập kho'].includes(s)
    ) {
      label = 'Tái chế';
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
    };
    return colorMap[color] || 'bg-gray-400';
  };

  const filterDropdown = (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setFilterDropdownOpen(!filterDropdownOpen)}
        className="flex-row items-center px-3 py-1.5 rounded-lg border border-gray-200 bg-secondary-100"
      >
        <View
          className={`w-2 h-2 rounded-full mr-1.5 ${getColorClass(
            selectedOption?.color || 'gray',
          )}`}
        />
        <Text className="text-[13px] font-medium text-white">
          {selectedOption?.label || 'Tất cả'}
        </Text>
        <IconIon
          name="funnel-outline"
          size={16}
          color="#fff"
          className="ml-1"
        />
      </TouchableOpacity>

      {filterDropdownOpen && (
        <View
          className="absolute top-11 right-0 w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-50"
          style={{ elevation: 5 }}
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
                selectedStatusGroup === option.value ? 'bg-gray-50' : 'bg-white'
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
      )}
    </View>
  );

  return (
    <MainLayout
      headerTitle="Yêu cầu của bạn"
      onRefresh={loadProducts}
      headerRightComponent={filterDropdown}
    >
      <View className="flex-1 bg-white">
        {/* Product List */}
        <ScrollView className="flex-1 px-4 mt-2">
          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#4169E1" />
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
                className="flex-row items-center bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm"
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
