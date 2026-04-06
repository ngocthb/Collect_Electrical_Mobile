import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconIon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getProductsByUser } from '../../services/productService';
import { useIsFocused } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import MainLayout from '../../layout/MainLayout';
import ProductCard from '../../components/ProductCard';
import SearchInputHeader from '../../components/SearchAndFilterHeader';
import {
  isCompletedStatus,
  statusGroupOptions,
  getColorClass,
  filterProductsByStatusGroup,
} from '../../utils/productHelper';

const ProductScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStatusGroup, setSelectedStatusGroup] = useState<string>('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const auth = useAppSelector(s => s.auth);
  const isFocused = useIsFocused();
  const searchTimeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  const loadProducts = async (
    pageNum: number = 1,
    append: boolean = false,
    search: string = '',
  ) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const userId = auth.user?.userId;
      if (!userId) {
        if (isMounted.current) setProducts([]);
        return;
      }
      const resp = await getProductsByUser(userId, pageNum, search);

      if (isMounted.current) {
        const newProducts = Array.isArray(resp) ? resp : [];

        if (append) {
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.productId));
            const uniqueNew = newProducts.filter(
              p => !existingIds.has(p.productId),
            );
            return [...prev, ...uniqueNew];
          });
        } else {
          setProducts(newProducts);
        }

        setHasMore(newProducts.length >= 10);
      }
    } catch (e) {
      if (isMounted.current && !append) setProducts([]);
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
      loadProducts(nextPage, true, searchQuery);
    }
  };

  const handleRefresh = async () => {
    setPage(1);
    setHasMore(true);
    await loadProducts(1, false, searchQuery);
  };

  useEffect(() => {
    isMounted.current = true;
    if (isFocused) {
      setPage(1);
      setHasMore(true);
      loadProducts(1, false, searchQuery);
    }
    return () => {
      isMounted.current = false;
    };
  }, [isFocused]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      loadProducts(1, false, searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

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

  const filterDropdown = (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setFilterDropdownOpen(!filterDropdownOpen)}
        className={`flex-row items-center px-3 py-1.5 rounded-lg border ${
          selectedStatusGroup === ''
            ? 'border-red-200 bg-white'
            : 'border-gray-200 bg-primary-100'
        }`}
      >
        <View
          className={`w-2 h-2 rounded-full mr-1.5 ${
            selectedOption?.color === 'gray'
              ? 'bg-white border border-gray-300'
              : getColorClass(selectedOption?.color || 'gray')
          }`}
        />
        <Text
          className={`text-xs font-medium mr-2 ${
            selectedStatusGroup === '' ? 'text-primary-100' : 'text-white'
          }`}
        >
          {selectedOption?.label || 'Tất cả'}
        </Text>
        <IconIon
          name="funnel-outline"
          size={16}
          color={selectedStatusGroup === '' ? '#e85a4f' : '#fff'}
        />
      </TouchableOpacity>

      {filterDropdownOpen && (
        <>
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

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#e85a4f" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && products.length === 0) {
      return (
        <View className="items-center justify-center py-12">
          <Text className="text-text-muted mt-4 text-center">Đang tải...</Text>
        </View>
      );
    }

    return (
      <View className="items-center justify-center py-12">
        <Icon name="inbox" size={64} color="#DDD" />
        <Text className="text-text-muted mt-4 text-center">
          Không có sản phẩm nào
        </Text>
      </View>
    );
  };

  const headerRightComponent = (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={() => {
          setShowSearch(!showSearch);
          if (showSearch) {
            setSearchQuery('');
          }
        }}
        className={`p-2 rounded-xl ${
          showSearch ? 'bg-gray-200' : 'bg-primary-100'
        }`}
      >
        <Icon
          name={showSearch ? 'x' : 'search'}
          size={15}
          color={showSearch ? '#6B7280' : '#fff'}
        />
      </TouchableOpacity>
      {filterDropdown}
    </View>
  );

  return (
    <MainLayout
      headerTitle="Yêu cầu của bạn"
      headerRightComponent={headerRightComponent}
      useScrollView={false}
    >
      <View className="flex-1 bg-background-50">
        {showSearch && (
          <SearchInputHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Tìm kiếm sản phẩm..."
          />
        )}
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.productId}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => openProduct(item)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      </View>
    </MainLayout>
  );
};

export default ProductScreen;
