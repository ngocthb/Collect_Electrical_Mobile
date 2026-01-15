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
import {
  isCompletedStatus,
  getStatusLabel,
  getStatusBgClass,
  statusGroupOptions,
  getColorClass,
  filterProductsByStatusGroup,
} from '../../utils/productHelper';

const ProductScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatusGroup, setSelectedStatusGroup] = useState<string>('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const auth = useAppSelector(s => s.auth);
  const isFocused = useIsFocused();

  const isMounted = useRef(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const userId = auth.user?.userId;
      if (!userId) {
        if (isMounted.current) setProducts([]);
        return;
      }
      const resp = await getProductsByUser(userId);
      console.log(resp);
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
  }, []);

  const filteredProducts = filterProductsByStatusGroup(
    products,
    selectedStatusGroup,
  );

  const openProduct = (prod: any) => {
    if (!isCompletedStatus(prod.status)) {
      navigation.navigate('ProductDetails', { productId: prod.productId });
    } else {
      navigation.navigate('Timeline', {
        productId: prod.productId,
      });
    }
  };

  const selectedOption = statusGroupOptions.find(
    opt => opt.value === selectedStatusGroup,
  );

  const renderProductStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const label = getStatusLabel(status);
    const bgClass = getStatusBgClass(status);

    return (
      <View className={`${bgClass} px-2 py-1 rounded-lg`}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text className="text-white text-[10px] font-semibold">{label}</Text>
        </View>
      </View>
    );
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

  console.log('Rendered ProductScreen', filteredProducts);
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
                activeOpacity={0.7}
              >
                {/* Image */}
                <View className="w-16 h-16 rounded-lg overflow-hidden bg-red-200">
                  <Image
                    source={{ uri: prod.productImages?.[0] }}
                    style={{ width: 64, height: 64 }}
                    resizeMode="cover"
                  />
                  <Text>{prod.productImages?.[0] ? '✅' : '❌'}</Text>
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

export default ProductScreen;
