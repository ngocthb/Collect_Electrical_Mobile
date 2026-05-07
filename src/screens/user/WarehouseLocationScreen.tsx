import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconIon from 'react-native-vector-icons/Ionicons';

import { useNavigation } from '@react-navigation/native';
import toast from 'react-native-toast-message';

import SubLayout from '../../layout/SubLayout';
import SearchInputHeader from '../../components/SearchAndFilterHeader';
import { Warehouse } from '../../types/Warehouse';
import { getWarehouses } from '../../services/warehouseService';

import {
  checkAndRequestLocationPermission,
  calculateDistance,
  getCurrentLocation,
} from '../../services/mapboxService';

const WarehouseLocationScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  const [warehousesWithDistance, setWarehousesWithDistance] = useState<
    Warehouse[]
  >([]);
  const [selectedDistanceFilter, setSelectedDistanceFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedWarehouseId, setExpandedWarehouseId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const loadMoreRef = useRef(false);

  const distanceFilterOptions = [
    { value: 'all', label: 'Tất cả', color: 'gray', min: 0, max: Infinity },
    { value: '0-5', label: '0 - 5 km', color: 'green', min: 0, max: 5000 },
    { value: '5-10', label: '5 - 10 km', color: 'blue', min: 5000, max: 10000 },
    {
      value: '10-15',
      label: '10 - 15 km',
      color: 'yellow',
      min: 10000,
      max: 15000,
    },
    { value: '15+', label: '15 km+', color: 'red', min: 15000, max: Infinity },
  ];

  const loadWarehouses = async (
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
      const granted = await checkAndRequestLocationPermission();
      if (!granted) {
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Quyền truy cập vị trí bị từ chối',
        });
        return;
      }

      const response = await getWarehouses(pageNum, search);
      const [longitude, latitude] = await getCurrentLocation();

      let warehouse = response.data.map(wh => ({
        ...wh,
        distanceMeters: calculateDistance(
          latitude,
          longitude,
          wh.latitude,
          wh.longitude,
        ),
      }));

      warehouse = warehouse.sort((a, b) => {
        if (sortOrder === 'asc') {
          return (a.distanceMeters || 0) - (b.distanceMeters || 0);
        } else {
          return (b.distanceMeters || 0) - (a.distanceMeters || 0);
        }
      });

      if (isMounted.current) {
        if (append) {
          setWarehousesWithDistance(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = warehouse.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setWarehousesWithDistance(warehouse);
        }

        setHasMore(pageNum < response.totalPages);
        loadMoreRef.current = false;
      }
    } catch (error) {
      console.warn('Error loading warehouses:', error);
      if (isMounted.current && !append)
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải địa điểm',
        });
      loadMoreRef.current = false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  const loadMore = () => {
    if (loadMoreRef.current) return;
    if (!loadingMore && !loading && hasMore) {
      loadMoreRef.current = true;
      const nextPage = page + 1;
      setPage(nextPage);
      loadWarehouses(nextPage, true, searchQuery);
    }
  };

  const handleRefresh = async () => {
    setPage(1);
    setHasMore(true);
    await loadWarehouses(1, false, searchQuery);
  };

  useEffect(() => {
    isMounted.current = true;
    setPage(1);
    setHasMore(true);
    loadWarehouses(1, false, searchQuery);
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      loadWarehouses(1, false, searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [selectedDistanceFilter, sortOrder]);

  const selectedDistanceOption = distanceFilterOptions.find(
    d => d.value === selectedDistanceFilter,
  );
  let filteredWarehouses = warehousesWithDistance.filter(wh => {
    const distance = wh.distanceMeters || 0;
    return (
      distance >= selectedDistanceOption!.min &&
      distance <= selectedDistanceOption!.max
    );
  });

  filteredWarehouses = [...filteredWarehouses].sort((a, b) => {
    if (sortOrder === 'asc') {
      return (a.distanceMeters || 0) - (b.distanceMeters || 0);
    } else {
      return (b.distanceMeters || 0) - (a.distanceMeters || 0);
    }
  });

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#e85a4f" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && warehousesWithDistance.length === 0) {
      return (
        <View className="items-center justify-center py-12">
          <Text className="text-gray-500 mt-4 text-center">Đang tải...</Text>
        </View>
      );
    }

    return (
      <View className="items-center justify-center py-12">
        <Icon name="inbox" size={64} color="#DDD" />
        <Text className="text-gray-500 mt-4 text-center">
          Không có địa điểm nào
        </Text>
      </View>
    );
  };

  const renderWarehouseCard = ({ item: wh }: { item: Warehouse }) => (
    <View
      key={wh.id}
      className="bg-white border-2 border-red-200 rounded-xl p-4 mb-3 shadow-sm mx-4"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-primary-100 mb-1">
            {wh.name}
          </Text>
          <View className="flex-row items-center">
            <Icon name="clock" size={12} color="#6B7280" />

            <Text className="text-sm text-gray-600 ml-1 mr-2">
              {wh.openTime}
            </Text>
            <Icon name="minus" size={12} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1 ">
              {((wh.distanceMeters || 0) / 1000).toFixed(0)} km
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={async () => {
            try {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${wh.latitude},${wh.longitude}`;
              const supported = await Linking.canOpenURL(url);
              await Linking.openURL(url);
            } catch (e) {
              console.warn('Cannot open maps', e);
            }
          }}
          className="w-10 h-10 rounded-full items-center justify-center bg-primary-100 border-2 border-red-200 ml-2"
        >
          <Icon name="navigation" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {wh.acceptedCategories && wh.acceptedCategories.length > 0 && (
        <View className="border-t border-gray-200 pt-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-semibold text-gray-700">
              Danh mục chấp nhận ({wh.acceptedCategories.length}):
            </Text>
            {wh.acceptedCategories.length > 3 && (
              <TouchableOpacity
                onPress={() =>
                  setExpandedWarehouseId(
                    expandedWarehouseId === wh.id ? null : wh.id,
                  )
                }
                className="p-1"
              >
                <Icon
                  name={
                    expandedWarehouseId === wh.id
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={16}
                  color="#3b82f6"
                />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row flex-wrap gap-1.5 mb-2">
            {wh.acceptedCategories.slice(0, 3).map((category: any) => (
              <View
                key={category.id}
                className="bg-blue-100 rounded-full px-2.5 py-1"
              >
                <Text className="text-xs text-blue-700 font-medium">
                  {category.name}
                </Text>
              </View>
            ))}
          </View>

          {expandedWarehouseId === wh.id && (
            <View className="flex-row flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
              {wh.acceptedCategories.slice(3).map((category: any) => (
                <View
                  key={category.id}
                  className="bg-blue-100 rounded-full px-2.5 py-1"
                >
                  <Text className="text-xs text-blue-700 font-medium">
                    {category.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const headerRightComponent = (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="flex-row items-center px-3 py-1.5 rounded-lg border border-gray-200 bg-white"
      >
        <Icon
          name={sortOrder === 'asc' ? 'chevrons-up' : 'chevrons-down'}
          size={14}
          color="#e85a4f"
        />
      </TouchableOpacity>

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

      <View className="relative">
        <TouchableOpacity
          onPress={() => {
            if (selectedDistanceFilter !== 'all') {
              setSelectedDistanceFilter('all');
              setFilterDropdownOpen(false);
            } else {
              setFilterDropdownOpen(!filterDropdownOpen);
            }
          }}
          className={`flex-row items-center px-3 py-1.5 rounded-lg border ${
            selectedDistanceFilter === 'all'
              ? 'border-red-200 bg-white'
              : 'border-gray-200 bg-primary-100'
          }`}
        >
          <View
            className={`w-2 h-2 rounded-full mr-1.5 ${
              selectedDistanceFilter === 'all'
                ? 'bg-white border border-gray-300'
                : 'bg-white'
            }`}
          />
          <Text
            className={`text-xs font-medium mr-2 ${
              selectedDistanceFilter === 'all'
                ? 'text-primary-100'
                : 'text-white'
            }`}
          >
            {distanceFilterOptions.find(d => d.value === selectedDistanceFilter)
              ?.label || 'Tất cả'}
          </Text>
          <IconIon
            name="funnel-outline"
            size={16}
            color={selectedDistanceFilter === 'all' ? '#e85a4f' : '#fff'}
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

         
            <View
              className="absolute top-11 right-0 w-40 bg-white rounded-lg border border-gray-200 shadow-lg"
              style={{ zIndex: 999, elevation: 5 }}
            >
              {distanceFilterOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setSelectedDistanceFilter(option.value);
                    setFilterDropdownOpen(false);
                  }}
                  className={`flex-row items-center px-3 py-2.5 ${
                    index < distanceFilterOptions.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  } ${
                    selectedDistanceFilter === option.value
                      ? 'bg-gray-50'
                      : 'bg-white'
                  }`}
                >
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      option.color === 'gray'
                        ? 'bg-gray-300'
                        : option.color === 'green'
                        ? 'bg-green-500'
                        : option.color === 'blue'
                        ? 'bg-blue-500'
                        : option.color === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <Text
                    className={`text-[13px] text-gray-700 ${
                      selectedDistanceFilter === option.value
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
    </View>
  );
  return (
    <SubLayout
      title="Địa điểm thu gom"
      onBackPress={() => navigation.goBack()}
      rightComponent={headerRightComponent}
      noScroll={true}
      enableRefresh={false}
    >
      <View className="flex-1 bg-background-50">
        {showSearch && (
          <SearchInputHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Tìm kiếm địa điểm..."
          />
        )}
        <FlatList
          data={filteredWarehouses}
          keyExtractor={item => item.id}
          renderItem={renderWarehouseCard}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      </View>
    </SubLayout>
  );
};

export default WarehouseLocationScreen;
